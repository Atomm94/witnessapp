const successHandler = require('../../Helper/responseHandler').successHandler;
const errorHandler = require('../../Helper/responseHandler').errorHandler;
const userModel = require('../../Models/models').user;
const witnessModel = require('../../Models/models').witness;
const hashPassword = require('../../Helper/helpFunctions').hashPassword;
const { status } = require('../../config');
const resetPassword = require('../../Helper/resetPassword');
const uuid = require('uuid-random');

const resetPass = async (req,res) => {
    try {
        const { email } = req.body;
        const witnessFind = await witnessModel.findOne({email: email, delete: false});
        if (witnessFind) {
            const resetPassWitness = await uuid();
            const newHashWitness = await hashPassword(resetPassWitness);
            const witnessUpdate = await witnessModel.updateOne({email: email}, {$set: {password: newHashWitness}});
            const sendEmailWitness = await resetPassword.emailSend(witnessFind.email, resetPassWitness);
            res.message = "Password was reset successfully!";
            return successHandler(res, null);
        }
        const userFind = await userModel.findOne({email: email, delete: false});
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