const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProficiencySchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: null,
    },
    img: {
        type: String,
        default: null,
    },
    id_user: {
        type: Number,
        default: null,
    },
    type_proficiency: {
        type: Number,
        default: null,
    },
    updated_at: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_Proficiency',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_Proficiency",ProficiencySchema);
