const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    emp_id_old: {
        type: Number
    },
    emp_id_new: {
        type: Number
    },
    customer_id: {
        type: Number
    },
    stt: {
        type: Number,
        default: 1
    },
    reason: {
        type: String
    },
    fromWeb: {
        type: String
    },
    last_time_called: {
        type: Number
    },
    time_tranfer: {
        type: Number
    }
}, {
    collection: "CRM_HistoryTransferNotCall",
    versionKey: false,
    timestamp: true
});
module.exports = mongoose.model("CRM_HistoryTransferNotCall", schema);