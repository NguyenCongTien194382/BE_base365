
const mongoose = require("mongoose");
const save_teach = new mongoose.Schema({

    st_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    st_pr_id : {
        type : Number,

    },
    ugs_teach : {
        type : Number,

    },
    st_form : {
        type : Number,

    },
    st_lesson : {
        type : Number,

    },
    st_address : {
        type : String,

    },
    st_it_teach : {
        type : String,

    },
    st_date : {
        type : Number,

    },

}, {
    collection: "GS_save_teach",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_save_teach", save_teach);