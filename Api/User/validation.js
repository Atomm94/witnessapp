const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({})

const schemaRegister = Joi.object().keys({
    avatar: Joi.string(),
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    country:Joi.string().required(),
    phoneNumber: Joi.string(),
    sphere:Joi.string(),
    professionalNumber:Joi.string().required(),
    drivingNumber:Joi.string().required(),
    cardNumber: Joi.string().required(),
    cardName: Joi.string().required(),
    expirationDate: Joi.string().required(),
    CVV: Joi.string().required(),
    promoCode: Joi.string().required(),
    email: Joi.string().email().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).required(),
    password: Joi.string().required()
});

const schemaLogin = Joi.object().keys({
    email: Joi.string().email().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).required(),
    password: Joi.string().required()
});

const schemaRate = Joi.object().keys({
    id: Joi.string().required(),
    witnessId: Joi.string().required(),
    star: Joi.number().min(1).max(5).required()
});


const validateRegister = validator.body(schemaRegister);
const validateLogin = validator.body(schemaLogin);
const validateRate = validator.query(schemaRate);

module.exports = {
    validateRegister,
    validateLogin,
    validateRate
}