const express = require('express');
const bookApp = express();
const controllers = require('./index');

bookApp.get('/log', controllers.log)
bookApp.get('/log/getAll', controllers.getAll)
bookApp.post('/log/create', controllers.create)
bookApp.put('/log/accept', controllers.accept)
bookApp.put('/log/startWork', controllers.startWork)
bookApp.put('/log/endWork', controllers.endWork)
bookApp.delete('/log/delete', controllers.remove)


module.exports = {
    bookApp
}