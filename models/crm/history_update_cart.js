//Model này dùng để 
const mongoose = require('mongoose')


const history_update_cart = new mongoose.Schema({
    cart_id: {
        type: Number,
        require: true
    },
    emp_id: {
        type: Number,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    created_at: {
        type: Number,
        default: new Date().getTime() / 1000
    },
    updated_at: {
        type: Number,
        default: new Date().getTime() / 1000
    },

});

module.exports = mongoose.model('history_update_cart', history_update_cart);