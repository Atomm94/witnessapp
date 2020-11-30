const mongoose = require('mongoose');
require('./Schemas/User');
require('./Schemas/Witness');
require('./Schemas/book_appointment');
require('./Schemas/witnessDocs');
require('./Schemas/Chat');

const user = mongoose.model('user');
const witness = mongoose.model('witness');
const bookAppointment = mongoose.model('book/appointment');
const witnessDocument = mongoose.model('witnessDocument');
const chat = mongoose.model('chat');

module.exports = {
    user,
    witness,
    bookAppointment,
    witnessDocument,
    chat
}