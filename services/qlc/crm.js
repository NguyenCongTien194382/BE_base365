const Customer = require("../../models/crm/Customer/customer");
const functions = require("../../services/functions");

const inforHHP = functions.inForHHP();
const comID = inforHHP.company_id;

exports.emp_id = () => {
    return 10001194; // Đặng Thị Hằng
}

// const resoure = 3
// const status = 12
// const group = 437
// const type_crm = 2

exports.addCustomer = async(name, email, phone, id_cus_from, resoure, status, group, type, link_multi = '', from = 'tv365') => {
    try {
        await axios({
            method: "post",
            url: "https://api.timviec365.vn/api/crm/account/addUserToCrm",
            data: {
                gr_id: group,
                com_id: comID,
                cus_from: from,
                link_multi: link_multi,
                type: type,
                status: status,
                resoure: resoure,
                id_cus_from: id_cus_from,
                phone: phone,
                email: email,
                name: name,
                // emp_id: emp_id
                // cit_id: 0,
                // district_id: 0,
                // address: Hà Nội,
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        // const MaxId = await Customer.findOne({}, { cus_id: 1 }).sort({ cus_id: -1 });
        // const cus_id = Number(MaxId.cus_id) + 1;

        // let data = {
        //     cus_id,
        //     name,
        //     email,
        //     phone_number: phone,
        //     emp_id: inforHHP.id_dang_thi_hang,
        //     resoure,
        //     status,
        //     group_id: group,
        //     type,
        //     created_at: functions.getTimeNow(),
        //     updated_at: functions.getTimeNow(),
        //     company_id: comID,
        //     id_cus_from,
        //     cus_from: from
        // };
        // const customer = new Customer(data);
        // await customer.save();
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.editCustomer = async(name, email, phone, group, id_cus_from, from = 'tv365') => {
    try {
        let data = { updated_at: functions.getTimeNow() };

        if (name) data.name = name;
        if (email) data.email = email;
        if (phone) data.phone = phone;
        if (id_cus_from) data.id_cus_from = id_cus_from;
        if (from) data.cus_from = from;
        if (group) data.group_id = group;
        await Customer.updateOne({ id_cus_from, cus_from: from }, {
            $set: data
        });
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.deleteCustomer = async(id_cus_from, cus_from) => {
    try {
        await Customer.deleteOne({ id_cus_from, cus_from });
        return true;
    } catch (error) {
        return false;
    }
}