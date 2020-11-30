// const io = require("socket.io");
 const Chat = require('../Models/models').chat;
// //const socketAuth = require('../jwtValidation').socketAuth
// const socketioJwt  = require('socketio-jwt');
// const config = require('../config').config
//
// const socketService = {
//     init(server) {
//         this.io = io(server);
//         this.startListening()
//     },
//
//     startListening() {
//         const activeUsers = new Set();
//
//         this.io.on("connection", socket => {
//
//             console.log("user connection");
//             socket.on("disconnect", () => {
//                 activeUsers.delete(socket.userId);
//                 socket.emit('message', 'A user has left the chat');
//                 console.log("user disconnected")
//             });
//             socket.on("stopTyping", () => {
//                 socket.broadcast.emit("notifyStopTyping");
//                 console.log('stopTyping')
//             });
//             socket.on('sendMessage', async (data) => {
//                 console.log('message =>', data);
//                 socket.emit('eventClient', {data: 'Hello Client'});
//                 socket.broadcast.emit('message', 'A user has joined the chat');
//
//                 socket.emit('msgEmit', {data: data});
//                 let chatFind = await Chat.findOne({$and: [{userId: data.userId}, {clientId: data.clientId}]})
//                     .catch(err => {
//                         console.log(err);
//                     });
//                 if (chatFind === null) {
//                     let chat = new Chat({
//                         userId: data.userId,
//                         clientId: data.clientId,
//                         message: [{
//                             messages: data.messages,
//                             fromId: data.fromId,
//                             sendId: data.sendId,
//                             data: new Date()
//                         }]
//                     });
//                     chat.save()
//                 } else {
//                     try {
//                         let chatUpdate = await Chat.updateOne({$and: [{userId: data.userId}, {clientId: data.clientId}]}, {
//                             $push: {
//                                 message: {
//                                     messages: data.messages,
//                                     fromId: data.fromId,
//                                     sendId: data.sendId,
//                                     data: new Date()
//                                 }
//                             }
//                         });
//                         console.log(chatUpdate);
//                     } catch (e) {
//                         console.log(e);
//                     }
//                 }
//             })
//         })
//         // }).on('connection', socketioJwt.authorize({
//         //     secret: config.tokenAuthKey,
//         //     timeout: 15000 // 15 seconds to send the authentication message
//         // }))
//         //     .on('authenticated', (socket) => {
//         //         //this socket is authenticated, we are good to handle more events from it.
//         //         console.log(`hello! ${socket.decoded_token.name}`);
//         //     });
//         console.log('hhhh')
//
//     }
// };
//
//
// module.exports = socketService;
//


const socketio = require("socket.io");
//const { User } = require("../models/user");

module.exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socket.on("message", async (friendID, message) => {
            socket.broadcast
                .to(socketIDsObject[friendID])
                .emit("newMessage", message);
            let chatFind = await Chat.findOne({$and: [{userId: userID}, {clientId: friendID}]})
                    .catch(err => {
                        console.log(err);
                    });
                if (chatFind === null) {
                    let chat = new Chat({
                        userId: userID,
                        clientId: friendID,
                        message: [{
                            messages: message,
                            fromId: userID,
                            sendId: friendID,
                            data: new Date()
                        }]
                    });
                    chat.save()
                } else {
                    try {
                        let chatUpdate = await Chat.updateOne({$and: [{userId: userID}, {clientId: friendID}]}, {
                            $push: {
                                message: {
                                    messages: message,
                                    fromId: userID,
                                    sendId: friendID,
                                    data: new Date()
                                }
                            }
                        });
                        console.log(chatUpdate);
                    } catch (e) {
                        console.log(e);
                    }
               };
             })

        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    });

    return io;
};