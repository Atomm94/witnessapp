const stripeModule = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const createToken = async (req, res) => {
    let card = {
        number: req.number,
        exp_month: req.exp_month,
        exp_year: req.exp_year,
        cvc: req.cvc
    }
    const token = await stripeModule.tokens.create({card}, (err, data) => {
        res(err, data)
    })
    return token;
}


const createCharge = async (req, res) => {
    let charge = {
        amount: req.amount * 100,
        currency: req.currency,
        source: req.token,
        description: req.description,
        shipping: {
            address: {
                line1: 'chennai',
                city: 'San Fransisco',
                country: 'US',
                postal_code: '98140',
                state: 'CA'
            },
            name: 'Dravid Sajin'
        }
    }
    const charges = await stripeModule.charges.create({charge}, (err, data) => {
        res(err, data)
    })
    return charges;
}

module.exports = {
    createToken,
    createCharge
}