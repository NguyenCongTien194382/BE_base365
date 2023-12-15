const Customer = require("../../../models/crm/Customer/customer");
const Users = require('../../../models/Users');
const PointCompany = require('../../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointCompany');
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');
const HistoryTransferNotCall = require('../../../models/crm/history/HistoryTransferNotCall');

const functions = require("../../../services/functions");
const axios = require("axios");
const FormData = require('form-data');

var mongoose = require('mongoose');
const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';
mongoose.connect(DB_URL)
    .then(() => console.log('DB Connected!'))
    .catch(error => console.log('DB connection error:', error.message));

const getHistoryTransfer = async() => {
    try {
        const list_emp = await Users.aggregate([{
            $match: {
                type: 2,
                "inForPerson.employee.com_id": 10003087
            }
        }, {
            $project: {
                _id: 0,
                emp_id: "$idQLC",
                emp_name: "$userName"
            }
        }]);
        const page = 1,
            pageSize = 30;

        const listHistory = await HistoryTransferNotCall.aggregate([
            { $sort: { _id: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "Users",
                    localField: "emp_id_old",
                    foreignField: "idQLC",
                    as: "emp_old"
                }
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "emp_id_new",
                    foreignField: "idQLC",
                    as: "emp_new"
                }
            },
            {
                $lookup: {
                    from: "CRM_customer",
                    localField: "customer_id",
                    foreignField: "cus_id",
                    as: "customer"
                }
            },
            {
                $project: {
                    emp_name_old: "$emp_old.userName",
                    emp_name_new: "$emp_new.userName",
                    phone_number: "$customer.phone_number",
                    reason: 1,
                    time_tranfer: 1,
                }
            }
        ]);

        for (let i = 0; i < listHistory.length; i++) {
            const element = listHistory[i];
            element.emp_name_old = element.emp_name_old.toString();
            element.emp_name_new = element.emp_name_new.toString();
            element.phone_number = element.phone_number.toString();
            // element.emp_name_old = element.emp_name_old.toString();
        }

        console.log(listHistory);
    } catch (error) {
        console.log(error);
        return false;
    }
}

getHistoryTransfer();