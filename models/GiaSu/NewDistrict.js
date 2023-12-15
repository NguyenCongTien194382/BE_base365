const mongoose = require("mongoose");
const new_district = new mongoose.Schema({

    new_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    dis_parent : {
        type : Number,

    },
    dist_id : {
        type : Number,

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
    type : {
        type : Number,
        default : 1

    },

}, {
    collection: "GS_new_district",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_new_district", new_district);