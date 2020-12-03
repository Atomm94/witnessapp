const socketio = require("socket.io");
const Models = require('../../Models/models');
const status = require('../../config').statusEnum

exports.listen = function (app) {
    io = socketio.listen(app);
    const socketIDsObject = {};
    io.on("connection", (socket) => {
        const userID = socket.decoded.data.id;
        const id = socket.id;
        socketIDsObject[userID]= id

        socket.on("message", async (friendID, message) => {
            console.log(message)
            const findUser = await Models.user.findOne({_id: userID, status: status.ACTIVE});
            if (!findUser) {
                console.log('User is not find!');
            }
            const findFriend = await Models.user.findOne({_id: friendID, status: status.ACTIVE});
            if (!findFriend) {
                console.log('Friend is not find!');
            }
            socket.broadcast
                .to(socketIDsObject[friendID])
                .emit("newMessage", `${findUser.name}: ${message}`);
        })

        socket.on("disconnect", async () => {
            console.log("user disconnected");
        });
    })
    return io;
}