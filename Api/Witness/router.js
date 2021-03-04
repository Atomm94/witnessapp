const express = require('express');
const witness = express();
const controllers = require('./index');
const validation = require('./validation')
const multer = require('multer');
const uploadImage = require('../../Helper/uploadFile');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');
const uploadDocs = multer({ storage: uploadImage.storageDocs, fileFilter: uploadImage.imageFilter }).array('documents', 4);


witness.get('/getAppointment', controllers.getAppointment)
witness.get('/log/getDocument', controllers.getDocument)
witness.get('/log/downloadDocs', controllers.downloadDoc)
witness.post('/register', upload, controllers.register)
witness.post('/log/uploadDoc', uploadDocs, controllers.uploadDocs)
witness.post('/postCoordinates', controllers.showLocation);
witness.put('/log/update', upload, controllers.update)
witness.put('/log/rate', validation.validateRate, controllers.rate)
witness.put('/log/changePassword', controllers.changePassword)
witness.delete('/log/delete', controllers.remove)

module.exports = {
    witness
}