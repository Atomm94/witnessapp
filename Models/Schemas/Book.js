const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { bookStatus, canceledByPerson, workStatus } = require('../../Helper/constant');

const bookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    witness: {
        type: Schema.Types.ObjectId,
        ref: 'witness'
    },
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    delete: {
        type: Boolean,
        default: false
    },
    reason: String,
    canceledByPerson: {
        type: String,
        enum: Object.values(canceledByPerson)
    },
    bookStatus: {
        type: String,
        default: bookStatus.ACCEPT
    },
    workStatus: {
        type: String,
        enum: Object.values(workStatus),
        default: workStatus.NON_STARTED
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: Date
})

bookSchema.index({ location: '2dsphere' });

mongoose.model('book', bookSchema);