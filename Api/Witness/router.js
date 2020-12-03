const express = require('express');
const witness = express();
const controllers = require('./index');
const validation = require('./validation')
const multer = require('multer');
const uploadImage = require('../../uploadFile');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
const uploadDocs = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).array('documents', 4);


witness.get('/admin/log/getAll', controllers.getAll)
witness.get('/log/getAppointments', controllers.getAppointments)
witness.get('/log/getDocument', controllers.getDocument)
witness.get('/admin/log/getWitnessDocument', controllers.getWitnessDocument)
witness.post('/register', upload, validation.validateRegister, controllers.register)
witness.post('/login', controllers.login)
witness.post('/admin/log/uploadDoc', uploadDocs, controllers.uploadDocs)
witness.put('/admin/log/disable', controllers.disable)
witness.put('/admin/log/able', controllers.able)
witness.put('/log/update', upload, controllers.update)
witness.put('/log/rate', validation.validateRate, controllers.rate)
witness.put('/log/review', controllers.review)
witness.delete('/log/delete', controllers.remove)

module.exports = {
    witness
}