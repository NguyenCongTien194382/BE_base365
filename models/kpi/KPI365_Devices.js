const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Devices = new Schema({
    id: { // ID thiết bị
        type: Number,
        required: true
    },
    user_id: { // ID người dùng
        type: Number,
    },
    info_browser: {// Thông tin thiết bị
        type: String,
    },
    last_login: { // Địa chỉ đăng nhập
        type: String,
    },
    device_type: {// 0.pc, 1.mobile, tablet
        type: Number,
    },
    login_type: {//	0.Đăng nhập nhân viên, 1.Đăng nhập công ty
        type: Number,
    },
    created_at: {// Ngày tạo
        type: Number,
    },
},
{
    collection: "KPI365_Devices",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Devices', KPI365_Devices);