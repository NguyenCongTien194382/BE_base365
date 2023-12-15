
const mongoose = require("mongoose");
const gs_reply_comment = new mongoose.Schema({
    // bình luận phản hồi
    rep_comment_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    // id của comment
    gs_comment_id : {
        type : Number,

    },
    // id của người dạy
    gs_userteach_id : {
        type : Number,
    },
    // id của bố mẹ người dạy
    gs_userparent_id : {
        type : Number,
    
    },
    // nội dung phản hồi
    comment_reply : {
        type : String,
    
    },
    // thời gian phản hồi
    time_comment_rep : {
        type : Date,
        default : new Date()
    },

}, {
    collection: "GS_gs_reply_comment",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_gs_reply_comment", gs_reply_comment);