const mongoose = require("mongoose");
const offer_teach = new mongoose.Schema({

    ot_id : {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true
    },
    ugs_id : {
        type : Number,

    },
    ugs_parent : {
        type : Number,

    },
    pft_id : {
        type : Number,

    },
    as_id : {
        type : Number,

    },
    ot_date : {
        type : Number,

    },
    received_date : {
        type : Number,

    },
    ot_status : {
        type : Number,

    },

}, {
    collection: "GS_offer_teach",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_offer_teach", offer_teach);