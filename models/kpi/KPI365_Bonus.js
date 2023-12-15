const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Bonus = new Schema({
    id: {// id thưởng
        type: Number,
        required: true
    },
    condition: {// Điều kiện thưởng 1:%, 2: Điểm
        type: Number,
    },
    start: {// Từ
        type: Number,
    },
    end: {// Đến
        type: Number,
    },
    value: {// Mức thưởng
        type: Number,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    kpi_id: {// ID KPI
        type: Number,
    },
    is_deleted: {// 0: Không xóa 1: Đã xóa 2: Xóa vĩnh viễn
        type: Number,
        default: 0
    },
},
    {
        collection: "KPI365_Bonus",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Bonus', KPI365_Bonus);