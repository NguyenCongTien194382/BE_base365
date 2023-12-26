const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crm_quote_file = new Schema({
    // Tài liệu đính kèm báo giá

    id : {
        type : Number,
        require : true
    },
    file_name : {
        type : String,
        default: null
    },
    original_name: {
        type: String,
        default: null
    },
    quote_id : {
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
}, {
    collection: 'CRM_Quote_File',
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('CRM_Quote_File', crm_quote_file)