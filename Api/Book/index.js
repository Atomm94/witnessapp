const jsonwebtoken = require('jsonwebtoken');
const Models = require('../../Models/models');
const { canceledByPerson, bookStatus, workStatus } = require('../../Helper/constant');
const { successHandler, errorHandler } = require('../../Helper/responseHandler');

const createBook = async (req, res) => {
    try {
        let err = {};
        let { startLocation, endLocation } = req.body;
        startLocation = JSON.parse(startLocation);
        endLocation = JSON.parse(endLocation);
        console.log(typeof(startLocation.long))
        console.log(typeof(endLocation))
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        if (!userFind) {
            err.message = "User is not find!";
            return errorHandler(res, err);
        }
        let saveObj = {
            user: decodeToken.data.id,
            bookStatus: bookStatus.NON_ACCEPTED,
            startLocation: {
                type: 'Point',
                coordinates: [startLocation.long, startLocation.lat]
            },
            endLocation: {
                type: 'Point',
                coordinates: [endLocation.long, endLocation.lat]
            },
        }
        const createData = await Models.book.create(saveObj);
        await Models.user.updateOne({_id: decodeToken.data.id}, {
            $push: {bookings: createData._id}
        })
        res.message = "This user create a new book!";
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
        const userFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
        if (!userFind) {
            const witnessFind = await Models.witness.findOne({_id: decodeToken.data.id, delete: false, disabled: false});
            if (!witnessFind) {
                err.message = "User or Witness is not find!";
                return errorHandler(res, err);
            }
            const bookUpdatedByWitness = await Models.book.updateOne({_id: bookId, status: bookStatus.ACCEPT, delete: false}, {
                $set: {status: bookStatus.CANCEL, reason: reason, canceledByPerson: canceledByPerson.WITNESS, updatedAt: Date.now()}
            })
            if (bookUpdatedByWitness.nModified === 0) {
                err.message = "Book always canceled or is not find!";
                return errorHandler(res, err)
            }
            resObj.canceledByPerson = {
                type: canceledByPerson.WITNESS,
                id: decodeToken.data.id
            }
            res.message = 'This witness was cancel this book';
            return successHandler(res, resObj);
        }
        const bookUpdatedByUser = await Models.book.updateOne({_id: bookId, status: bookStatus.ACCEPT, delete: false}, {
            $set: {status: bookStatus.CANCEL, reason: reason, canceledByPerson: canceledByPerson.USER, updatedAt: Date.now()}
        })
        if (bookUpdatedByUser.nModified === 0) {
            err.message = "Book always canceled or is not find!";
            return errorHandler(res, err);
        }
        resObj.canceledByPerson = {
            type: canceledByPerson.USER,
            id: decodeToken.data.id
        }
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