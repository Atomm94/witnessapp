const express = require('express');
const router = express.Router();
const { user } = require('../Api/User/router');
const { witness } = require('../Api/Witness/router');
const { admin } = require('../Api/Admin/router');
const { book } = require('../Api/Book/router');
const { reset } = require('../Api/resetPassword/router');

router.use('/user', user);
router.use('/witness', witness);
router.use('/admin', admin);
router.use('/book', book);
router.use('/reset', reset);

module.exports = {
    router
}