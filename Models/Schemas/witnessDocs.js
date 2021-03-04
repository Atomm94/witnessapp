const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { witnessStatus } = require('../../Helper/constant');

const witnessDocsSchema = new Schema({
    witness: {
        type: Schema.Types.ObjectId,
        ref: 'witness'
    },
    documents: {
        type: [String],
        default: null
    },
    delete: {
        type: Boolean,
        default: false
    }
})

mongoose.model('witnessDocument', witnessDocsSchema);