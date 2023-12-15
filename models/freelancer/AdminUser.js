const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminUserSchema = new Schema({
    //id
    adm_id: {
        type: Number,
        required: true,
    },
    adm_loginname: {
        type: String,
        required: true,
    },
    adm_password: {
        type: String,
        required: true,
    },
    adm_name: {
        type: String,
        default: null,
    },
    adm_email: {
        type: String,
        default: null,
    },
    adm_address: {
        type: String,
        default: null,
    },
    adm_phone: {
        type: String,
        default: null,
    },
    adm_mobile: {
        type: String,
        default: null,
    },
    adm_access_module: {
        type: String,
        default: null,
    },
    adm_access_category: {
        type: String,
        default: null,
    },
    adm_date: {
        type: Number,
        default: 0,
    },
    adm_isadmin: {
        type: Number,
        default: 0,
    },
    adm_active: {
        type: Number,
        default: 0,
    },
    lang_id: {
        type: Number,
        default: 0,
    },
    adm_delete: {
        type: Number,
        default: 0,
    },
    adm_all_category: {
        type: Number,
        default: 0,
    },
    adm_edit_all: {
        type: Number,
        default: 0,
    },
    admin_id: {
        type: Number,
        required: true,
    },
    adm_bophan: {
        type: Number,
        default: 0,
    },
    meta_tit: {
        type: String,
        default: null,
    },
    meta_des: {
        type: String,
        default: null,
    },
    meta_key: {
        type: String,
        default: null,
    },
    adm_chamngon: {
        type: String,
        default: null,
    },
    adm_sapo: {
        type: Number,
        default: 0,
    },
    adm_city: {
        type: Number,
        default: 0,
    },
    adm_description: {
        type: String,
        default: null,
    },
    adm_picture: {
        type: String,
        default: null,
    },
    adm_role: {
        type: Number,
        default: 0,
    },
},{
    collection: 'FLC_AdminUser',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_AdminUser",AdminUserSchema);
