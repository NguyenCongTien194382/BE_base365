const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleModuleSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    adm_id: {
        type: Number,
        default: null,
    },
    module_id: {
        type: Number,
        default: null,
    },
    create: {
        type: Number,
        default: null,
    },
    update: {
        type: Number,
        default: null,
    },
    delete: {
        type: Number,
        default: null,
    },
    show: {
        type: Number,
        default: null,
    },
},{
    collection: 'FLC_RoleModule',
    versionKey: false,
    timestamp: true
});

module.exports = mongoose.model("FLC_RoleModule",RoleModuleSchema);
