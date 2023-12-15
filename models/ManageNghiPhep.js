const mongoose = require('mongoose');
const ManageNghiPhepSchema = new mongoose.Schema({

    idFrom: {
        type: Number,
        require: true
    },
    idTo: {
        type: Number,
        require: true
    },
    com_id: {
        type: Number,
        require: true
    },
    from: {
        type: Number,
        require: true
    },
    end: {
        type: Number,
        require: true
    },
    fromDx: {
        type: Number,
    }
}, {
    collection: 'ManageNghiPhep',
    versionKey: false,
    timestamp: true
})
module.exports = mongoose.model("ManageNghiPhep", ManageNghiPhepSchema);