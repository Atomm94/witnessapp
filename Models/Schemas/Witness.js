const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const status = require('../../config').statusEnum;

const witnessSchema = new Schema({
    avatar: {
        type: String,
        default: null
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        required: true
    },
    refCode: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    plateNumber: {
        type: String,
        required: true
    },
    drivingNumber: {
        type: String,
        required: true
    },
    stateId: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    },
    cardName: {
        type: String,
        required: true
    },
    expirationDate: {
        type: String,
        required: true
    },
    CVV: {
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
    books: [{
        type: Schema.Types.ObjectId,
        ref: 'book'
    }],
    status: {
        type: String,
        default: status.ACTIVE
    },
    rates: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        star: {
            type: Number,
            min: 1,
            max: 5
        },
    }],
    rating: {
        type: Number,
        default: null
    },
    reviews: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        message: {
            type: String,
            required: true
        }
    }],
    disabled: {
        type: Boolean,
        default: false
    },
    document: {
        type: Schema.Types.ObjectId,
        ref: 'witnessDocument'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: Date
})

mongoose.model('witness', witnessSchema);