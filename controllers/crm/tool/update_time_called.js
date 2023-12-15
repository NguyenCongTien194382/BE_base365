const Customer = require("../../../models/crm/Customer/customer");
const axios = require("axios");
const functions = require("../../../services/functions");

var mongoose = require('mongoose');
const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';
mongoose.connect(DB_URL)
    .then(() => console.log('DB Connected!'))
    .catch(error => console.log('DB connection error:', error.message));

const company_id = 10003087;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const update_time_called = async() => {
    try {
        while (true) {
            await sleep(2000);
            const list_customer = await Customer.find({
                company_id,
                last_time_called: { $in: [0, null] },
                phone_number: { $nin: ['', null] }
            }).sort({ cus_id: -1 }).limit(50);
            let list_phone_after_query = list_customer.map(item => item.phone_number);
            // Call api lấy ds phone_number đã được gọi
            const response = await axios({
                method: "post",
                url: "https://voip.timviec365.vn/api/GetListCustomerAnswer",
                data: {
                    comId: company_id,
                    listPhone: list_phone_after_query.toString()
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            const listPhoneNumber = response.data.data.listPhoneNumber;
            // console.log(listPhoneNumber)
            for (let i = 0; i < listPhoneNumber.length; i++) {
                const element = listPhoneNumber[i];
                const customer = list_customer.find(item => item.phone_number == element.phone);
                const last_time_called = element.timeStart != "" ? functions.convertTimestamp(element.timeStart) : 1;
                const last_status_called = element.status;
                if (customer) {
                    await Customer.updateOne({ cus_id: customer.cus_id }, {
                        $set: {
                            last_time_called,
                            last_status_called
                        }
                    });
                    console.log(`Cập nhật thành công: ${customer.cus_id}, ${last_time_called}, ${last_status_called}`)
                }
            }
        }
    } catch (error) {
        console.log(error);
        await update_time_called();
    }
}

update_time_called();