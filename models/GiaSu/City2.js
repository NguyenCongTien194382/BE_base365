const mongoose = require("mongoose");
const city2 = new mongoose.Schema({

    cit_id: {
        type : Number,
        required: true,
        unique: true,
        autoIncrement: true

    },
    cit_name: {
        type : String,
        default : null

    },
    cit_order: {
        type : Number,
        default : 0

    },
    cit_type: {
        type : Number,
        default : null

    },
    cit_count: {
        type : Number,
        default : 0

    },
    cit_parent: {
        type : Number,

    },
    
}, {
    collection: "GS_city2",
    versionKey: false,
}
);
module.exports = mongoose.model("GS_city2", city2);