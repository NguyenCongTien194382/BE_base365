const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_Assess = new Schema({
    id: {// id đánh giá
        type: Number,
        required: true
    },
    kpi_id: {// id kpi
        type: Number,
    },
    staff_id: {// id nhân viên
        type: Number,
    },
    content: {// Nội dung
        type: String,
        default: ""
    },
    created_at: {// Ngày
        type: Number,
    },
    updated_at: {// Ngày cập nhật
        type: Number,
        default: 0
    },
    type: {// 1: Quản lý, 2: Người theo dõi
        type: Number
    },
},
{
    collection: "KPI365_Assess",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_Assess', KPI365_Assess);