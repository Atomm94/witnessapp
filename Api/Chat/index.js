const socketio = require("socket.io");
const Models = require('../../Models/models');
//const { status } = require('../../config');
const mongoose = require('mongoose');

exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socketIDsObject[userID]= id

        socket.on("message", async (friendID, message) => {
            let findUser = await Models.user.findOne({_id: userID, delete: false});
            if (!findUser) {
                const findUserInWitness = await Models.witness.findOne({_id: userID, delete: false})
                if (!findUserInWitness) {
                    console.log('User is not find!');
                }
                findUser = findUserInWitness
            }
            let findFriend = await Models.witness.findOne({_id: friendID, delete: false});
            if (!findFriend) {
                const findWitnessInUser = await Models.user.findOne({_id: friendID, delete: false})
                if (!findWitnessInUser) {
                    console.log('Friend is not find!');
                }
            }
            const findChat = await Models.chat.findOne({$or: [{firstUserId: userID}, {secondUserId: userID}]});
            let mongoId = mongoose.Types.ObjectId();
            let id = `messages.${mongoId}`
            if(!findChat) {
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
            unsetData[`messages.${messageId}`] = "";

            await Models.chat.updateOne({_id: chatId}, {
                $unset: unsetData
            })
        })

        socket.on("findNearWitness", async (userLong, userLat) => {
            //console.log(userID)
            const userFind = await Models.user.findOne({_id: userID, delete: false, disabled: false})
                .select({firstName: 1, lastName: 1, mobileNumber: 1})
            if (!userFind) {
                console.log("User is not find!");
            }
            const findNearestWitness = await Models.witness.find({
                location: {
                    $nearSphere: {
                        $geometry: {
                            type : "Point",
                            coordinates : [+userLong, +userLat]
                        },
                        $maxDistance: 4000
                    }
                }
            }).select({firstName: 1, lastName: 1, phoneNumber: 1, carNumber: 1, carModel: 1, carColor: 1})
            if (!findNearestWitness.length) {
              //  console.log("no witness available now!");
                socket.emit("findWitness", "no witness available now!");
            } else {
                await findNearestWitness.map(item => {
                    socket.broadcast
                        .to(socketIDsObject[item._id])
                        .emit("newOrder", userFind)
                })
                socket.emit("findWitness", findNearestWitness);
            }
        })

        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    })
    return io;
}