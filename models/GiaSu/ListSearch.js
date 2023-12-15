
const mongoose = require("mongoose");
const list_search = new mongoose.Schema({

    ls_id : {
        type : Number, 
        required: true,
        unique: true,
        autoIncrement: true

    },
    ls_name : {
        type : String, 

    },
    type : {
        type : Number, 

    },
    ls_cate : {
        type : Number, 

    },
    js_parent : {
        type : Number, 
        default : 0
    },

}, {
    collection: "GS_list_search",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_list_search", list_search);