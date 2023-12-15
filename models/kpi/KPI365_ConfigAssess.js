const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_ConfigAssess = new Schema({
    id: {// id cấu hình đánh giá
        type: Number,
        required: true
    },
    start: {// Từ
        type: Number,
    },
    end: {// Đến
        type: Number,
    },
    scores: {// Thang điểm
        type: Number,
    },
    trend: {// Xu hướng 0: Không đạt 1: Đạt
        type: Number,
    },
    time: {// Thời gian thực hiện 0: Quá hạn, 1: Thực hiện
        type: Number,
    },
    color: {// Màu sắc
        type: String,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    com_id: {// ID công ty
        type: Number,
    },
},
    {
        collection: "KPI365_ConfigAssess",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_ConfigAssess', KPI365_ConfigAssess);