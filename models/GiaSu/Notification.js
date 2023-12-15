const mongoose = require("mongoose");
const notification = new mongoose.Schema({

    noti_id : {
        type : Number,
        required: true,
        // unique: true,
        // autoIncrement: true

    },
    ugs_tutor : {
        //Gia sư
        type : Number,

    },
    ugs_parent : {
        //Phụ huynh
        type : Number,

    },
    pft_id : {
        //Lớp
        type : Number,

    },
    type : {
        type : Number,

    },
    noti_date : {
        //Ngày thêm thông báo
        type : Number,

    },

}, {
    collection: "GS_notification",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_notification", notification);