// const express = require('express');
// const user = express();
const jsonwebtoken = require('jsonwebtoken');
const successHandler = require('../responseHandler').successHandler;
const errorHandler = require('../responseHandler').errorHandler;
const userModel = require('../../Models/models').user;
const witnessModel = require('../../Models/models').witness;
const bookModel = require('../../Models/models').bookAppintment;
const hashPassword = require('../../helpFunctions').hashPassword;
const comparePassword = require('../../helpFunctions').comparePassword;
const status = require('../../config').statusEnum;
const fs = require('fs');
const jwt = require('../../jwtValidation');
const path = require('path')
const Url = require('url');


let dataImages = fs.readdirSync('Media');

const getAll = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        /*without token, password*/
        const userFind = await userModel.find({status: status.ACTIVE}, {password: 0});
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const disable = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userId = req.query.userId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        const userFind = await userModel.updateOne({_id: userId, status: status.ACTIVE}, {$set: {disabled: true}});
        if (userFind.nModified === 0) {
            let err = {};
            err.message = "this user is not find!"
            return errorHandler(res, err);
        }
        res.message = "user is disabled!"
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const able = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userId = req.query.userId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        const userFind = await userModel.updateOne({_id: userId, status: status.ACTIVE}, {$set: {disabled: false}});
        if (userFind.nModified === 0) {
            let err = {};
            err.message = "this user is not find!"
            return errorHandler(res, err);
        }
        res.message = "user is abled!"
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// const log = async (req,res) => {
//     try {
//         const token = req.authorization || req.headers['authorization'];
//         const decodeToken = await jsonwebtoken.decode(token);
//         const userFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false}, {password: 0});
//         userFind.avatar = req.url + '/' + userFind.avatar
//         userFind.save()
//         return successHandler(res, userFind);
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }

// validate.validateRegister, upload

const register = async (req,res) => {
    try {
        let body = req.body;
        let fullUrl = req.protocol + '://' + req.get('host');
        if(req.file) {
            body.avatar =  fullUrl + '/' + req.file.filename;
        }
        const hash = await hashPassword(body.password);
        body.password = hash;
        const userCreate = await userModel.create(body);
        return successHandler(res, userCreate);
    } catch (err) {
        if (req.file) {
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
        const userFindByEmail = await userModel.findOne({email: email, status: status.ACTIVE});
        const witnessFindByEmail = await witnessModel.findOne({email: email, status: status.ACTIVE});
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
            const user = await userModel.findOne({email: email, status: status.ACTIVE}, {password: 0})
            const jwtToken = await jwt.jwtToken(tok);
            respObj = {
                Data: user,
                Token: jwtToken
            }
            res.message = 'User'
        } else {
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
            const witness = await witnessModel.findOne({email: email, status: status.ACTIVE}, {password: 0})
            const jwtToken = await jwt.jwtToken(tok);
            respObj = {
                Data: witness,
                Token: jwtToken
            }
            res.message = 'Witness'
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
            const userFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false});
            if (dataImages.includes(userFind.avatar)) {
                let index = dataImages.indexOf(userFind.avatar)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        const userUpdate = await userModel.updateOne({_id:decodeToken.data.id}, body);
        res.message = `This (${decodeToken.data.id}) user updated successfully!`
        return successHandler(res, userUpdate);
    } catch (err) {
        return errorHandler(res, err)
    }
}


const remove = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false});
        if (dataImages.includes(userFind.avatar)) {
            let index = await dataImages.indexOf(userFind.avatar)
            let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
        }
        const userDelete = await userModel.updateOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false}, {
            $set: {status: status.DELETE}
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
        const userFind = await userModel.findOne({_id: witnessId, status: status.ACTIVE, disabled: false});
        if (!userFind) {
            let err = {};
            err.message = 'This user are disabled!';
            return errorHandler(res, err);
        }
        const witnessUpdate = await witnessModel.updateOne({_id: witnessId, status: status.ACTIVE, disabled: false}, {
            $push: {rates: rateObj}
        });
        if (witnessUpdate.nModified !== 0) {
            const witnessRatingFind = await witnessModel.findById(witnessId);
            let rate = 0;
            let length = 0;
            const Rate = await witnessRatingFind.rates.map(item => {
                rate += item.star
                length += 1;
            })
            witnessRatingFind.rating = Math.round(rate/length)
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


const review = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const {witnessId} = req.query.witnessId;
        const review = req.body.review
        let reviewObj = {
            user: decodeToken.data.id,
            message: review
        }
        const userFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false});
        if (!userFind) {
            let err = {};
            err.message = 'This user are disabled!';
            return errorHandler(res, err);
        }
        const witnessUpdate = await witnessModel.updateOne({_id: witnessId, status: status.ACTIVE, disabled: false}, {
            $push: {reviews: reviewObj}
        });
        if (witnessUpdate.nModified === 0) {
            let err = {}
            err.message = "Don't find this witness!"
            return errorHandler(res, err)
        }

        return successHandler(res, reviewObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getBooks = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAppointments = await bookModel.find({user: decodeToken.data.id, status: status.ACTIVE});
        return successHandler(res, findAppointments);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const admin = async (req, res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const chooseAdmin = await userModel.updateOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false}, {$set: {role_admin: true}});
        if (chooseAdmin.nModified === 0) {
            let err = {};
            err.message = 'This user is not find!';
            return errorHandler(res, err);
        }
        res.message = "user is convert to admin!";
        return successHandler(res, chooseAdmin)
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getReview = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const {getReview} = req.query.getReview;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        const findReviewUser = await userModel.findOne({_id: getReview, status: status.ACTIVE})
        if (!findReviewUser) {
            const findReviewWitness = await witnessModel.findOne({_id: getReview, status: status.ACTIVE})
            if (!findReviewWitness) {
                let err = {}
                err.message = "Don't find user and witness"
                return errorHandler(res, err);
            }
            return successHandler(res, findReviewWitness.reviews)
        }
        return successHandler(res, findReviewUser.reviews)
    } catch (err) {
        return errorHandler(res, err)
    }
}


module.exports = {
    getAll,
    getBooks,
    getReview,
    able,
    disable,
    rate,
    review,
    remove,
    register,
    login,
    admin,
    update
}