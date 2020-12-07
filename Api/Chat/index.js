const socketio = require("socket.io");
const Models = require('../../Models/models');
const status = require('../../config').statusEnum
const mongoose = require('mongoose');

exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socketIDsObject[userID]= id

        socket.on("message", async (friendID, message) => {
            let findUser = await Models.user.findOne({_id: userID, status: status.ACTIVE});
            if (!findUser) {
                const findUserInWitness = await Models.witness.findOne({_id: userID, status: status.ACTIVE})
                if (!findUserInWitness) {
                    console.log('User is not find!');
                }
                findUser = findUserInWitness
            }
            let findFriend = await Models.witness.findOne({_id: friendID, status: status.ACTIVE});
            if (!findFriend) {
                const findWitnessInUser = await Models.user.findOne({_id: friendID, status: status.ACTIVE})
                if (!findWitnessInUser) {
                    console.log('Friend is not find!');
                }
            }

            const findChat = await Models.chat.findOne({$or: [{firstUserId: userID}, {secondUserId: userID}]});
            let mongoId = mongoose.Types.ObjectId();
            let id = `messages.${mongoId}`
            if(!findChat) {
                // let mongoId = mongoose.Types.ObjectId();
                // let id = `messages.${mongoId}`
                await Models.chat.create({
                    firstUserId: userID,
                    secondUserId: friendID,
                    [id] : {
                        message: message,
                        fromId: userID,
                        sendId: friendID,
                        date: new Date()
                    }
                })
            } else {
                // let mongoId = mongoose.Types.ObjectId();
                // let id = `messages.${mongoId}`
                await Models.chat.updateOne(
                    {$or: [{firstUserId: userID}, {secondUserId: userID}]},
                    {
                        [id] : {
                                message: message,
                                fromId: userID,
                                sendId: friendID,
                                date: new Date()
                            }
                    },
                   // {upsert: true}
                    )
            }

            socket.broadcast
                .to(socketIDsObject[friendID])
                .emit("newMessage", `${findUser.firstName} (${mongoId}): ${message}`);
        })

        socket.on("remove", async (chatId, messageId) => {
            const chatFind = await Models.chat.findOne({_id: chatId});
            if (!chatFind) {
                console.log('Chat is not Find!');
            }
            let unsetData = {};
            unsetData[`messages.${messageId}`] = ""
            console.log(unsetData)
            await Models.chat.updateOne({_id: chatId}, {
                $unset: unsetData
            })
        })

        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    })
    return io;
}