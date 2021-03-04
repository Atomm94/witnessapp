const config = {
    database: 'mongodb+srv://At11:atmak11@cluster0.d1re6.mongodb.net/witnessApp?retryWrites=true&w=majority',
    port: 8000,
    tokenAuthKey: 'go.witness.app1568464',
    resetPasswordKey: 'accountResetPassword151515'
}

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(config.database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongoose is connected successfully...'))
    .catch(err => console.log(err))


module.exports = {
    config
}