const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        adminId: Schema.Types.ObjectId,
        userId: Schema.Types.ObjectId,

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

