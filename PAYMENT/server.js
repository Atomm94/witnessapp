'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { secretKey } = require('./config');
const stripe = require('stripe')(secretKey);
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/home', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'stripe.html'))
    } catch (err) {
        res.json({message: 'page not found!'});
    }
})

app.post('/checkout', async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: 'eur',
            metadata: {integration_check: 'accept_a_payment'},
        });
        console.log(paymentIntent.client_secret)
        res.json({ clientSecret:  paymentIntent.client_secret });
        // const charge = await stripe.charges.create({
        //     amount: amount,
        //     currency: 'usd',
        //     source: 'pi_1IONxv2eZvKYlo2CWXlJuMzA_secret_14VKqIDchX8zJgpoocSP5TyJW',
        //     description: 'My First Test Charge (created for API docs)',
        // });
        // res.json({ok: charge})

        // const paymentMethod = await stripe.paymentMethods.create({
        //     type: 'card',
        //     card: {
        //         number: '4242424242424242',
        //         exp_month: 2,
        //         exp_year: 2022,
        //         cvc: '314',
        //     },
        // });
        // res.json({ok: paymentMethod})
    } catch(err) {
        res.json(err);
    }
});

app.listen(4000, () => {
    console.log('Server about stripe was started...!');
})