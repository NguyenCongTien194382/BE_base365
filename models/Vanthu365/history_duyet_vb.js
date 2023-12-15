const mongoose = require("mongoose");
const history_duyet_vb = new mongoose.Schema({
    _id: {
        type: Number
    },
    id_vb: {
        type: Number,
        required: true,
    },
    com_id: {
        type: Number,
        required: true,
    },
    id_user: {
        type: Number,
        required: true,
    },
    type_handling: {
        type: Number,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    }
})

module.exports = mongoose.model("Vanthu_history_duyet_vb", history_duyet_vb);