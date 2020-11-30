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
//const validate = require('./validation');
//const multer = require('multer');
const status = require('../../config').statusEnum;
//const uploadImage = require('../../uploadFile');
const fs = require('fs');
const jwt = require('../../jwtValidation');

//const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
let dataImages = fs.readdirSync('Media');

const getAll = async (req,res) => {
    try {
        const id = req.query.id;
        const adminFind = await userModel.findOne({_id: id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        /*without token, password*/
        const userFind = await userModel.find({status: status.ACTIVE}, {password: 0, token: 0});
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const disable = async (req,res) => {
    try {
        const {id, userId} = req.query;
        const adminFind = await userModel.findOne({_id: id, status: status.ACTIVE, role_admin: true});
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
        const {id, userId} = req.query;
        const adminFind = await userModel.findOne({_id: id, status: status.ACTIVE, role_admin: true});
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

const log = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        console.log(decodeToken)
        const userFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false}, {password: 0});
        return successHandler(res, userFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// validate.validateRegister, upload

const register = async (req,res) => {
    try {
        let body = req.body;
        if(req.file) {
            body.avatar = req.file.filename;
        }
        const hash = await hashPassword(body.password);
        body.password = hash;
        const userCreate = await userModel.create(body);
        return successHandler(res, userCreate);
    } catch (err) {
        console.log(err);
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
        let respObj = {
            Data: user,
            Token: jwtToken
        }
        res.message = 'User'
       return successHandler(res, respObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// upload
const update = async (req,res) => {
    try {
        let query = req.query.id;
        let body = req.body;
        if (req.body.password) {
            const newHash = await hashPassword(req.body.password);
            req.body.password = newHash
        }
        if (req.file) {
            body.avatar = req.file.filename
            const userFind = await userModel.findOne({_id: query, status: status.ACTIVE, disabled: false});
            if (dataImages.includes(userFind.avatar)) {
                let index = dataImages.indexOf(userFind.avatar)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        const userUpdate = await userModel.updateOne({_id:query}, body);
        return successHandler(res, userUpdate);
    } catch (err) {
        return errorHandler(res, err)
    }
}


const remove = async (req,res) => {
    try {
        let query = req.query.id;
        const userFind = await userModel.findOne({_id: query, status: status.ACTIVE, disabled: false});
        if (dataImages.includes(userFind.avatar)) {
            let index = await dataImages.indexOf(userFind.avatar)
            let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
        }
        const userDelete = await userModel.updateOne({_id: query, status: status.ACTIVE, disabled: false}, {
            $set: {status: status.DELETE, token: null}
        });
        return successHandler(res, userDelete);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// validate.validateRate,

const rate = async (req,res) => {
    try {
        const {id, witnessId, star} = req.query;
        let rateObj = {
            user: id,
            star: star
        }
        const userFind = await userModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
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
        const {id, witnessId} = req.query;
        const review = req.body.review
        let reviewObj = {
            user: id,
            message: review
        }
        const userFind = await userModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
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
        const id = req.query.id;
        const findAppointments = await bookModel.find({user: id, status: status.ACTIVE});
        return successHandler(res, findAppointments);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const admin = async (req, res) => {
    try {
        const id = req.query.id;
        const chooseAdmin = await userModel.updateOne({_id: id, status: status.ACTIVE, disabled: false}, {$set: {role_admin: true}});
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
        const {id, getReview} = req.query;
        const adminFind = await userModel.findOne({_id: id, status: status.ACTIVE, role_admin: true});
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
    log,
    admin,
    update
}