const User = require('../../../models/Users');
const Customer = require("../../../models/crm/Customer/customer");
const axios = require("axios");
const functions = require("../../../services/functions");

var mongoose = require('mongoose');
const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';
mongoose.connect(DB_URL)
    .then(() => console.log('DB Connected!'))
    .catch(error => console.log('DB connection error:', error.message));

const update_type_customer = async() => {
    try {

        return true;
    } catch (error) {
        console.log(error)
    }
};

// update_type_customer();