const mongoose = require("mongoose");
const new_teacher_city = new mongoose.Schema({

    new_id :{
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    city_id :{
        type : Number,

    },
    cit_title :{
        type : String,
        default : null

    },
    cit_description :{
        type : String,

    },
    cit_keyword :{
        type : String,
        default : null

    },
    content :{
        type : String,

    },
    title_suggest :{
        type : String,
        default : null

    },
    content_suggest :{
        type : String,

    },

}, {
    collection: "GS_new_teacher_city",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_teacher_city", new_teacher_city);