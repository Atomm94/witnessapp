const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const status = require('../../config').statusEnum;

const userEnum = {
    NOTARY: 'notary',
    ATTORNEY_BAR: 'attorney_bar'
}

const userSchema = new Schema({
    avatar: {
        type: String,
        default: 'https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png'
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
    sphere: {
        type: String,
        default: userEnum.ATTORNEY_BAR
    },
    professionalNumber: {
        type: String,
        required: true
    },
    drivingNumber: {
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
    promoCode: {
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
    book: {
        type: Schema.Types.ObjectId,
        ref: 'book'
    },
    status: {
        type: String,
        default: status.ACTIVE
    },
    rates: [{
        witness: {
            type: Schema.Types.ObjectId,
            ref: 'witness'
        },
        star: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    rating: {
        type: Number,
        default: null
    },
    reviews: [{
        witness: {
            type: Schema.Types.ObjectId,
            ref: 'witness'
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
    role_admin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: Date
})

mongoose.model('user', userSchema);