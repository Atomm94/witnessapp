const express = require('express');
const admin = express();
const controllers = require('./index');

admin.get('/log/getAll', controllers.getAll);
admin.get('/log/getRate', controllers.getRate);
admin.get('/log/onGoingTrips', controllers.onGoingTrips);
admin.get('/log/acceptedBooks', controllers.getAllAcceptedBooks);
admin.get('/log/canceledBooks', controllers.getAllCanceledBooks);
admin.post('/register', controllers.register);
admin.post('/login', controllers.login);
admin.put('/log/ableDisable', controllers.ableDisable);


module.exports = {
    admin
}