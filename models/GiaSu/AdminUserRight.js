
const mongoose = require("mongoose");
const admin_user_right = new mongoose.Schema({

    adu_admin_id : {
        type: Number,
        required: true,
    },
    adu_admin_module_id : [
        {
        type: String,
        default : 0,
      }
    ],
    adu_add : {
        type: Number,
        default : 0,
    },
    adu_edit : {
        type: Number,
        default : 0,
    },
    adu_delete : {
        type: Number,
        default : 0,
    },

}, {
    collection: "GS_admin_user_right",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_admin_user_right", admin_user_right);