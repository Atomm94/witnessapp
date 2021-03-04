const jsonwebtoken = require('jsonwebtoken');
const Models = require('../../Models/models');
const { canceledByPerson, bookStatus, workStatus } = require('../../Helper/constant');
const { successHandler, errorHandler } = require('../../Helper/responseHandler');

const createBook = async (req, res) => {
    try {
        let err = {};
        let { startAddress, endAddress } = req.body;
        startAddress = JSON.parse(startAddress);
        endAddress = JSON.parse(endAddress);
        const { witnessId } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        if (!userFind) {
            err.message = "User is not find!";
            return errorHandler(res, err);
        }
        if (userFind.role_admin) {
            err.message = "This user is admin and can't booking!"
            return errorHandler(res, err);
        }
        const witnessFind = await Models.witness.findOne({_id: witnessId, delete: false, disabled: false, workStatus: workStatus.END});
        if (!witnessFind) {
            err.message = "Witness is not find or was busy!";
            return errorHandler(res, err);
        }
        let saveObj = {
            user: decodeToken.data.id,
            witness: witnessId,
            startAddress: {
                address: startAddress.address,
                location: {
                    type: 'Point',
                    coordinates: startAddress.coordinates
                }
            },
            endAddress: {
                address: endAddress.address,
                location: {
                    type: 'Point',
                    coordinates: endAddress.coordinates
                }
            },
        }
        const createData = await Models.book.create(saveObj);
        await Models.user.updateOne({_id: decodeToken.data.id}, {
            $push: {books: createData._id}
        })
        await Models.witness.updateOne({_id: witnessId}, {
            $push: {books: createData._id}
        })
        res.message = "This user was booking this witness!";
        return successHandler(res, createData);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const cancelBook = async (req, res) => {
    try {
        let err = {};
        let resObj = {};
        const { reason } = req.body;
        const { bookId } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false});
        if (!userFind) {
            const witnessFind = await Models.witness.findOne({_id: decodeToken.data.id, delete: false});
            if (!witnessFind) {
                err.message = "User or Witness is not find!";
                return errorHandler(res, err);
            }
            const bookUpdatedByWitness = await Models.book.updateOne({_id: bookId}, {
                $set: {status: bookStatus.CANCEL, reason: reason, canceledByPerson: canceledByPerson.WITNESS}
            })
            if (bookUpdatedByWitness.nModified === 0) {
                err.message = "Book is not find!"
                return errorHandler(res, err)
            }
            resObj.canceledByPerson = {
                type: canceledByPerson.WITNESS,
                id: decodeToken.data.id
            }
            res.message = 'This witness was cancel this book';
            return successHandler(res, reason);
        }
        const bookUpdatedByUser = await Models.book.updateOne({_id: bookId}, {
            $set: {status: bookStatus.CANCEL, reason: reason, canceledByPerson: canceledByPerson.USER}
        })
        resObj.canceledByPerson = {
            type: canceledByPerson.USER,
            id: decodeToken.data.id
        }
        resObj.reason = reason
        res.message = 'This user was cancel this book';
        return successHandler(res, resObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}


module.exports = {
    createBook,
    cancelBook
}