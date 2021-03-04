const jsonwebtoken = require('jsonwebtoken');
const Models = require('../../Models/models');
const { persons, bookStatus } = require('../../Helper/constant');
const { jwtToken } = require('../../Auth/jwtValidation');
const { successHandler, errorHandler } = require('../../Helper/responseHandler');
const { hashPassword, comparePassword } = require('../../Helper/helpFunctions');

// const becomeToAdmin = async (req, res) => {
//     try {
//         const token = req.authorization || req.headers['authorization'];
//         const decodeToken = await jsonwebtoken.decode(token);
//         const chooseAdmin = await Models.user.updateOne({_id: decodeToken.data.id, delete: false, disabled: false}, {$set: {role_admin: true}});
//         if (chooseAdmin.nModified === 0) {
//             let err = {};
//             err.message = 'This user is not find or he is already admin!';
//             return errorHandler(res, err);
//         }
//         res.message = "user become to admin!";
//         return successHandler(res, chooseAdmin)
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }

/** Register, Login **/

const register = async (req, res) => {
    try {
        const body = req.body;
        if (body.retypePass !== body.password) {
            let err = {};
            err.message = "confirm password & password is not match!";
            return errorHandler(res, err);
        }
        const hash = await hashPassword(body.password);
        body.password = hash;
        const createAdmin = await Models.admin.create(body);
        res.message = 'Admin register successfully!'
        return successHandler(res, createAdmin);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const login = async (req, res) => {
    try {
        let err = {};
        let tok = {};
        let respObj = {};
        const { email, password } = req.body;
        const findByEmail = await Models.admin.findOne({email: email, delete: false});
        if (!findByEmail) {
            err.message = 'Admin with this email is not find!';
            return errorHandler(res, err);
        }
        const compare = await comparePassword(password, findByEmail.password);
        if (!compare) {
            err.message = 'Password is not correct!';
            return errorHandler(res, err);
        }
        tok = {
            id: findByEmail._id,
            email: findByEmail.email
        }
        const createToken = await jwtToken(tok);
        respObj = {
            Data: findByEmail,
            Token: createToken
        };
        res.message = 'Admin login successfully!';
        return successHandler(res, respObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

/** Get All Users or Witnesses **/
const getAll = async (req,res) => {
    try {
        let personFind;
        const { person } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const adminFind = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        /*without token, password*/
        if (person === persons.USER) {
            personFind = await Models.user.find({delete: false}, {password: 0, rates: 0});
        } else {
            personFind = await Models.witness.find({delete: false}, {password: 0, rates: 0})
        }
        return successHandler(res, personFind);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getWitnessDocument = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const witnessId = req.query.witnessId;
        const adminFind = await Models.user.findOne({_id: decodeToken.data.id, delete: false, role_admin: true});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!";
            return errorHandler(res, err);
        }
        const findDocs = await Models.witnessDocument.findOne({witness: witnessId, delete: false});
        return successHandler(res, findDocs);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const ableDisable = async (req,res) => {
    try {
        const {person, id} = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const adminFind = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin is not find!"
            return errorHandler(res, err);
        }
        if (person === persons.USER) {
            const userFind = await Models.user.findOne({_id: id, delete: false});
            console.log(userFind)
            if (!userFind) {
                let err = {};
                err.message = "this user is not find!"
                return errorHandler(res, err);
            }
            if (userFind.disabled === false) {
                await Models.user.updateOne({_id: id}, {
                    $set: {disabled: true}
                })
                res.message = "user is disabled!"
            } else {
                await Models.user.updateOne({_id: id}, {
                    $set: {disabled: false}
                })
                res.message = "user is abled!"
            }
        } else {
            const witnessFind = await Models.witness.findOne({_id: id, delete: false});
            if (!witnessFind) {
                let err = {};
                err.message = "this witness is not find!"
                return errorHandler(res, err);
            }
            if (witnessFind.disabled === false) {
                await Models.witness.updateOne({_id: id}, {
                    $set: {disabled: true}
                })
                res.message = "witness is disabled!"
            } else {
                await Models.witness.updateOne({_id: id}, {
                    $set: {disabled: false}
                })
                res.message = "witness is abled!"
            }
        }
        return successHandler(res, null);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getRate = async (req,res) => {
    try {
        let respObj;
        let findPersonRate;
        const { person, id } = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const adminFind = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if (!adminFind) {
            let err = {};
            err.message = "this Admin not find!";
            return errorHandler(res, err);
        }
        if (person === persons.USER) {
            findPersonRate = await Models.user.findOne({_id: id, delete: false, disabled: false})
                .select({'rating': 1, 'rates': 1});
            if (!findPersonRate) {
                let err = {};
                err.message = "this User is not find!";
                return errorHandler(res, err);
            }
            respObj = {
                rating: findPersonRate.rating,
                count: findPersonRate.rates.length
            }
        } else {
            findPersonRate = await Models.witness.findOne({_id: id, delete: false, disabled: false})
                .select({'rating': 1, 'rates': 1});
            if (!findPersonRate) {
                let err = {};
                err.message = "this Witness is not find!";
                return errorHandler(res, err);
            }
            respObj = {
                rating: findPersonRate.rating,
                count: findPersonRate.rates.length
            }
        }
        return successHandler(res, respObj);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const onGoingTrips = async (req,res) => {
    try {
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAdmin = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if(!findAdmin) {
            let err = {};
            err.message = "Admin is not find!";
            return errorHandler(res, err);
        }
        const getAllTrips = await Models.book.find({startWork: true, endWork: false, delete: false});
        return successHandler(res, getAllTrips);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAllAcceptedBooks = async (req,res) => {
    try {
        let err = {};
        const query = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAdmin = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if(!findAdmin) {
            let err = {};
            err.message = "Admin is not find!";
            return errorHandler(res, err);
        }
        if (query.userId) {
            const findUserBooks = await Models.book.find({user: query.userId, delete: false, status: bookStatus.ACCEPT})
            if (!findUserBooks) {
                err.message = "this user is not find or haven't any accepted books";
                return errorHandler(res, err);
            }
            res.message = 'All accepted books of this user!';
            return successHandler(res, findUserBooks);
        } else {
            const findWitnessBooks = await Models.book.find({witness: query.witnessId, delete: false, status: bookStatus.ACCEPT})
            if (!findWitnessBooks) {
                err.message = "this witness is not find or haven't any accepted books";
                return errorHandler(res, err);
            }
            res.message = 'All accepted books of this witness!';
            return successHandler(res, findWitnessBooks);
        }
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAllCanceledBooks = async (req,res) => {
    try {
        let err = {};
        const query = req.query;
        const token = req.authorization || req.headers['authorization'];
        const decodeToken = await jsonwebtoken.decode(token);
        const findAdmin = await Models.admin.findOne({_id: decodeToken.data.id, delete: false});
        if(!findAdmin) {
            let err = {};
            err.message = "Admin is not find!";
            return errorHandler(res, err);
        }
        if (query.userId) {
            const findUserBooks = await Models.book.find({user: query.userId, delete: false, status: bookStatus.CANCEL})
            if (!findUserBooks) {
                err.message = "this user is not find or haven't any canceled books";
                return errorHandler(res, err);
            }
            res.message = 'All canceled books of this user!'
            return successHandler(res, findUserBooks);
        } else {
            const findWitnessBooks = await Models.book.find({witness: query.witnessId, delete: false, status: bookStatus.CANCEL})
            if (!findWitnessBooks) {
                err.message = "this witness is not find or haven't any canceled books";
                return errorHandler(res, err);
            }
            res.message = 'All canceled books of this witness!';
            return successHandler(res, findWitnessBooks);
        }
    } catch (err) {
        return errorHandler(res, err);
    }
}

module.exports = {
    register,
    login,
    getAll,
    getRate,
    ableDisable,
    onGoingTrips,
    getAllAcceptedBooks,
    getAllCanceledBooks
}