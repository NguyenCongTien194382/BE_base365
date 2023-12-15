const mongoose = require("mongoose");
const new_tags_gs = new mongoose.Schema({

    new_id : {
        type : Number, 
        required: true,
        unique: true,
        autoIncrement: true

    },
    tag_id : {
        type : Number, 

    },
    meta_tit : {
        type : String, 
        default : null

    },
    meta_key : {
        type : String, 
        default : null

    },
    meta_des : {
        type : String, 

    },
    content : {
        type : String, 

    },
    title_suggest : {
        type : String, 
        default : null

    },
    content_suggest : {
        type : String, 

    },
    new_type : {
        type : Number, 

    },

}, {
    collection: "GS_new_tags_gs",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_tags_gs", new_tags_gs);