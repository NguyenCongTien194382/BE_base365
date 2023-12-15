const mongoose = require("mongoose");
const model_admin_user = new mongoose.Schema({

    adm_id : {
        type : Number,
        required: true,
    },
    adm_loginname : {
        type : String,
        default : null
    },
    adm_password : {
        type : String,
        default : null
    },
    adm_name : {
        type : String,
        default : null
    },
    adm_email : {
        type : String,
        default : null
    },
    adm_address : {
        type : String,
        default : null
    },
    adm_phone : {
        type : String,
        default : null
    },
    adm_mobile : {
        type : String,
        default : null
    },
    adm_access_module : {
        type : String,
        default : null
    },
    adm_access_category : {
        type : String,
    },
    adm_date : {
        type : Number,
        default : 0
    },
    adm_isadmin : {
        type : Number,
        default : 0
    },
    adm_active : {
        type : Number,
        default : 1
    },
    lang_id : {
        type : Number,
        default : 1
    },
    adm_delete : {
        type : Number,
        default : 0
    },
    adm_all_category : {
        type : Number,
        default : null
    },
    adm_edit_all : {
        type : Number,
        default : 0
    },
    admin_id : {
        type : Number,
        default : 0
    },
    adm_bophan : {
        type : Number,
        default : 0
    },
    meta_tit : {
        type : String,
    },
    meta_des : {
        type : String,
    },
    meta_key : {
        type : String,
    },
    adm_chamngon : {
        type : String,
        default : null
    },
    adm_sapo : {
        type : Number,
        default : null
    },
    adm_city : {
        type : Number,
        default : 0
    },
    adm_description : {
        type : String,
    },
    adm_picture : {
        type : String,
        default : null
    },
    adm_role : {
        type : Number,
    },


}, {
    collection: "GS_admin_user",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_admin_user", model_admin_user);
