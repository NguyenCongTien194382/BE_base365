const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Result = new Schema({
    id: { // ID kết quả
        type: Number,
        required: true
    },
    kpi_id: {// ID kpi
        type: Number,
    },
    name: {// Tên kết quả
        type: String,
    },
    result: {// Kết quả
        type: String,
        default: ""
    },
    time_achieved: { // Thời gian đạt được
        type: Number,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    accuracy: { // 0.Không xác thực, 1.Xác thực
        type: Number,
        default: 0
    },
    staff_id: { // ID nhân viên
        type: String,
    },
    channel: { // 0.KPI
        type: Number,
        default: 0
    },
    target_id: { // ID chỉ tiêu
        type: Number,
        default: 0
    },
},
{
    collection: "KPI365_Result",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Result', KPI365_Result);