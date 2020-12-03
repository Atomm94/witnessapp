const express = require('express');
const witness = express();
const jsonwebtoken = require('jsonwebtoken');
const successHandler = require('../responseHandler').successHandler;
const errorHandler = require('../responseHandler').errorHandler;
const witnessModel = require('../../Models/models').witness;
const userModel = require('../../Models/models').user;
const bookModel = require('../../Models/models').bookAppointment;
const documentModel = require('../../Models/models').witnessDocument;
const hashPassword = require('../../helpFunctions').hashPassword;
const comparePassword = require('../../helpFunctions').comparePassword;
const validate = require('./validation');
const status = require('../../config').statusEnum;
const multer = require('multer');
const uploadImage = require('../../uploadFile');
const fs = require('fs');
const jwt = require('../../jwtValidation');

// const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
// const uploadDocs = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).array('documents', 4);
//let dataDocuments = fs.readdirSync('Media/PDF');
let dataImages = fs.readdirSync('Media');

const getAll = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!"
            return errorHandler(res, err);
        }
        /*without token, password*/
        const witnessFind = await witnessModel.find({status: status.ACTIVE}, {password: 0});
        return successHandler(res, witnessFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const disable = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessId = req.query.witnessId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        const witnessFind = await witnessModel.updateOne({_id: witnessId, status: status.ACTIVE}, {$set: {disabled: true}});
        if (witnessFind.nModified === 0) {
            let err = {};
            err.message = "this witness is not find!"
            return errorHandler(res, err);
        }
        res.message = "witness is disabled!"
        return successHandler(res, witnessFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const able = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessId = req.query.witnessId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        const witnessFind = await witnessModel.updateOne({_id: witnessId, status: status.ACTIVE}, {$set: {disabled: false}});
        if (witnessFind.nModified === 0) {
            let err = {};
            err.message = "this witness is not find!"
            return errorHandler(res, err);
        }
        res.message = "witness is abled!"
        return successHandler(res, witnessFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}


// const log = async (req,res) => {
//     try {
//         const token = req.authorization || req.headers['authorization'];
//         const decodeToken = await jsonwebtoken.decode(token);
//         const witnessFind = await witnessModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE}, {password: 0});
//         return successHandler(res, witnessFind);
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
        body.retypePassword = body.password
        const userCreate = await witnessModel.create(body);
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

// const login = async (req,res) => {
//     const {email, password} = req.body;
//     try {
//         const witnessFindByEmail = await witnessModel.findOne({email: email, status: status.ACTIVE});
//         const compare = await comparePassword(password, witnessFindByEmail.password);
//         if (!compare) {
//             let err = {};
//             err.message = 'Password is not correct!';
//             return errorHandler(res, err);
//         }
//         let tok = {
//             id: witnessFindByEmail._id,
//             email: witnessFindByEmail.email
//         }
//         const jwtToken = await jwt.jwtToken(tok);
//         const witness = await witnessModel.findOne({email: email, status: status.ACTIVE}, {password: 0})
//         let respObj = {
//             Data: witness,
//             Token: jwtToken
//         }
//         res.message = 'Witness'
//         return successHandler(res, respObj);
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }

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
            const witnessFind = await witnessModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false});
            if (dataImages.includes(witnessFind.avatar)) {
                let index = dataImages.indexOf(witnessFind.avatar)
                let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
            }
        }
        const witnessUpdate = await witnessModel.updateOne({_id:decodeToken.data.id, status: status.ACTIVE, disabled: false}, body);
        return successHandler(res, witnessUpdate);
    } catch (err) {
        return errorHandler(res, err)
    }
}


const remove = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessFind = await witnessModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE});
        if (dataImages.includes(witnessFind.avatar)) {
            let index = await dataImages.indexOf(witnessFind.avatar)
            let remove = await fs.unlinkSync(`Media/${dataImages[index]}`);
        }
        const witnessDelete = await witnessModel.updateOne({_id: decodeToken.data.id, disabled: false}, {$set: {status: status.DELETE}});
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
        const userUpdate = await userModel.updateOne({_id: userId, status: status.ACTIVE, disabled: false}, {$push: {rates: rateObj}});
        if (userUpdate) {
            const userRatingFind = await userModel.findById(userId);
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


const review = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userId = req.query.userId;
        const review = req.body.review
        let reviewObj = {
            witness: decodeToken.data.id,
            message: review
        }
        const witnessFind = await witnessModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, disabled: false});
        if (!witnessFind) {
            let err = {};
            err.message = 'This witness are disabled!';
            return errorHandler(res, err);
        }
        const userUpdate = await userModel.updateOne({_id: userId, status: status.ACTIVE, disabled: false}, {
            $push: {reviews: reviewObj}
        });
        if (userUpdate.nModified === 0) {
            let err = {}
            err.message = "Don't find this user!"
            return errorHandler(res, err)
        }

        return successHandler(res, reviewObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAppointments = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAppointments = await bookModel.find({witness: decodeToken.data.id, status: status.ACTIVE});
        return successHandler(res, findAppointments);
    } catch (err) {
        return errorHandler(res, err);
    }
}

// uploadDocs
const uploadDocs = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessId = req.query.witnessId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!"
            return errorHandler(res, err);
        }
        let names = [];
        req.files.map(file => {
            names.push(file.filename)
        })
        let docObj = {
            witness: witnessId,
            documents: names
        }
        const witnessDocumentCreate = await documentModel.create(docObj);
        const witnessUpdate = await witnessModel.updateOne({_id: witnessId}, {$set: {document: witnessDocumentCreate._id}})
        return successHandler(res, witnessDocumentCreate);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getDocument = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findDocs = await documentModel.findOne({witness: decodeToken.data.id, status: status.ACTIVE});
        return successHandler(res, findDocs);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getWitnessDocument = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessId = req.query.witnessId;
        const adminFind = await userModel.findOne({_id: decodeToken.data.id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!"
            return errorHandler(res, err);
        }
        const findDocs = await documentModel.findOne({witness: witnessId, status: status.ACTIVE});
        return successHandler(res, findDocs);
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    register,
    login,
    getAll,
    getAppointments,
    getDocument,
    getWitnessDocument,
    able,
    disable,
    uploadDocs,
    update,
    remove,
    review,
    rate
}