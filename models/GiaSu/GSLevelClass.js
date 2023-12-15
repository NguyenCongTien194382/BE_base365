
const mongoose = require("mongoose");
const gs_level_class = new mongoose.Schema({
    // lớp cấp
    level_class_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    level_class_name : {
        type : String,

    },
    slug_class_name : {
        type : String,

    },
    level_parent_id : {
        type : Number,

    },
    is_index_lvclas_teacher : {
        type : Number,
        default : 0

    },
    is_index_lvclas_class : {
        type : Number,
        default : 0

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
    collection: "GS_gs_level_class",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_gs_level_class", gs_level_class);