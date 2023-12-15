const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_ActivityDiary = new Schema({
    id: {// id nhật ký hoạt động
        type: Number,
        required: true
    },
    user_id: {// id người dùng
        type: Number,
    },
    type: {// 1: Sơ đồ KPI 2:Theo dõi KPI 3: Đánh giá KPI 4: Thiết lập KPI 5: Dữ liệu xóa 6: Phân quyền 7: Cài đặt
        type: Number,
    },
    content: {// Nội dung
        type: String,
        default: ""
    },
    created_at: {// Ngày, giờ tạo
        type: Number,
    },
    date: {// Ngày tạo
        type: String,
    },
    login_type: {// 1: Công ty đăng nhập 0:Nhân viên đăng nhập
        type: Number
    },
},
{
    collection: "KPI365_ActivityDiary",
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model('KPI365_ActivityDiary', KPI365_ActivityDiary);