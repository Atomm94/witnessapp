const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        firstUserId: Schema.Types.ObjectId,
        secondUserId: Schema.Types.ObjectId,

        messages: {
           type: Object
        },
        delete: {
            type: Boolean,
            default: false
        }
    }
);

mongoose.model("chat", chatSchema);

