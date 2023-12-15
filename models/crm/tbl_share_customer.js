const mongoose = require('mongoose');
const shareCustomer = new mongoose.Schema({
    _id: {
        type: Number
    },
    customer_id: {
        type: Number,
        required: true
    },
    dep_id: {
        type: Number,
        default: 0
    },
    emp_id: {
        type: Number,
        default: 0
    },
    role: {
        // 1 => xem, 2-> Sua, 3-> Ta ca quyen
        type: Number,
        default: 0
    },
    share_related_list: {
        type: Number,
        default: 0
    },
    user_create_id: {
        type: Number,
        default: 0
    },
    user_create_type: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: 0
    },
    updated_at: {
        type: Number,
        default: 0
    }
},
{
    collection: "CRM_ShareCustomer",
    versionKey: false,
    timestamps: true
});
module.exports = mongoose.model('CRM_ShareCustomer', shareCustomer);