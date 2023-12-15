const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_ResultHistory = new Schema({
    id: { // ID kết quả
        type: Number,
        required: true
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
    staff_id: { // ID nhân viên
        type: String,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    kpi_id: { // ID kpi
        type: Number,
    },
    target_id: { // ID chỉ tiêu
        type: Number,
        default: 0
    },
},
{
    collection: "KPI365_ResultHistory",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_ResultHistory', KPI365_ResultHistory);