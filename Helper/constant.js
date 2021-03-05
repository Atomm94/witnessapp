const witnessStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
}

const persons = {
    USER: 'user',
    WITNESS: 'witness'
}

const bookStatus = {
    ACCEPT: 'accept',
    CANCEL: 'cancel',
    NON_ACCEPTED: 'non accepted!'
}

const workStatus = {
    START: 'start',
    END: 'end',
    NON_STARTED: 'non started!'
}

const canceledByPerson = {
    WITNESS: 'witness',
    USER: 'user'
}

const driverStatus = {
    FREE: 'free',
    BUSY: 'busy'
}

module.exports = {
    witnessStatus,
    persons,
    bookStatus,
    workStatus,
    canceledByPerson,
    driverStatus
}