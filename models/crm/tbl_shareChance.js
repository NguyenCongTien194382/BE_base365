const mongoose = require('mongoose');
const tbl_shareChance = new mongoose.Schema({
    id: {
        type: Number
    },
    chance_id: {
        type: Number
    },
    emp_share: {
        type: Number
    },
    type: {
        type: String
    },
    dep_id: {
        type: Number
    },
    receiver_id: {
        type: Number
    },
    receiver_name: {
        type: String
    },
    role: {
        type: String
    },
    share_related_list: {
        type: Number
    },
    created_at: {
        type: Number
    },
    updated_at: {
        type: Number
    }
},
    {
        collection: "CRM_shareChance",
        versionKey: false,
        timestamp: true
    });

module.exports = mongoose.model('CRM_shareChance', tbl_shareChance);