const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Group = new Schema({
    id: { // ID nhóm
        type: Number,
        required: true
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
    group_id: { //ID nhóm
        type: Number,
    },
},
{
    collection: "KPI365_Group",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Group', KPI365_Group);