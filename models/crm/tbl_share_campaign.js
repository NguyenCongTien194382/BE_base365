const mongoose = require('mongoose');
const tbl_share_campaign = new mongoose.Schema({
    _id: {
        type: Number
    },
    campaign_id: {
        type: Number,
        required: true
    },
    dep_id: {
        type: Number,
        default: 0
    },
    emp_id: {
        type: Number,
        default: 0
    },
    role: {
        // 1 => xem, 2-> Sua, 3-> Ta ca quyen
        type: Number,
        default: 0
    },
    share_related_list: {
        type: Number,
        default: 0
    },
    user_create_id: {
        type: Number,
        default: 0
    },
    user_create_type: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: 0
    },
    updated_at: {
        type: Number,
        default: 0
    }
},
    {
        collection: "CRM_ShareCampaign",
        versionKey: false,
        timestamp: true
    });
module.exports = mongoose.model("CRM_ShareCampaign", tbl_share_campaign);