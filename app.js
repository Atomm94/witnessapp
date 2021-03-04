const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
const config = require('./config');
const router = require('./Api/routes').router;
const token = require('./Auth/jwtValidation').token;
const forgot = require('./Helper/resetPassword').emailSend;
const fs = require('fs');
const multer = require('multer')
const uploadImage = require('./Helper/uploadFile');
const socketAuth = require('./Auth/jwtValidation').socketAuth;

const server = require('http').createServer(app);
const io = require("./Api/Chat/index").listen(server);

io.use(socketAuth)

const port = process.env.PORT || 5000 || config.config;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'Media')))


app.use(`/api/user/log`, token);
app.use(`/api/witness/log`, token);
app.use(`/api/bookApp/log`, token);
app.use('/api', router);
app.use('/token', token);


app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '/api/Chat', 'main.html'))
})


server.listen(port, () => {
    console.log(`The Witness mobile app is started on port ${port}`)
})

