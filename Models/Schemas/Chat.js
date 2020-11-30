const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        userId: Schema.Types.ObjectId,
        clientId: Schema.Types.ObjectId,

        message: [{
            messages: String,
            fromId: Schema.Types.ObjectId,
            sendId: Schema.Types.ObjectId,
            data: Date
        }
        ]
    }
);

mongoose.model("chat", chatSchema);

