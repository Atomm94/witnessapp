const express = require('express');
const book = express();
const controllers = require('./index');

book.post('/log/createBook', controllers.createBook);
book.put('/log/cancelBook', controllers.cancelBook);

module.exports = {
    book
}