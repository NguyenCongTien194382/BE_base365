const mongoose = require("mongoose");
const gs_comment_rate = new mongoose.Schema({
    // tỉ lệ bình luận
    comment_rate_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    // id hướng dẫn sử dụng
    gs_userteach_id : {
        type : Number,

    },
    // id của cha mẹ
    gs_userparent_id : {
        type : Number,

    },
    // tỷ lệ
    rate : {
        type : Number,

    },
    // nội dung bình luận
    comment_content : {
        type : String,

    },
    // thời gian bình luận
    time_comment : {
        type : Date,
        default : new Date()

    },

}, {
    collection: "GS_gs_comment_rate",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_gs_comment_rate", gs_comment_rate);