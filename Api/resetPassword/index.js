const express = require('express');
const reset = express();
const successHandler = require('../responseHandler').successHandler;
const errorHandler = require('../responseHandler').errorHandler;
const userModel = require('../../Models/models').user;
const witnessModel = require('../../Models/models').witness;
const hashPassword = require('../../helpFunctions').hashPassword;
const status = require('../../config').statusEnum;
const resetPassword = require('../../resetPassword');
const uuid = require('uuid-random');

const resetPass = async (req,res) => {
    try {
        const { email } = req.body;
        const witnessFind = await witnessModel.findOne({email: email, status: status.ACTIVE});
        if (witnessFind) {
            const resetPassWitness = await uuid();
            const newHashWitness = await hashPassword(resetPassWitness);
            const witnessUpdate = await witnessModel.updateOne({email: email}, {$set: {password: newHashWitness}});
            const sendEmailWitness = await resetPassword.emailSend(witnessFind.email, resetPassWitness);
            res.message = "Password was reset successfully!";
            return successHandler(res, null);
        }
        const userFind = await userModel.findOne({email: email, status: status.ACTIVE});
        const resetPassUser = await uuid();
        const newHashUser = await hashPassword(resetPassUser);
        const userUpdate = await userModel.updateOne({email: email}, {$set: {password: newHashUser}});
        const sendEmailUser = await resetPassword.emailSend(userFind.email, resetPassUser);
        res.message = "Password was reset successfully!";
        return successHandler(res, null);
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    resetPass
}