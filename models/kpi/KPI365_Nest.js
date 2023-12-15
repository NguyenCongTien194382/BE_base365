const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Nest = new Schema({
    id: { // ID tổ
        type: Number,
        required: true
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
    nest_id: { //ID tổ
        type: Number,
    },
},
    {
        collection: "KPI365_Nest",
        versionKey: false,
        timestamp: true
    })

module.exports = mongoose.model('KPI365_Nest', KPI365_Nest);