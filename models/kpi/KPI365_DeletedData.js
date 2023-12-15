const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_DeletedData = new Schema({
    id: { // ID dữ liệu xóa
        type: Number,
        required: true
    },
    type: { // 1.KPI, 2.Thưởng, 3.Nhóm mới, 4.Đơn vị mục tiêu
        type: Number,
    },
    created_at: {// Ngày, giờ tạo
        type: Number,
    },
    deleted_id: { // ID dữ liệu đã xóa
        type: Number,
    },
    date: {// Ngày tạo
        type: String,
    },
    com_id: {// ID công ty
        type: Number,
    },
    user_name: {// Tên người xóa
        type: String,
    },
    content: {// Nội dung
        type: String,
    },
    
    
},
{
    collection: "KPI365_DeletedData",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_DeletedData', KPI365_DeletedData);