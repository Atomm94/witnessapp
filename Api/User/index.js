const fs = require('fs');
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('../../Auth/jwtValidation');
const Models = require('../../Models/models');
const { status } = require('../../config');
const { successHandler, errorHandler } = require('../../Helper/responseHandler');
const { hashPassword, comparePassword } = require('../../Helper/helpFunctions');
const Url = require('url');
let dataImages;

/** Register, Login, Change Profile, Change Password **/

// validate.validateRegister, upload

const register = async (req,res) => {
    try {
        let body = req.body;
        dataImages = fs.readdirSync('Media');
        let fullUrl = req.protocol + '://' + req.get('host');
        if(req.file) {
            body.avatar =  fullUrl + '/' + req.file.filename;
        }
        const hash = await hashPassword(body.password);
        body.password = hash;
        const userCreate = await Models.user.create(body);
        return successHandler(res, userCreate);
    } catch (err) {
        if (req.file) {
        dataImages = fs.readdirSync('Media');
            if (dataImages.includes(req.file.filename)) {
                let index = dataImages.indexOf(req.file.filename)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        return errorHandler(res, err);
    }
}

const login = async (req,res) => {
    const {email, password} = req.body;
    try {
        const userFindByEmail = await Models.user.findOne({email: email, delete: false});
        const witnessFindByEmail = await Models.witness.findOne({email: email, delete: false});
        const adminFindByEmail = await Models.admin.findOne({email: email, delete: false});
        let respObj = {};
        if(userFindByEmail) {
            const compare = await comparePassword(password, userFindByEmail.password);
            if (!compare) {
                let err = {};
                err.message = 'Password is not correct!';
                return errorHandler(res, err);
            }
            let tok = {
                id: userFindByEmail._id,
                email: userFindByEmail.email
            }
            const user = await Models.user.findOne({email: email, delete: false}, {password: 0})
            const jwtToken = await jwt.jwtToken(tok);
            respObj = {
                Data: user,
                Token: jwtToken
            }
            res.message = 'user'
        } else if(witnessFindByEmail) {
            const compare = await comparePassword(password, witnessFindByEmail.password);
            if (!compare) {
                let err = {};
                err.message = 'Password is not correct!';
                return errorHandler(res, err);
            }
            let tok = {
                id: witnessFindByEmail._id,
                email: witnessFindByEmail.email
            }
            const witness = await Models.witness.findOne({email: email, delete: false}, {password: 0})
            const jwtToken = await jwt.jwtToken(tok);
            respObj = {
                Data: witness,
                Token: jwtToken
            }
            res.message = 'witness'
        } else {
            const compare = await comparePassword(password, adminFindByEmail.password);
            if (!compare) {
                let err = {};
                err.message = 'Password is not correct!';
                return errorHandler(res, err);
            }
            let tok = {
                id: adminFindByEmail._id,
                email: adminFindByEmail.email
            }
            const witness = await Models.admin.findOne({email: email, delete: false}, {password: 0})
            const jwtToken = await jwt.jwtToken(tok);
            respObj = {
                Data: witness,
                Token: jwtToken
            }
            res.message = 'admin'
        }
       return successHandler(res, respObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// upload
const update = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        let body = req.body;
        body.updatedAt = Date.now();
        if (req.body.password) {
            const newHash = await hashPassword(req.body.password);
            req.body.password = newHash
        }
        if (req.file) {
            let fullUrl = req.protocol + '://' + req.get('host');
            if(req.file) {
                body.avatar =  fullUrl + '/' + req.file.filename;
            }
            const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
            if (dataImages.includes(userFind.avatar)) {
                let index = dataImages.indexOf(userFind.avatar)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        const userUpdate = await Models.user.updateOne({_id:decodeToken.data.id}, body);
        const userData = await Models.user.findOne({_id: decodeToken.data.id});
        res.message = `This (${decodeToken.data.id}) user updated successfully!`
        return successHandler(res, userData);
    } catch (err) {
        return errorHandler(res, err)
    }
}

const changePassword = async (req,res) => {
    try {
        let {password, retypePassword} = req.body;
        if (password !== retypePassword) {
            let err = {};
            err.message = "password & retype password is not match!";
            return errorHandler(res, err);
        }
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const newHash = await hashPassword(password);
        password = newHash
        const userUpdate = await Models.user.updateOne({_id: decodeToken.data.id, delete: false, disabled: false}, {
            $set: {password: password}
        });
        res.message = "Password is changed successfully!";
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

//------------------------------------------------------------


const remove = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        dataImages = fs.readdirSync('Media');
        if (dataImages.includes(userFind.avatar)) {
            let index = await dataImages.indexOf(userFind.avatar)
            let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
        }
        res.message = "This user is removed"
        const userDelete = await Models.user.updateOne({_id: decodeToken.data.id, delete: false, disabled: false}, {
            $set: {delete: true}
        });
        return successHandler(res, userDelete);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// validate.validateRate,

const rate = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const {witnessId, star} = req.query;
        let rateObj = {
            user: decodeToken.data.id,
            star: star
        }
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        if (!userFind) {
            let err = {};
            err.message = 'This user are disabled!';
            return errorHandler(res, err);
        }
        const witnessUpdate = await Models.witness.updateOne({_id: witnessId, delete: false, disabled: false}, {
            $push: {rates: rateObj}
        });
        if (witnessUpdate.nModified !== 0) {
            const witnessRatingFind = await Models.witness.findById(witnessId);
            let rate = 0;
            let length = 0;
            const Rate = await witnessRatingFind.rates.map(item => {
                rate += item.star
                length += 1;
            })
            witnessRatingFind.rating = Math.round(rate/length)
            await witnessRatingFind.save();
            return successHandler(res, witnessRatingFind.rating);
        } else {
            let err = {}
            err.message = "Don't find this witness!"
            return errorHandler(res, err)
        }

    } catch (err) {
        return errorHandler(res, err);
    }
}

const uploadDocs = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        let names = [];
        req.files.map(file => {
            names.push(file.filename)
        })
        const findWitness = await Models.user.updateOne({_id: decodeToken.data.id, delete: false}, {
            $set: {documents: names}
        });
        if(findWitness.nModified === 0) {
            let err = {};
            err.message = "User is not find!";
            return errorHandler(res, err);
        }
        res.message = "You are upload documents!";
        return successHandler(res, findWitness)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getBooks = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAppointments = await Models.book.find({user: decodeToken.data.id, delete: false});
        return successHandler(res, findAppointments);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAppointment = async (req,res) => {
    try {
        const orderId = req.query.orderId;
        const getOrder = await Models.book.findOne({_id: orderId, delete: false})
            .populate('user', ['avatar', 'firstName', 'lastName', 'rating']);
        if(!getOrder) {
            let err = {};
            err.message = "Order is not find!";
            return errorHandler(res, err);
        }
        return successHandler(res, getOrder);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getMessages = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const chatId = req.query.chatId;
        const findChat = await Models.chat.findOne({
            $and: [
                {_id: chatId},
                {$or: [{firstUserId: decodeToken.data.id}, {secondUserId: decodeToken.data.id}]}
            ]
        });
        if (!findChat) {
            let err = {};
            err.message = "Chat is not find!";
            return errorHandler(res, err);
        }
        res.message = `All messages on this chat ${findChat._id}`;
        return successHandler(res, findChat.messages);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const findNearestWitness = async (req, res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const { long, lat } = req.query;
        let err = {};
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        if (!userFind) {
            err.message = "User is not find!";
            return errorHandler(res, err);
        }
        const findNearestWitness = await Models.witness.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type : "Point",
                        coordinates : [+long, +lat]
                    },
                    $maxDistance: 4000
                }
            }
        }).select({firstName: 1, lastName: 1, phoneNumber: 1, carNumber: 1, carModel: 1, carColor: 1})
        if (!findNearestWitness.length) {
            err.message = "no witness available now!"
            return errorHandler(res, err);
        }
        return successHandler(res, findNearestWitness);
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    getBooks,
    getAppointment,
    uploadDocs,
    rate,
    remove,
    register,
    login,
    update,
    getMessages,
    changePassword,
    findNearestWitness
}