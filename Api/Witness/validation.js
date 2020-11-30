const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({})

const schemaRegister = Joi.object().keys({
    avatar: Joi.string(),
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    country:Joi.string().required(),
    phoneNumber: Joi.string().required(),
    refCode:Joi.string().required(),
    vehicleType:Joi.string().required(),
    plateNumber:Joi.string().required(),
    drivingNumber:Joi.string().required(),
    stateId:Joi.string().required(),
    cardNumber: Joi.string().required(),
    cardName: Joi.string().required(),
    expirationDate: Joi.string().required(),
    CVV: Joi.string().required(),
    email: Joi.string().email().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).required(),
    password: Joi.string().required()
});

const schemaLogin = Joi.object().keys({
    email: Joi.string().email().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).required(),
    password: Joi.string().required()
});

const schemaRate = Joi.object().keys({
    id: Joi.string().required(),
    userId: Joi.string().required(),
    star: Joi.number().min(1).max(5).required()
});

const validateRegister = validator.body(schemaRegister);
const validateLogin = validator.body(schemaLogin);
const validateRate = validator.body(schemaRate);

module.exports = {
    validateRegister,
    validateLogin,
    validateRate
}