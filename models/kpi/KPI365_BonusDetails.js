const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_BonusDetails = new Schema({
    id: {// id mức thưởng cho từng nhân viên
        type: Number,
        required: true
    },
    bonus_id: {// id thưởng
        type: Number,
    },
    staff_id: {// id nhân viên
        type: Number,
    },
    percent: {// Phần trăm thưởng
        type: Number,
    }
},
{
    collection: "KPI365_BonusDetails",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_BonusDetails', KPI365_BonusDetails);