//Model này dùng để 
const mongoose = require('mongoose')


const SmsSetting = new mongoose.Schema({
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
    //1-> ca nhan, 2-> he thong
    type: {
        //
        type: Number,
        default: 0
    },
    account: {
        //
        type: String,
        required: true
    },
    password: {
        //
        type: String,
        required: true
    },
    brand_name: {
        //
        type: String,
        default: null
    },
    //mang viettel
    cp_code: {
      type: Number,
      default: 0
    },
    so_du: {
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
    is_delete: {
        //
        type: Number,
        default: 0
    },
},
{
    collection: "CRM_SmsSetting",
    versionKey: false,
    timestamp: true,
});

module.exports = mongoose.model('SmsSetting', SmsSetting);