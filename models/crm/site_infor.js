const mongoose = require("mongoose");
const CRM_site_infor = new mongoose.Schema({
    idQLC: {
        type: Number,
        require: true
    },
    type: {
        type: Number,
        require: true
    },
    cus_from: {
        type: String,
        require: true
    },
    link_update_cart: {
        type: String,
        require: true
    },
    createAt: {
        type: Number,
        default: 0
    },
    updateAt: {
        type: Number,
        default: 0
    }
}, {
    collection: "CRM_site_infor"
});
module.exports = mongoose.model("CRM_site_infor", CRM_site_infor);