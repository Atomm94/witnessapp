const express = require("express");
const stripe = express.Router();
const { createToken, createCharge } = require('./stripeFunctions');

stripe.post('/createToken', async (req, res) => {
    createToken(req.body, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send({
                'message' : 'Token generated successfully!',
                'data' : result
            })
        }
    })
})

stripe.post('/createCharge', async (req, res) => {
    createCharge(req.body, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send({
                'message' : 'Charged successfully!',
                'data' : result
            })
        }
    })
})


module.exports = {
    stripe
}