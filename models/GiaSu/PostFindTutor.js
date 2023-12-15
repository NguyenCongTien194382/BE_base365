const mongoose = require("mongoose");
const post_find_tutor = new mongoose.Schema({

    pft_id : {
        //id lớp học
        type: Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    ugs_id : {
        type: Number,

    },
    pft_summary : {
        type: String,

    },
    alias : {
        type: String,

    },
    as_id : {
        type: Number,

    },
    ct_id : {
        type: Number,

    },
    as_detail : {
        type: Number,

    },
    pft_form : {
        //hinh thuc day
        type: String,
        // Gặp mặt / Online
    },
    pft_time : {
        type: String,

    },
    pft_nb_student : {
        type: String,

    },
    pft_nb_lesson : {
        ///id môn học
        type: Number,

    },
    pft_gender : {
        type: String,

    },
    tutor_style : {
        type: Number,

    },
    pft_school_day : {
        type: Number,

    },
    pft_phone : {
        type: String,

    },
    city_id : {
        type: Number,

    },
    city_detail : {
        type: Number,

    },
    pft_address : {
        type: String,

    },
    pft_detail : {
        type: String,

    },
    pft_price : {//Mức lương
        type: String,

    },
    pft_price_type : {
        //'1:cố định, 2: ước lượng',
        type: Number,
        default : 1 

    },
    pft_month : {
        type: String,

    },
    pft_view : {
        type: Number,

    },
    day_post : {
        type: Number,

    },
    day_update : {
        type: Number,

    },
    pft_status : {
        type: Number,

    },
    active : {
        type: Number,
        default : 0 

    },
    trangthai_lop : {
        //'0: đag tìm gs, 1: đã có gs, 2: kết thúc'
        type: Number,

    },
    check_index : {
        type: Number,
        default : 0 

    },

}, {
    collection: "GS_post_find_tutor",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_post_find_tutor", post_find_tutor);