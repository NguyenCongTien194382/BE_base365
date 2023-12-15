const mongoose = require("mongoose");
const invite_teach = new mongoose.Schema({
    // mời dạy
    it_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    ugs_parent : {
        type : Number,

    },
    ugs_teach : {
        type : Number,

    },
    it_class_code : {
        type : Number,

    },
    as_id : {
        type : Number,

    },
    it_address : {
        type : String,

    },
    day_invitation_teach : {
        type : Number,

    },
    received_date : {
        type : Number,

    },
    it_status : {
        //1: đã gửi, 2: đồng ý, 3: từ chối, 4: kết thúc 
        type : Number,

    },
    type_invite_suggest : {
        //1: đề nghị, 0: mời dạy'
        type : Number,
        default : 0

    },
    hidden : {
        //'0: khi gs xóa lời mời'
        type : Number,
        default : 1

    },

}, {
    collection: "GS_invite_teach",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_invite_teach", invite_teach);