const mongoose = require("mongoose");
const new_home = new mongoose.Schema({

    new_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

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
    collection: "GS_new_home",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_home", new_home);