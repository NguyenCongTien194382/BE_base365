const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_TargetUnit = new Schema({
    id: { // ID đơn vị mục tiêu
        type: Number,
        required: true
    },
    type_unit: {// 1.Tài chính, 2.Khách hàng, 3.Quy trình nội bộ, 4.Học hỏi và phát triển, 5.OKR
        type: Number,
    },
    name: {// Tên đơn vị
        type: String,
    },
    unit: { // Đơn vị tính
        type: String,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    is_deleted: { // 0.Không xóa,1.Đã xóa, 2.Xóa vĩnh viễn
        type: Number,
        default: 0
    },
    com_id: {
        type: Number,
    },
    formula: { // Công thức
        type: String,
    },
    note: { // Mô tả
        type: String,
    },
},
{
    collection: "KPI365_TargetUnit",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_TargetUnit', KPI365_TargetUnit);