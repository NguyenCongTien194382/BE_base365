
const mongoose = require("mongoose");
const save_course = new mongoose.Schema({

    sc_id : {
        type : Number, 
        required: true,
        unique: true,
        autoIncrement: true

    },
    ugs_teach : {
        type : Number, 

    },
    pft_id : {
        type : Number, 

    },
    sc_status : {
        type : Number, 

    },
    sc_date : {
        type : Number, 

    },

}, {
    collection: "GS_save_course",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_save_course", save_course);