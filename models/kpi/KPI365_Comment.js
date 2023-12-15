const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Comment = new Schema({
    id: {// id bình luận
        type: Number,
        required: true
    },
    kpi_id: {// id kpi
        type: Number,
    },
    staff_id: {// id nhân viên
        type: Number,
    },
    content: {// Nội dung
        type: String,
        default: "0"
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    comment_id: {// ID bình luận cha
        type: Number,
        default: 0
    },
    type: {// 0: only_content 1: has_img 2: has_file
        type: Number
    },
},
    {
        collection: "KPI365_Comment",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Comment', KPI365_Comment);