const mongoose = require('mongoose');
require('./Schemas/User');
require('./Schemas/Witness');
require('./Schemas/Book');
require('./Schemas/witnessDocs');
require('./Schemas/Chat');
require('./Schemas/Admin');

const user = mongoose.model('user');
const witness = mongoose.model('witness');
const book = mongoose.model('book');
const witnessDocument = mongoose.model('witnessDocument');
const chat = mongoose.model('chat');
const admin = mongoose.model('admin');

module.exports = {
    user,
    witness,
    book,
    witnessDocument,
    chat,
    admin
}