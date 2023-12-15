const mongoose = require("mongoose");
const user_experience = new mongoose.Schema({
    //Bảng kinh nghiệm làm việc
    ue_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    ugs_id : {
        type : Number,

    },
    ugs_title : {
        type : String,

    },
    ugs_year_start : {
        type : Number,
        default : null

    },
    ugs_year_end : {
        type : Number,
        default : null

    },
    ugs_job_description : {
        type : String,

    },

}, {
    collection: "GS_user_experience",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_user_experience", user_experience);