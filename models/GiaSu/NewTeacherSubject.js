const mongoose = require("mongoose");
const new_home = new mongoose.Schema({

    new_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    as_id : {
        type : Number,
        required: true,
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
    collection: "GS_new_teacher_subject",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_teacher_subject", new_home);