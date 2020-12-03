const express = require('express');
const user = express();
const controllers = require('./index');
const validation = require('./validation')
const multer = require('multer');
const uploadImage = require('../../uploadFile');
const upload = multer({ storage: uploadImage.storage, fileFilter: uploadImage.imageFilter }).single('avatar');

user.get('/admin/log/getAll', controllers.getAll)
user.get('/log/getBooks', controllers.getBooks)
user.get('/admin/log/getReview', controllers.getReview)
user.post('/register', upload, validation.validateRegister, controllers.register)
user.post('/login', validation.validateLogin, controllers.login)
user.put('/admin/log/disable', controllers.disable)
user.put('/admin/log/able', controllers.able)
user.put('/log/update', upload, controllers.update)
user.put('/log/rate', validation.validateRate, controllers.rate)
user.put('/log/review', controllers.review)
user.put('/log/admin', controllers.admin)
user.delete('/log/delete', controllers.remove)


module.exports = {
    user
}