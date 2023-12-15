//Model này dùng để 
const mongoose = require('mongoose');
const { Date } = require('mongoose/lib/schema/index');


const EmailSms = new mongoose.Schema({
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
    type: {
        //
        type: Number,
        required: true
    },
    campaign_id: {
        //
        type: Number,
        required: true
    },
    email_id: {
        //
        type: Number,
        default: 0,
    },
    sample_sms_id: {
        //
        type: Number,
        default: 0,
    },
    title: {
        //
        type: String,
        default: null,
    },
    name: {
        //
        type: String,
        default: null,
    },
    content: {
        //
        type: String,
        default: null,
    },
    list_email_receiver: {
        //danh sach email can gui
        type: String,
        default: null
    },
    supplier: {
        //
        type: Number,
        default: 0,
    },
    all_receiver: {
        //
        type: Number,
        default: 0,
    },
    list_receiver: {
        //
        type: String,
        default: null,
    },
    email_send: {
        //
        type: String,
        default: null,
    },
    email_reply: {
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
        //1 => da gui, 0 -> chua gui
        type: Number,
        default: 0,
    },
    customer_id: {
        //
        type: Number,
        default: 0,
    },
    time_service: {
        //
        type: Number,
        default: 0,
    },
    sell_value: {
        //
        type: Number,
        default: 0,
    },
    time_service_end: {
        //
        type: Number,
        default: 0,
    },
    sell_value_end: {
        //
        type: Number,
        default: 0,
    },
    cit_id: {
        //
        type: Number,
        default: 0,
    },
    birth_day: {
        //
        type: Number,
        default: 0,
    },
    birthday_end: {
        //
        type: Number,
        default: 0,
    },
    emp_id: {
        //
        type: Number,
        default: 0,
    },
    cus_date: {
        //
        type: Number,
        default: 0,
    },
    cus_date_end: {
        //
        type: Number,
        default: 0,
    },
    resource: {
        //
        type: String,
        default: 0,
    },
    gender: {
        //
        type: Number,
        default: 0,
    },
    start_date: {
        //
        type: Number,
        default: 0,
    },
    gr_id: {
        //
        type: Number,
        default: 0,
    },
    send_time: {
        //
        type: Number,
        default: 0,
    },
    site: {
        //
        type: Number,
        default: 0,
    },
    id_color: {
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
    collection: "CRM_EmailSms",
    versionKey: false,
    timestamps: true,
}
);

module.exports = mongoose.model('CRM_EmailSms', EmailSms);