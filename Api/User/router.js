const express = require('express');
const user = express();
const controllers = require('./index');
const validation = require('./validation')
const multer = require('multer');
const uploadImage = require('../../Helper/uploadFile');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
const uploadDocs = multer({ storage: uploadImage.storageDocs, fileFilter: uploadImage.imageFilter }).array('documents', 4);

user.get('/log/getBooks', controllers.getBooks)
user.get('/getAppointment', controllers.getAppointment)
user.get('/log/getMessages', controllers.getMessages)
user.post('/register', upload, validation.validateRegister, controllers.register)
user.post('/log/uploadDoc', uploadDocs, controllers.uploadDocs)
user.post('/login', validation.validateLogin, controllers.login)
user.put('/log/update', upload, controllers.update)
user.put('/log/rate', validation.validateRate, controllers.rate)
user.put('/log/changePassword', controllers.changePassword)
user.put('/log/findNearestWitness', controllers.findNearestWitness)
user.delete('/log/delete', controllers.remove)


module.exports = {
    user
}