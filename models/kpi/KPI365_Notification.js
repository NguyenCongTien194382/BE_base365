const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Notification = new Schema({
    id: { // ID thông báo
        type: Number,
        required: true
    },
    type_title: {// 1.Sơ đồ KPI, 2.Theo dõi KPI, 3.Cài đặt nhân viên, 4.Cài đặt
        type: Number,
    },
    content: {// Nội dung
        type: String,
    },
    login_type: {// 0.Nhân viên đăng nhập, 1.Công ty đăng nhập
        type: Number,
    },
    user_id: { // ID người dùng
        type: String,
        default: ""
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    type: { // 0.Thông báo, 1.Nhắc nhở
        type: Number,
    },
    company_id: { 
        type: Number,
    },
    seen: {
        type: String,
        default: ""
    },
    url: {
        type: String,
    },
},
{
    collection: "KPI365_Notification",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Notification', KPI365_Notification);