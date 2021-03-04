const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const express = require('express');
const stripeRoute = express();

stripeRoute.post('/createCustomer', async (req, res) => {
    try {
        const { email } = req.body;
        const customer = await stripe.customers.create({email: email});

        return res.status(200).send({
            customerId: customer.id,
            customerEmail: customer.email,
        });
    } catch (err) {
        return res.status(404).send({ Error: err.raw.message });
    }
})

stripeRoute.post('/createIntents', async (req,res) => {
    try {
        const { customerId, amount } = req.body;

        const intent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customerId,
        });
        return res.status(200).send({
            payment: intent
        });
    } catch (err) {
        return res.status(404).send({ Error: err.raw.message });
    }
})


stripeRoute.post('/createPayment', async (req,res) => {
    try {
        const { customerId } = req.body;
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return res.status(200).send({
            paymentMethod: paymentMethods
        });
    } catch (err) {
        return res.status(404).send({ Error: err.raw.message });
    }
})


module.exports = {
    stripeRoute
}



