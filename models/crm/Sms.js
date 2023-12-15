//Model này dùng để 
const mongoose = require('mongoose');
const { Date } = require('mongoose/lib/schema/index');


const Sms = new mongoose.Schema({
    _id: {
        //id 
        type: Number,
        required: true
    },
    company_id: {
        //
        type: Number,
        required: true
    },
    customer_id: {
        //
        type: Number,
        default: 0,
    },
    phone_receive: {
        //
        type: String,
        default: null,
    },
    content: {
        //
        type: String,
        default: null,
    },
    supplier: {
        //
        type: Number,
        default: 0,
    },
    phone_send: {
        //
        type: String,
        default: null,
    },
    info_system: {
        //
        type: Number,
        default: 0,
    },
    date_send_email: {
        //
        type: Number,
        default: 0,
    },
    time_send_email: {
        //
        type: String,
        default: null,
    },
    user_create_id: {
        //
        type: Number,
        required: true
    },
    user_create_type: {
        //
        type: Number,
        required: true
    },
    user_edit_id: {
        //
        type: Number,
        default: 0,
    },
    user_edit_type: {
        //
        type: Number,
        default: 0,
    },
    status: {
        //
        type: Number,
        default: 0,
    },
    is_delete: {
        //
        type: Number,
        default: 0,
    },
    created_at: {
        //
        type: Number,
        default: 0,
    },
    updated_at: {
        //
        type: Number,
        default: 0,
    },
},
{
    collection: "CRM_Sms",
    versionKey: false,
    timestamp: true,
}
);

module.exports = mongoose.model('CRM_Sms', Sms);