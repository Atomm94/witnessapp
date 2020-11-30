const userModel = require('../../Models/models').user;
const witnessModel = require('../../Models/models').witness;
const successHandler = require('../responseHandler').successHandler;
const errorHandler = require('../responseHandler').errorHandler;
const msToHM = require('../../helpFunctions').msToHM;
const bookModel = require('../../Models/models').bookAppointment;
const status = require('../../config').statusEnum;

const create = async (req,res) => {
    try {
        const { witnessId, id } = req.query;
        let err = {};
        const findWitness = await witnessModel.findOne({_id: witnessId, status: status.ACTIVE, disabled: false});
        if (!findWitness) {
            err.message = "Don't find this witness!"
            return errorHandler(res, err);
        }
        const findUser = await userModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
        if (!findUser) {
            err.message = "Don't find this user!"
            return errorHandler(res, err);
        }
        let saveObj = {
            address: req.body.address,
            chooseDate: req.body.chooseDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            alert: req.body.alert,
            witness: witnessId,
            user: id
        }
        const bookCreate = await bookModel.create(saveObj);
        const witnessUpdate = await witnessModel.updateOne({$push: {books: bookCreate.id}});
        const userUpdate = await userModel.updateOne({$set: {book: bookCreate.id}});
        return successHandler(res, bookCreate);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const accept = async (req,res) => {
    try {
        const { id, bookAppId } = req.query;
        const findWitness = await witnessModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
        if (!findWitness) {
            let err = {};
            err.message = "Don't find this witness!"
            return errorHandler(res, err);
        }
        const bookAccept = await bookModel.updateOne({witness: id, _id: bookAppId, status: status.ACTIVE}, {$set: {accept: true}});
        res.message = 'appointment is accepted!'
        return successHandler(res, bookAccept);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const startWork = async (req,res) => {
    try {
        const { id, bookAppId } = req.query;
        const findWitness = await witnessModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
        if (!findWitness) {
            let err = {};
            err.message = "Don't find this witness!"
            return errorHandler(res, err);
        }
        const startWork = await bookModel.updateOne({witness: id, _id: bookAppId, accept: true}, {
            $set: {
                startTime: Date.now(),
                startWork: true,
                chooseDate: new Date().toLocaleDateString()
            }
        });
        if (startWork.nModified === 0) {
            let err = {};
            err.message = 'The work is not accepted!'
            return errorHandler(res, err)
        }
        res.message = 'the work is started!'
        return successHandler(res, startWork);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const endWork = async (req,res) => {
    try {
        const { id, bookAppId } = req.query;
        const findWitness = await witnessModel.findOne({_id: id, status: status.ACTIVE, disabled: false});
        if (!findWitness) {
            let err = {};
            err.message = "Don't find this witness!"
            return errorHandler(res, err);
        }
        const endWork = await bookModel.updateOne({witness: id, _id: bookAppId, accept: true, startWork: true}, {
            $set: {
                endWork: true,
                endTime: new Date().toLocaleTimeString()
            }
        });
        if (endWork.nModified === 0) {
            let err = {};
            err.message = 'The work is not started!'
            return errorHandler(res, err)
        }
        const newFind = await bookModel.findOne({_id: bookAppId, status: status.ACTIVE})
        let totalTime = await msToHM(Date.now() - (+newFind.startTime))
        const findBookApp = await bookModel.updateOne({_id: bookAppId}, {$set: {status: status.DELETE}});
        res.message = 'the work was end!'
        return successHandler(res, totalTime);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAll = async (req,res) => {
    try {
        const id = req.query.id;
        const adminFind = await userModel.findOne({_id: id, status: status.ACTIVE, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!"
            return errorHandler(res, err);
        }
        const bookFind = await bookModel.find({status: status.ACTIVE});
        return successHandler(res, bookFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const log = async (req,res) => {
    try {
        const bookFind = await bookModel.findOne({_id: req.query.id, status: status.ACTIVE})
            .populate('user')
            .populate('witness');
        return successHandler(res, bookFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const remove = async (req,res) => {
    try {
        const bookDelete = await bookModel.updateOne({_id: req.query.id}, {$set: {status: status.DELETE}})
        return successHandler(res, bookDelete)
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    create,
    accept,
    startWork,
    endWork,
    log,
    getAll,
    remove
}