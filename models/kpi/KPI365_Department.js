const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Department = new Schema({
    id: { // ID Phòng ban
        type: Number,
        required: true
    },
    dep_id: { // ID Phòng ban
        type: Number,
    },
    manage_id: {// ID quản lý
        type: String,
        default: "0"
    },
    followers_id: { // ID người theo dõi	
        type: String,
        default: "0"
    },
    created_at: {// Ngày tạo
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    com_id: {
        type: Number,
    },
},
    {
        collection: "KPI365_Department",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Department', KPI365_Department);