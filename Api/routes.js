const express = require('express');
const router = express.Router();
const user = require('../Api/User/router').user;
const witness = require('../Api/Witness/router').witness;
const bookApp = require('./bookAppointment/router').bookApp;
const reset = require('../Api/resetPassword/router').reset;

router.use('/user', user);
router.use('/witness', witness);
router.use('/bookApp', bookApp);
router.use('/reset', reset);

module.exports = {
    router
}