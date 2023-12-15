//Cài đặt quyền có cần duyệt hay không sử dụng chức năng tổng đài tự động, gửi mail
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CRMPermissionAccountSchema = new Schema({
    emp_id: {
        type: Number,
        default: 0
    },
    com_id: {
        type: Number,
        default: 0
    },
    auto_call: { //gọi tự đông. 1: chờ duyệt, 2: không cần duyệt
        type: Number,
        default: 1
    },
    mail: { //gửi mail. 1: chờ duyệt, 2: không cần duyệt
        type: Number,
        default: 1
    },
    updated_at: {
        type: Number,
        // default: Math.floor(Date.now() / 1000)
    }
}, {
    collection: "CRM_Permission_Account",
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model('Permission_Account', CRMPermissionAccountSchema);