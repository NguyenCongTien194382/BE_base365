const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Organization = new Schema({
    id: { // ID Phòng ban
        type: Number,
        required: true
    },
    organization_id: { // ID Tổ chức
        type: Number,
    },
    manage_id: {// ID quản lý
        type: String,
        default: ""
    },
    followers_id: { // ID người theo dõi	
        type: String,
        default: ""
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
        collection: "KPI365_Organization",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Organization', KPI365_Organization);