//Model này dùng để 
const mongoose = require('mongoose')


const FormSms = new mongoose.Schema({
    _id: {
        //id 
        type: Number,
        required: true
    },
    com_id: {
        //
        type: Number,
        required: true
    },
    name_form_sms: {
        //
        type: String,
        default: null
    },
    content_form_sms: {
        //
        type: String,
        default: null
    },
    user_create_id: {
        //
        type: Number,
        required: true
    },
    user_create_type: {
        //
        type: Number,
        default: 0
    },
    user_edit_id: {
        //
        type: Number,
        default: 0
    },
    user_edit_type: {
        //
        type: Number,
        default: 0
    },
    is_delete: {
        //
        type: Number,
        default: 0
    },
    created_at: {
        //
        type: Number,
        default: 0
    },
    updated_at: {
        //
        type: Number,
        default: 0
    },
},
{
    collection: "CRM_FormSms",
    versionKey: false,
    timestamp: true,
});

module.exports = mongoose.model('FormSms', FormSms);