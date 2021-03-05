const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { driverStatus } = require('../../Helper/constant');

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
    carModel: {
        type: String,
        required: true
    },
    carNumber: {
        type: String,
        required: true
    },
    carColor: {
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
    bookings: [{
        type: Schema.Types.ObjectId,
        ref: 'book'
    }],
    delete: {
        type: Boolean,
        default: false
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
    disabled: {
        type: Boolean,
        default: false
    },
    documents: {
        type: [String],
        default: []
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    driverStatus: {
        type: String,
        default: driverStatus.FREE
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: Date
})

witnessSchema.index({ location: '2dsphere' });

mongoose.model('witness', witnessSchema);