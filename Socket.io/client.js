// const socketio = require("socket.io");
// //const { User } = require("../models/user");
//
// module.exports.listen = function (app) {
//     io = socketio.listen(app);
//
//     // users = io.of('/users')
//     ///users.on("connection")
//     io.on("connection", (socket) => {
//         const userID = socket.decoded._id;
//         console.log(userID)
//         // socket.on("subscribe", function (data) {
//         //     socket.join("5f7421946da65614c863dd5d");
//         //     socket.join("5f7421d36da65614c863dd5e");
//         // });
//         // // console.log(socket.id);
//         // socket.on("connectRequest", async (_id) => {
//         //     const obj = { [socket.decoded._id]: false };
//         //     await User.updateOne(
//         //         { _id },
//         //         { $push: { connection_requests: obj } },
//         //         { upsert: true }
//         //     );
//         //     socket.broadcast.to(_id).emit("newNotification", obj);
//         // });
//         //
//         // socket.on("message", async (friendID, message) => {
//         //     //***must check if user have premission send the message to <friend>
//         //     //   const userID = socket.decoded._id;
//         //     //   const userConnections = await User.findOne({ _id: userID }).select(
//         //     //     "connections"
//         //     //   );
//         //     socket.broadcast.to(friendID).emit("newMessage", message);
//         //     console.log(friendID, message);
//         // });
//         //
//         // socket.on("disconnect", async () => {
//         //     console.log("user disconnected");
//         // });
//     });
//
//     return io;
// };