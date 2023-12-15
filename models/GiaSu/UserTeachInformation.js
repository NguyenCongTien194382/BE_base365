
const mongoose = require("mongoose");
const user_teach_information = new mongoose.Schema({

    ugs_ti : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    ugs_id : {
        type : Number,
    },
    ugs_formality : {
        type : Number,
        default : 0,
    },
    ugs_unit_price : {//Mức lương theo giờ
        type : Number,
        default : null,
    },
    ugs_time : {
        type : String,
        default : null,
    },
    ugs_salary : {//Mức lương mong muốn
        type : String,
        default : null,
    },
    ugs_month : {
        type : String,
        default : null,
    },

}, {
    collection: "GS_user_teach_information",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_user_teach_information", user_teach_information);