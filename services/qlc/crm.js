const Customer = require("../../models/crm/Customer/customer");
const functions = require("../../services/functions");
const axios = require("axios")

const inforHHP = functions.inForHHP();
const comID = inforHHP.company_id;

exports.emp_id = () => {
    return 10001194; // Đặng Thị Hằng
}

// const resoure = 3
// const status = 12
// const group = 437
// const type_crm = 2

exports.addCustomer = async (name, email, phone, id_cus_from, resoure, status, group, type, link_multi = '', from = 'tv365') => {
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
                emp_id: 10020503
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

exports.editCustomer = async (name, email, phone, group, id_cus_from, from = 'tv365') => {
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

exports.deleteCustomer = async (id_cus_from, cus_from) => {
    try {
        await Customer.deleteOne({ id_cus_from, cus_from });
        return true;
    } catch (error) {
        return false;
    }
}


exports.send_message = async (info_company, domain) => {
    try {
        console.log("vào gửi tin nhắn")
        let liveChat = {
            ClientId: info_company._id + '_liveChatV2',
            ClientName: info_company.userName,//Tên công ty vừa dky
            FromWeb: domain,
            FromConversation: 160807
        };
        let dataSend = {
            companyID: 59721, // idQLC của người gửi (ở đây mặc định là tài khoản 59721)
            idChat: info_company._id, //_id của cty đăng ký
            idKD: 10020503,//IdQLC của Hằng
            name: info_company.userName,//Tên công ty vừa dky
            domain: domain,
            liveChat: liveChat
        };
        dataSend.InfoSupportTitle = "ĐĂNG KÝ CHẤM CÔNG";
        dataSend.message = "Xin chào, tôi tên là " + dataSend.name + ", tôi vừa đăng ký tài khoản công ty trên " + dataSend.domain + ", tôi cần bạn hỗ trợ!";
        dataSend.messageShow = dataSend.name + " vừa đăng ký tài khoản công ty trên " + dataSend.domain;

        if (dataSend.idChat != 0 && dataSend.idKD != 0) {

            let dataMess = {
                ContactId: dataSend.idKD,
                SenderID: dataSend.companyID,
                Message: dataSend.messageShow,
                MessageType: 'text',
                LiveChat: JSON.stringify(dataSend.liveChat),
                InfoSupport: JSON.stringify({
                    Title: dataSend.InfoSupportTitle,
                    Status: 0,
                }),
                MessageInforSupport: dataSend.message,
            };
            console.log("Dữ liệu gửi tin nhắn", dataMess);
            await axios.post("http://210.245.108.202:9000/api/message/SendMessage_v2", dataMess);
            console.log("gửi tin nhắn thành công")
        }

    } catch (error) {
        return false;
    }
}