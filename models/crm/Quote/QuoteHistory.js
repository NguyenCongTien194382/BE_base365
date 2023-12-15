const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crm_quote_history = new Schema({
    // Lịch sử báo giá

    // Tự sinh
    id: {
        type: Number,
        require: true
    },
    com_id: {
        type: Number,
        require: true
    },

    quote_id: {
        type: Number,
        require: true
    },
    action: { // Làm gì
        type: String,
        default: ""
    },
    user_id: { // Bởi ai
        type: Number,
        require: true
    },
    modify_at: { // Khi nào
        type: Date,
        require: true
    },

    is_delete: {
        type: Number,
        default: 0
    },
}, {
    collection: 'CRM_Quote_History',
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('CRM_Quote_History', crm_quote_history)
