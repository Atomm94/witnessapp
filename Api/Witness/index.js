const fs = require('fs');
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');
const Models = require('../../Models/models');
const { bookStatus, workStatus, driverStatus } = require('../../Helper/constant');
const { successHandler, errorHandler } = require('../../Helper/responseHandler');
const { hashPassword, comparePassword } = require('../../Helper/helpFunctions');
const validate = require('./validation');
const multer = require('multer');
const uploadImage = require('../../Helper/uploadFile');
const jwt = require('../../Auth/jwtValidation');
let dataImages;

/** Register, Login, Change Profile, Change Password **/

// validate.validateRegister, upload

const register = async (req,res) => {
    try {
        let body = req.body;
        dataImages = fs.readdirSync('Media');
        let fullUrl = req.protocol + '://' + req.get('host');
        if(req.file) {
            body.avatar = fullUrl + '/' + req.file.filename;
        }
        const hash = await hashPassword(body.password);
        body.password = hash;
        body.retypePassword = body.password;
        const userCreate = await Models.witness.create(body);
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
            const witnessFind = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
            if (dataImages.includes(witnessFind.avatar)) {
                let index = dataImages.indexOf(witnessFind.avatar)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        const witnessUpdate = await Models.witness.updateOne({_id:decodeToken.data.id, delete: false, disabled: false}, body);
        const witnessData = await Models.witness.findOne({_id: decodeToken.data.id});
        res.message = `This (${decodeToken.data.id}) witness updated successfully!`
        return successHandler(res, witnessData);
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
        const userUpdate = await Models.witness.updateOne({_id: decodeToken.data.id, delete: false, disabled: false}, {
            $set: {password: password}
        });
        res.message = "Password is changed successfully!";
        return successHandler(res, null)
    } catch (err) {
        return errorHandler(res, err);
    }
}

// ---------------------------------------------------------------------

const remove = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessFind = await Models.witness.findOne({_id: decodeToken.data.id, delete: false});
        dataImages = fs.readdirSync('Media');
        if (dataImages.includes(witnessFind.avatar)) {
            let index = await dataImages.indexOf(witnessFind.avatar)
            let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
        }
        res.message = "This witness is removed"
        const witnessDelete = await Models.witness.updateOne({_id: decodeToken.data.id, disabled: false}, {$set: {delete: true}});
        return successHandler(res, witnessDelete);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// validate.validateRate
const rate = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const {userId, star} = req.query;
        let rateObj = {
            witness: decodeToken.data.id,
            star: star
        }
        const userUpdate = await Models.user.updateOne({_id: userId, delete: false, disabled: false}, {$push: {rates: rateObj}});
        if (userUpdate) {
            const userRatingFind = await Models.user.findById(userId);
            let rate = 0;
            let length = 0;
            const Rate = await userRatingFind.rates.map(item => {
                rate += item.star
                length += 1;
            })
            userRatingFind.rating = Math.round(rate/length)
            return successHandler(res, userRatingFind.rating);
        } else {
            let err = {}
            err.message = "Don't find this user!"
            return errorHandler(res, err)
        }
    } catch (err) {
        return errorHandler(res, err);
    }
}

