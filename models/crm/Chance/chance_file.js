const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crm_chance_file = new Schema({
    id : {
        type : Number,
        require : true
    },
    file_name : {
        type : String,
        default: null
    },
    chance_id : {
        type : Number,
        default: 0
    },
    user_created_id : {
        type : Number,
        default: 0
    },
    file_size : {
        type : Number,
        default: 0
    },
    created_at : {
        type : Number,
        default: 0
    }
},{
    collection: 'CRM_chance_file',
    versionKey: false,
    timestamps: true
})
module.exports = mongoose.model("crm_chance_file", crm_chance_file);