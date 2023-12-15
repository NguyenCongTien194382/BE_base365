const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistoryChangeCustomer = new Schema({
    customer_id: { type: Number },
    employee_id_old: { type: Number },
    employee_id_new: { type: Number },
    time_change: { type: Number }
}, {
    collection: 'CRM_HistoryChangeCustomer',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("CRM_HistoryChangeCustomer", HistoryChangeCustomer);