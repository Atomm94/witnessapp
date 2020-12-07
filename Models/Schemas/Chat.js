const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        firstUserId: Schema.Types.ObjectId,
        secondUserId: Schema.Types.ObjectId,

        messages: {
           type: Object
        }
    }
);

mongoose.model("chat", chatSchema);

