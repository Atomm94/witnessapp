const express = require('express');
const reset = express();
const controllers = require('./index');

reset.put('/resetPassword', controllers.resetPass)

module.exports = {
    reset
}
