const mongoose = require("mongoose");
const teaching_schedule = new mongoose.Schema({
    // lịch có thể dạy của gia sư
    ts_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    ugs_id : {
        //id gia sư
        type : Number,

    },
    pft_id : {
        //id đăng tin tìm gia sư
        type : Number,

    },
    // morning : {
    //     //truyền từ 2 - 8 tương ứng sáng từ t2-CN
    //     type : String,

    // },
    // afternoon : {
    //       //truyền từ 2 - 8 tương ứng chiều từ t2-CN
    //     type : String,

    // },
    // evening : {
    //       //truyền từ 2 - 8 tương ứng tối từ t2-CN
    //     type : String,

    // },
    st2 : {
        type : Number,
        default : 0

    },
    st3 : {
        type : Number,
        default : 0

    },
    st4 : {
        type : Number,
        default : 0

    },
    st5 : {
        type : Number,
        default : 0

    },
    st6 : {
        type : Number,
        default : 0

    },
    st7 : {
        type : Number,
        default : 0

    },
    scn : {
        type : Number,
        default : 0

    },
    ct2 : {
        type : Number,
        default : 0

    },
    ct3 : {
        type : Number,
        default : 0

    },
    ct4 : {
        type : Number,
        default : 0

    },
    ct5 : {
        type : Number,
        default : 0

    },
    ct6 : {
        type : Number,
        default : 0

    },
    ct7 : {
        type : Number,
        default : 0

    },
    ccn : {
        type : Number,
        default : 0

    },
    tt2 : {
        type : Number,
        default : 0

    },
    tt3 : {
        type : Number,
        default : 0

    },
    tt4 : {
        type : Number,
        default : 0

    },
    tt5 : {
        type : Number,
        default : 0

    },
    tt6 : {
        type : Number,
        default : 0

    },
    tt7 : {
        type : Number,
        default : 0

    },
    tcn : {
        type : Number,
        default : 0

    },

}, {
    collection: "GS_teaching_schedule",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_teaching_schedule", teaching_schedule);