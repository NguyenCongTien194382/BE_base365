const User = require("../../models/Users");
const functions = require('../../services/functions');
const Position = require('../../models/qlc/Positions');
const Users = require('../../models/Users');
const axios = require('axios')
const CRM_customer_group = require('../../models/crm/Customer/customer_group');
const Customer = require("../../models/crm/Customer/customer");
const AdminUser = require('../../models/Timviec365/Admin/AdminUser');
const AdminNhanSuCrm = require('../../models/Timviec365/Admin/AdminNhanSuCrm');
const Positions = require('../../models/qlc/Positions')
const serviceCrm = require('../../services/CRM/crm')
const CRM_site_infor = require("../../models/crm/site_infor");
const history_update_cart = require("../../models/crm/history_update_cart")

var mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost:27017/api-base365';
mongoose.connect(DB_URL)
    .then(() => console.log('APP CRM: DB Connected!'))
    .catch(error => console.log('APP CRM: DB connection error:', error.message));
const getChuyenVien = async(gr_id) => {
    let response = await serviceCrm.takeDataChuyenVien(gr_id);
    console.log(response);
}
getChuyenVien(445)