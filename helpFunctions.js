const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    let salt = await bcrypt.genSaltSync(10);
    let hash = await bcrypt.hashSync(password, salt);
    return hash;
}

const comparePassword = async (newPassword, password) => {
    let compare = await bcrypt.compareSync(newPassword, password);
    return compare;
}

const  msToHM = ( ms ) => {
    let seconds = ms / 1000;
    let hours = parseInt( seconds / 3600 );
    seconds = seconds % 3600;
    let minutes = parseInt( seconds / 60 );
    let total =  hours+":"+minutes;
    return total;
}


module.exports = {
    hashPassword,
    comparePassword,
    msToHM
}