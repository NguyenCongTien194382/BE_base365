const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_NewGroup = new Schema({
    id: { // ID tổ
        type: Number,
        required: true
    },
    is_deleted: {// 0.Không xóa,1.Đã xóa, 2.Xóa vĩnh viễn
        type: Number,
        default: 0
    },
    group_name: {// Tên nhóm
        type: String,
    },
    manage_id: {// ID quản lý
        type: String,
    },
    followers_id: { // ID người theo dõi	
        type: String,
        default: "0"
    },
    com_id: { // ID công ty	
        type: Number,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    staff_id: { //ID thành viên
        type: String,
    },
},
    {
        collection: "KPI365_NewGroup",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_NewGroup', KPI365_NewGroup);