const mongoose = require("mongoose");
const admin_user = new mongoose.Schema({

    id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    id_level : {
        type : Number,

    },
    id_type : {
        type : Number,

    },
    meta_tit : {
        type : String,

    },
    meta_des : {
        type : String,

    },
    meta_key : {
        type : String,

    },
    content : {
        type : String,

    },
    title_suggest : {
        type : String,

    },
    content_suggest : {
        type : String,

    },

}, {
    collection: "GS_new_level_class",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_level_class", admin_user);