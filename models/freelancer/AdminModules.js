const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminModulesSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        default: null,
    },
    child_title: {
        type: String,
        default: null,
    },
    route: {
        type: String,
        default: null,
    },
},{
    collection: 'FLC_AdminModules',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_AdminModules",AdminModulesSchema);
