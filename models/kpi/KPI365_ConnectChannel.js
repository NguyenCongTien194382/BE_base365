const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KPI365_ConnectChannel = new Schema({
    id: {
        type: Number,
        required: true
    },
    kpi_id  : {
        type: Number,
    },
    channel: {// 1-CRM 2-DMS 3-QLBH 4-GV 5-HR
        type: Number,
    },
    type: {
        type: String,
    },
    token: {
        type: String,
    }
},
{
    collection: "KPI365_ConnectChannel",
    versionKey: false,
    timestamp: true
})

module.exports = mongoose.model('KPI365_ConnectChannel', KPI365_ConnectChannel);