const mongoose = require("mongoose");
const modules = new mongoose.Schema({
     
    mod_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    mod_name : {
        type : String,
        default : null
    },
    mod_path : {
        type : String,
        default : null
    },
    mod_listname : {
        type : String,
    },
    mod_listfile : {
        type : String,
    },
    mod_order : {
        type : Number,
        default : 0
    },
    mod_help : {
        type : String,
    },
    lang_id : {
        type : Number,
        default : 1
    },
    mod_checkloca : {
        type : Number,
        default : 0
    },

}, {
    collection: "GS_modules",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_modules", modules);