// uploadDocs
const uploadDocs = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        let names = [];
        req.files.map(file => {
            names.push(file.filename)
        })
        const findWitness = await Models.witness.updateOne({_id: decodeToken.data.id, delete: false, disabled: false}, {
            $set: {documents: names}
        });
        if(findWitness.nModified === 0) {
            let err = {};
            err.message = "Witness is not find!";
            return errorHandler(res, err);
        }
        res.message = "You are upload documents!";
        return successHandler(res, findWitness)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const downloadDoc = async (req, res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findUserDocs = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false})
            .select('documents')
        if(!findUserDocs) {
            let err = {};
            err.message = 'Documents is not find!';
            return errorHandler(res, err);
        }
       // console.log(findUserDocs.documents)
        findUserDocs.documents.map(item => {
            res.download(path.join(__dirname, '../../Media', 'Documents', `${item}`));
        })
       // return successHandler(res, findUserDocs);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAppointment = async (req,res) => {
    try {
        const orderId = req.query.orderId;
        const getOrder = await Models.book.findOne({_id: orderId, delete: false, bookStatus: bookStatus.ACCEPT})
            .populate('witness', ['avatar', 'firstName', 'lastName', 'rating']);
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

const getDocument = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findDocs = await Models.witnessDocument.findOne({witness: decodeToken.data.id, delete: false});
        return successHandler(res, findDocs);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const showLocation = async (req, res) => {
    try {
        const { long, lat } = req.body;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        let loc = {
            type: 'Point',
            coordinates: [long, lat]
        }
        const createWitnessLocation = await Models.witness.updateOne({_id: decodeToken.data.id, delete: false}, {
            $set: {location: loc, updatedAt: Date.now()}
        })
        if (createWitnessLocation.nModified === 0) {
            let err = {};
            err.message = "Witness is not find!";
            return errorHandler(res, err);
        }
        res.message = "You are show your location successfully!";
        return successHandler(res, loc)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const acceptBook = async (req, res) => {
    try {
        let err = {};
        let { bookId } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findWitness = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false, driverStatus: driverStatus.FREE});
        if (!findWitness) {
            err.message = "Witness is busy or is not find!";
            return errorHandler(res, err);
        }
        const acceptBook = await Models.book.updateOne({_id: bookId, delete: false, bookStatus: bookStatus.NON_ACCEPTED}, {
            $set: {bookStatus: bookStatus.ACCEPT, witness: decodeToken.data.id, updatedAt: Date.now()}
        })
        if (!acceptBook) {
            err.message = "This book is not find!";
            return errorHandler(res, err);
        }
        await Models.witness.updateOne({_id: decodeToken.data.id}, {
            $set: {driverStatus: driverStatus.BUSY}, $push: {bookings: bookId}
        })
        res.message = "This witness accept this booking!";

        return successHandler(res, null);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const startWork = async (req, res) => {
    try {
        let err = {};
        let { bookId } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findWitness = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false, driverStatus: driverStatus.FREE});
        if (!findWitness) {
            err.message = "Witness is busy or is not find!";
            return errorHandler(res, err);
        }
        const startWork = await Models.book.updateOne({_id: bookId, delete: false, bookStatus: bookStatus.ACCEPT, workStatus: workStatus.NON_STARTED}, {
            $set: {workStatus: workStatus.START, updatedAt: Date.now()}
        })
        if (!startWork) {
            err.message = "This book is not accepted, canceled or already started or is not find!";
            return errorHandler(res, err);
        }
        res.message = "This witness start this work!";
        return successHandler(res, null);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const endWork = async (req, res) => {
    try {
        let err = {};
        let { bookId } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findWitness = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false, driverStatus: driverStatus.BUSY});
        if (!findWitness) {
            err.message = "Witness is not busy or is not find!";
            return errorHandler(res, err);
        }
        const endWork = await Models.book.updateOne({_id: bookId, delete: false, bookStatus: bookStatus.ACCEPT, workStatus: workStatus.START}, {
            $set: {workStatus: workStatus.END, updatedAt: Date.now()}
        })
        if (!endWork) {
            err.message = "This book is not find!";
            return errorHandler(res, err);
        }
        await Models.witness.updateOne({_id: decodeToken.data.id}, {
            $set: {driverStatus: driverStatus.FREE}
        })
        res.message = "This witness end this work!";
        return successHandler(res, null);
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    register,
    getAppointment,
    getDocument,
    uploadDocs,
    downloadDoc,
    update,
    remove,
    rate,
    changePassword,
    showLocation,
    acceptBook,
    startWork,
    endWork
   // cancelBook
}