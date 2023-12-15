const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Settings = new Schema({
    id: { // ID cài đặt
        type: Number,
        required: true
    },
    language: {// 0.Tiếng Việt, 1.Tiếng Anh
        type: Number,
        default: 0
    },
    setting: {// 1,2,3,4,5,6
        type: Number,
    },
    user_id: { // ID người dùng
        type: Number,
    },
    display: { // Giao diện: 0.Xanh, 1.Trắng
        type: Number,
        default: 0
    },
    login_type: {// 0.Đăng nhập nhân viên, 1.Đăng nhập công ty
        type: Number,
    },
},
{
    collection: "KPI365_Settings",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Settings', KPI365_Settings);