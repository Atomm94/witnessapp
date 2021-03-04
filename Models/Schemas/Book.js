const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { bookStatus, workStatus, canceledByPerson } = require('../../Helper/constant');

const bookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    witness: {
        type: Schema.Types.ObjectId,
        ref: 'witness'
    },
    startAddress: {
        address: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
    },
    endAddress: {
        address: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
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
    status: {
        type: String,
        default: bookStatus.ACCEPT
    }
})

bookSchema.index({ location: '2dsphere' });

mongoose.model('book', bookSchema);