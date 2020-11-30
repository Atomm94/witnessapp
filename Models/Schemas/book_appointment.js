const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const status = require('../../config').statusEnum;


const bookAppointmentSchema = new Schema({
    address: {
        type: String,
        required: true
    },
    chooseDate: {
        type: String,
        default: new Date().toLocaleDateString()
    },
    startTime: {
        type: String,
        default: new Date().toLocaleTimeString()
    },
    endTime: {
        type: String,
        default: new Date().toLocaleTimeString()
    },
    alert: {
        type: String,
        default: null
    },
    witness: {
        type: Schema.Types.ObjectId,
        ref: 'witness'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        default: status.ACTIVE
    },
    accept: {
        type: Boolean,
        default: false
    },
    startWork: {
        type: Boolean,
        default: false
    },
    endWork: {
        type: Boolean,
        default: false
    }
})

mongoose.model('book/appointment', bookAppointmentSchema);