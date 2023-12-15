const mongoose = require("mongoose");
const campaign_customer = mongoose.Schema({
    id: {
        type: Number,
        require: true
    },
    cus_id: {
        type: Number,
        require: true
    },
    email_id: {
        type: Number,
        require: true
    },
    created_at: {
        type: Number,
        default: 0
    },
}, {
    collection: "CRM_email_potential"
});
module.exports = mongoose.model('CRM_email_potential', campaign_customer);