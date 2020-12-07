const jwt = require('jsonwebtoken');
const config = require('./config').config;
const express = require('express');
const token = express();
const errorHandler = require('./Api/responseHandler').errorHandler;
const successHandler = require('./Api/responseHandler').successHandler;
const userModel = require('./Models/models').user;
const witnessModel = require('./Models/models').witness;

token.use('/',async (req,res, next) => {
    const jwtAuth = req.authorization || req.headers['authorization'];
    jwt.verify(jwtAuth, config.tokenAuthKey, (err, user) => {
        if (err) {
            return errorHandler(res, err);
        }
        next()
    })
})

// else if(req.query.id) {
//     if (req.query.id !== jwt.decode(jwtAuth).data.id) {
//         let err = {};
//         err.message = 'Invalid token!';
//         return errorHandler(res, err);
//     }
//     next();
// } else if(req.body.email){
//     if (req.body.email !== jwt.decode(jwtAuth).data.email) {
//         let err = {};
//         err.message = 'Invalid token!';
//         return errorHandler(res, err);
//     }
//     next();
// } else {
//     next();
// }

token.get('/getData', async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jwt.decode(token);
        const findReviewUser = await userModel.findOne({_id: decodeToken.data.id}, {token: 0, password: 0})
        if (!findReviewUser) {
            const findReviewWitness = await witnessModel.findOne({_id: decodeToken.data.id}, {token: 0, password: 0})
            res.message = "witness"
            return successHandler(res, findReviewWitness);
        }
        res.message = "user"
        return successHandler(res, findReviewUser);
    } catch (err) {
        return errorHandler(res, err);
    }
})

const jwtToken = async (data) => {
    const getToken = await jwt.sign({data: data}, config.tokenAuthKey);
    return getToken;
}


const socketAuth = async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, config.tokenAuthKey, function (err, decoded) {
            if (err) return next(new Error('Authentication error'));
            // console.log("dddeeeeee",decoded)
            socket.decoded = decoded;
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
}




module.exports = {
    token,
    jwtToken,
    socketAuth
}
