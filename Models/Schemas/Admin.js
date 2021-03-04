const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    delete: {
        type: Boolean,
        default: false
    }
})

adminSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error(`${Object.getOwnPropertyNames(error.keyValue)[0]} must be unique`));
    } else {
        next(error);
    }
});

mongoose.model('admin', adminSchema);
