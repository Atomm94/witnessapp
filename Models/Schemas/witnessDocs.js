const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const status = require('../../config').statusEnum;

const witnessDocsSchema = new Schema({
    witness: {
        type: Schema.Types.ObjectId,
        ref: 'witness'
    },
    documents: {
        type: [String],
        default: null
    },
    status: {
        type: Boolean,
        default: status.ACTIVE
    }
})

mongoose.model('witnessDocument', witnessDocsSchema);