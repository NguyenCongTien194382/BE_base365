const mongoose = require("mongoose");
const save_parent = new mongoose.Schema({

    sp_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    ugs_id : {
        type : Number,

    },
    id_parent : {
        type : Number,

    },
    sp_detail : {
        type : String,

    },

}, {
    collection: "GS_save_parent",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_save_parent", save_parent);