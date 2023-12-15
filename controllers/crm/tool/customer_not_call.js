const Customer = require("../../../models/crm/Customer/customer");
const Users = require('../../../models/Users');
const News = require('../../../models/Timviec365/UserOnSite/Company/New');
const PointCompany = require('../../../models/Timviec365/UserOnSite/Company/ManagerPoint/PointCompany');
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');
const HistoryTransferNotCall = require('../../../models/crm/history/HistoryTransferNotCall');
const CRM_site_infor = require("../../../models/crm/site_infor");
const functions = require("../../../services/functions");
const axios = require("axios");
const FormData = require('form-data');

const io = require('socket.io-client');

const socket = io.connect('http://43.239.223.142:3000', {
    secure: true,
    enabledTransports: ["wss"],
    transports: ['websocket', 'polling'],
});


var mongoose = require('mongoose');
const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';
mongoose.connect(DB_URL)
    .then(() => console.log('DB Connected!'))
    .catch(error => console.log('DB connection error:', error.message));


const filterCustomer = async(list) => {
    let customer_accept = [];
    // Kiểm tra xem NTD đã mua hàng hay chưa
    for (let i = 0; i < list.length; i++) {
        const customer = list[i];
        if (!customer.fromVip) {
            // Nếu là ntd đăng ký lỗi thì cho vào list
            if (customer.cus_from == 'tv365_error') {
                customer_accept.push(customer);
            }
            // Kiểm tra khách từ timviec365
            else if (customer.cus_from == 'tv365') {
                // Kiểm tra nguồn từ tìm việc xem có phải khách vip không?
                const is_buy = await PointCompany.findOne({ usc_id: Number(customer.id_cus_from) });
                // Nếu là khách chưa vip hoặc từng vip thì cho vào list.
                if (!is_buy || (is_buy && is_buy.point_usc == 0 && (is_buy.ngay_reset_diem_ve_0 == 0))) {
                    let listNew = await News.find({
                        new_user_id: Number(customer.id_cus_from),
                        $or: [{
                                new_hot: 1
                            },
                            {
                                new_gap: 1
                            },
                            {
                                new_cao: 1
                            },
                            {
                                new_ghim: 1
                            }
                        ]
                    });
                    if (listNew.length == 0) {
                        customer_accept.push(customer);
                    }
                };

            }
            // Kiểm tra khách từ w247
            else if (customer.cus_from == 'tv365com') {
                // let data = new FormData();
                // data.append('usc_id', Number(customer.id_cus_from));

                // let config = {
                //     method: 'post',
                //     maxBodyLength: Infinity,
                //     url: 'https://work247.vn/api202/check_company_vip.php',
                //     data: data
                // };

                // const response = await axios.request(config);
                // const check_vip = response.data;
                // if (!check_vip.result && check_vip.status == 'accept') {
                //     customer_accept.push(customer);
                // }
                //customer_accept.push(customer);
            }
            // api lỗi 
            // Kiểm tra khách từ vl88
            else if (customer.cus_from == 'tv365.com.vn') {
                // let data = new FormData();
                // data.append('usc_id', Number(customer.id_cus_from));

                // let config = {
                //     method: 'post',
                //     maxBodyLength: Infinity,
                //     url: 'https://vieclam88.vn/api/check_company_vip.php',
                //     data: data
                // };

                // const response = await axios.request(config);
                // const check_vip = response.data;
                // if (!check_vip.result && check_vip.status == 'accept') {
                //     customer_accept.push(customer);
                // }
                //customer_accept.push(customer);
            }
            // Kiểm tra khách từ vl24h
            else if (customer.cus_from == 'vl24h.net.vn') {

            }
        }
    }
    return customer_accept;
}

const SendMess = async(data) => {
    try {
        let takeConvId = await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/conversations/CreateNewConversation",
            data: {
                userId: Number(data.SenderID),
                contactId: Number(data.ContactId),
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/message/SendMessage",
            data: {
                ConversationID: Number(takeConvId.data.data.conversationId),
                SenderID: Number(data.SenderID),
                MessageType: 'text',
                Message: data.Message
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return true;
    } catch (e) {
        console.log("SendMess", e);
        return false;
    }
}
const updateAndSaveHistory = async(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from = 'tv365') => {
    try {
        let customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
        if (customer) {
            let phone = customer.phone_number;
            if ((!phone) || (isNaN(phone))) {
                phone = customer.email
            };
            // Kiểm tra xem có cuộc gọi phát sinh trong ngày hay không  
            let response = await axios({
                method: "post",
                url: "https://voip.timviec365.vn/api/CheckPhoneAnswer",
                data: {
                    phone_number: phone
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (response && response.data) {
                if (!response.data.data) {
                    let from = cus_from;
                    // Xong thì cập nhật nhân viên mới và thời gian quét bên CRM
                    await Customer.updateOne({ cus_id: customer_id }, {
                        $set: {
                            emp_id: emp_id_new,
                            last_scan_called: functions.getTimeNow(),
                            last_time_called: functions.getTimeNow()
                        }
                    });
                    // Cập nhật bên NTD gốc trước
                    if (from == 'tv365') {
                        await Users.updateOne({ idTimViec365: Number(id_cus_from), type: 1 }, {
                            $set: {
                                "inForCompany.usc_kd": adm_bophan
                            }
                        });
                        functions.tranferGioElastic(Number(id_cus_from));

                        let user_cu1 = await AdminUser.findOne({
                            emp_id: emp_id_old
                        }).lean();
                        if (user_cu1) {
                            let user_cu = await Users.findOne({ idQLC: user_cu1.emp_id_chat }, { idQLC: 1, _id: 1, userName: 1 }).lean();
                            let user_nhan = await Users.findOne({ idQLC: Number(emp_id_new) }).lean();
                            if (user_cu) {
                                console.log(user_cu1.adm_bophan, user_cu._id, user_cu.idQLC, user_cu.userName, `Khách hàng với ID CRM: ${customer_id} đã được chuyển khỏi giỏ của bạn`);
                                let info_customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
                                let data1 = {
                                    ContactId: user_cu._id,
                                    // ContactId: user_cu.idQLC,
                                    SenderID: 1192,
                                    MessageType: 'text',
                                    Message: `Khách hàng với ID CRM: ${customer_id},
                                    ID: ${info_customer.id_cus_from}
                                    email: ${info_customer.email },
                                    số điện thoại: ${info_customer.phone_number},
                                    đã được chuyển khỏi giỏ của bạn tới giỏ của ${user_nhan.userName}
                                    vào lúc ${new Date().getHours()}:${new Date().getMinutes()}
                                    `
                                }
                                let data2 = {
                                    ContactId: 10031577,

                                    SenderID: 1192,
                                    MessageType: 'text',
                                    Message: `Khách hàng với ID CRM: ${customer_id},
                                    ID: ${info_customer.id_cus_from}
                                    email: ${info_customer.email },
                                    số điện thoại: ${info_customer.phone_number},
                                    đã được chuyển khỏi giỏ của bạn tới giỏ của ${user_nhan.userName}
                                    vào lúc ${new Date().getHours()}:${new Date().getMinutes()}
                                    `
                                }
                                await SendMess(data1);
                                await SendMess(data2);
                            }
                        }

                        let user_moi1 = await AdminUser.findOne({
                            adm_bophan: adm_bophan
                        }).lean();

                        let user_moi = await Users.findOne({ idQLC: user_moi1.emp_id_chat }, { idQLC: 1, _id: 1, userName: 1 }).lean();
                        if (user_moi) {
                            console.log(adm_bophan, user_moi._id, user_moi.idQLC, user_moi.userName, `Khách hàng với ID CRM: ${customer_id} đã được chuyển tới giỏ của bạn`);
                            let info_customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
                            let data1 = {
                                ContactId: 10031577,
                                SenderID: 1192,
                                MessageType: 'text',
                                Message: `Khách hàng với ID CRM: ${customer_id},
                                         email: ${info_customer.email },
                                         số điện thoại: ${info_customer.phone_number},
                                         đã được chuyển tới giỏ của bạn
                                         `
                            };
                            let data2 = {
                                ContactId: user_moi._id,
                                // ContactId: user_moi.idQLC,
                                SenderID: 1192,
                                MessageType: 'text',
                                Message: `Khách hàng với ID CRM: ${customer_id},
                                email: ${info_customer.email },
                                số điện thoại: ${info_customer.phone_number},
                                đã được chuyển tới giỏ của bạn
                                `
                            };
                            await SendMess(data2);
                            await SendMess(data1);
                        }

                    } else if (from == 'tv365com') {
                        const FormData = require('form-data');
                        let data = new FormData();
                        data.append('cpn_id', Number(id_cus_from));
                        data.append('emp_id', emp_id_new);

                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://work247.vn/api202/transfer_admin.php',
                            data: data
                        };

                        await axios.request(config);
                    } else if (from == 'tv365_error') { // ntd đăng ký lỗi 

                        console.log("Gửi tin nhắn chuyển giỏ ntd đăng ký lỗi")
                        let user_cu1 = await AdminUser.findOne({
                            emp_id: emp_id_old
                        }).lean();
                        if (user_cu1) {
                            let user_cu = await Users.findOne({ idQLC: user_cu1.emp_id_chat }, { idQLC: 1, _id: 1, userName: 1 }).lean();
                            if (user_cu) {
                                console.log(user_cu1.adm_bophan, user_cu._id, user_cu.idQLC, user_cu.userName, `Khách hàng với ID CRM: ${customer_id} đã được chuyển khỏi giỏ của bạn`);
                                let info_customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
                                let data1 = {
                                    ContactId: user_cu._id,
                                    // ContactId: user_cu.idQLC,
                                    SenderID: 1192,
                                    MessageType: 'text',
                                    Message: `Khách hàng với ID CRM: ${customer_id},
                                        email: ${info_customer.email },
                                        số điện thoại: ${info_customer.phone_number},
                                        đã được chuyển khỏi giỏ của bạn 
                                        `
                                }
                                let data2 = {
                                    ContactId: 10031577,

                                    SenderID: 1192,
                                    MessageType: 'text',
                                    Message: `Khách hàng với ID CRM: ${customer_id},
                                        email: ${info_customer.email },
                                        số điện thoại: ${info_customer.phone_number},
                                        đã được chuyển khỏi giỏ của bạn
                                        `
                                }
                                await SendMess(data1);
                                await SendMess(data2);
                            }
                        }

                        let user_moi1 = await AdminUser.findOne({
                            adm_bophan: adm_bophan
                        }).lean();

                        let user_moi = await Users.findOne({ idQLC: user_moi1.emp_id_chat }, { idQLC: 1, _id: 1, userName: 1 }).lean();
                        if (user_moi) {
                            console.log(adm_bophan, user_moi._id, user_moi.idQLC, user_moi.userName, `Khách hàng với ID CRM: ${customer_id} đã được chuyển tới giỏ của bạn`);
                            let info_customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
                            let data1 = {
                                ContactId: 10031577,
                                SenderID: 1192,
                                MessageType: 'text',
                                Message: `Khách hàng với ID CRM: ${customer_id},
                                             email: ${info_customer.email },
                                             số điện thoại: ${info_customer.phone_number},
                                             đã được chuyển tới giỏ của bạn
                                             `
                            };
                            let data2 = {
                                ContactId: user_moi._id,
                                // ContactId: user_moi.idQLC,
                                SenderID: 1192,
                                MessageType: 'text',
                                Message: `Khách hàng với ID CRM: ${customer_id},
                                    email: ${info_customer.email },
                                    số điện thoại: ${info_customer.phone_number},
                                    đã được chuyển tới giỏ của bạn
                                    `
                            };
                            await SendMess(data2);
                            await SendMess(data1);
                        }
                    } else {
                        // Chuyển giỏ các site khác chưa bật vì bên Thanh Long chưa cập nhật VIP 1 lượt 
                        // let check_customer = customer;
                        // let site_infor = await CRM_site_infor.findOne({
                        //     cus_from: String(check_customer.cus_from)
                        // })
                        // if (site_infor) {
                        //     await axios({
                        //         method: 'post',
                        //         url: site_infor.link_update_cart,
                        //         data: {
                        //             cus_from_id: check_customer.id_cus_from,
                        //             emp_id: check_customer.emp_id,
                        //             userName: check_customer.name,
                        //             phone: check_customer.phone_number,
                        //             email: check_customer.email,
                        //             address: check_customer.address,
                        //         },
                        //         headers: { 'Content-Type': 'multipart/form-data' },
                        //     });
                        // }
                    };


                    // Cuối cùng thì lưu lại lịch sử
                    await new HistoryTransferNotCall({
                        emp_id_old: emp_id_old,
                        emp_id_new: emp_id_new,
                        customer_id: customer_id,
                        stt: adm_bophan,
                        fromWeb: cus_from,
                        reason: last_status_called,
                        last_time_called: last_time_called,
                        time_tranfer: functions.getTimeNow()
                    }).save();
                }
            }
        }
        return true;
    } catch (e) {
        console.log("updateAndSaveHistory", e);
        return false;
    }

}

const updateAndSaveHistoryAlert = async(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from = 'tv365') => {
        try {
            let from = cus_from;
            let customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
            if (customer) {
                let phone = customer.phone_number;
                if ((!phone) || (isNaN(phone))) {
                    phone = customer.email
                };
                // Kiểm tra xem có cuộc gọi phát sinh trong ngày hay không  
                let response = await axios({
                    method: "post",
                    url: "https://voip.timviec365.vn/api/CheckPhoneAnswer",
                    data: {
                        phone_number: phone
                    },
                    headers: { "Content-Type": "multipart/form-data" }
                });
                if (response && response.data) {
                    if (!response.data.data) {

                        // Cập nhật bên NTD gốc trước
                        if (from == 'tv365') {


                            let user_cu1 = await AdminUser.findOne({
                                emp_id: emp_id_old
                            }).lean();
                            if (user_cu1) {
                                let user_cu = await Users.findOne({ idQLC: user_cu1.emp_id_chat }, { idQLC: 1, _id: 1, userName: 1 }).lean();
                                let user_nhan = await Users.findOne({ idQLC: Number(emp_id_new) }).lean();
                                if (user_cu) {

                                    let info_customer = await Customer.findOne({ cus_id: Number(customer_id) }).lean();
                                    let data1 = {
                                        ContactId: user_cu._id,
                                        // ContactId: user_cu.idQLC,
                                        SenderID: 1192,
                                        MessageType: 'text',
                                        Message: `Khách hàng với ID CRM: ${customer_id},
                                    ID: ${info_customer.id_cus_from}
                                    email: ${info_customer.email },
                                    số điện thoại: ${info_customer.phone_number},
                                    sắp được chuyển khỏi giỏ của bạn hãy nhanh chóng kiểm tra CRM
                                    `
                                    }
                                    let data2 = {
                                        ContactId: 10031577,

                                        SenderID: 1192,
                                        MessageType: 'text',
                                        Message: `Khách hàng với ID CRM: ${customer_id},
                                    email: ${info_customer.email },
                                    số điện thoại: ${info_customer.phone_number},
                                    sắp được chuyển 
                                    `
                                    }
                                    await SendMess(data1);
                                    await SendMess(data2);
                                }
                            }


                        }
                    }
                }
                return true;
            }
        } catch (e) {
            console.log("updateAndSaveHistory", e);
            return false;
        }

    }
    // cập nhật lại để kinh doanh gọi tiếp 
const CallAgain = async(time) => {
    try {
        await Customer.updateMany({
            login_next: 1,
            updated_at: { $lte: Number(time) }
        }, {
            $set: {
                login_next: 0,
                group_id: 453,
                updated_at: new Date().getTime() / 1000,
                last_status_called: "NOCALL"
            }
        })

        return true;
    } catch (e) {
        console.log("CallAgain", e);
        return false;
    }
}

const customer_not_call = async() => {
    try {
        //await functions.sleep(5 * 60 * 1000);
        console.log("Bắt đầu", new Date());
        while (true) {
            //await functions.sleep(60000);
            const date_now = functions.convertDate(null, true);

            // test với ngày hôm qua 
            // const date_now = "2023/11/09";
            // console.log("date_now", date_now);

            // Ca sáng
            const start_time_in_morning = functions.convertTimestamp(`${date_now} 08:30`);
            const end_time_in_morning = functions.convertTimestamp(`${date_now} 11:30`);

            // Ca chiều
            const start_time_in_afternoon = functions.convertTimestamp(`${date_now} 14:30`);
            const end_time_in_afternoon = functions.convertTimestamp(`${date_now} 18:00`);

            // Lấy thứ trong tuần -> Nếu là chủ nhật thì ko cho chạy
            const date = new Date();
            const current_day = date.getDay();

            // Thông tin công ty
            const inforHHP = functions.inForHHP();
            const id_dang_thi_hang = inforHHP.id_dang_thi_hang;
            const company_id = inforHHP.company_id;
            const time = 20000; // 2 phút quét 1 lần

            const timeStamp = functions.getTimeNow();
            const time_scan = timeStamp - 3600 * 30;
            // Thời gian 30p trc
            const last_time_called_stone = new Date().getTime() / 1000 - 10 * 60;
            if (((start_time_in_morning < timeStamp && timeStamp < end_time_in_morning) || (start_time_in_afternoon < timeStamp && timeStamp < end_time_in_afternoon)) && current_day != 0) {
                //if (true) {
                // Lấy ra danh sách khách hàng chưa được gọi hoặc có gọi nhưng không nghe máy tính từ thời điểm ngày 04/11/2023

                const search = {
                    emp_id: { $nin: [id_dang_thi_hang, 0] }, // Bỏ qua khách của Hằng vì là khách chuyển đổi số
                    company_id, // Lấy theo ID công ty
                    type: 2, // type = 2 là công ty
                    $and: [{
                            updated_at: { $lte: last_time_called_stone }
                        },
                        {
                            updated_at: { $gte: start_time_in_morning - 8 * 3600 }
                        },
                    ],
                    cus_from: { $nin: ['uv365'] }, // Bỏ quả nguồn ứng viên, nguồn từ admin thêm mới
                    //is_new_customer: { $in: [0, null] }, // Những NTD đăng ký mới mà chưa được gọi, nếu gọi rồi thì giá trị = 1
                    from_admin: 0, // Bỏ qua khách được tạo từ admin, nếu được tạo từ admin thì khách đấy đã được gọi trước đó và add zalo rồi nên không gọi bằng máy bàn nữa
                    // group_id: { $nin: [453, 454, 438] }, // Bỏ qua các NTD đăng nhập, đăng tin, không quan tâm vì đã add zalo rồi nên không gọi nữa
                    last_time_called: { $lte: last_time_called_stone }, // Lấy khách hàng mà không nghe máy hoặc không đã gọi từ 30p trước
                    last_scan_called: { $lte: last_time_called_stone }, // Được quét cách 30p, sau 30p quét lại
                    last_status_called: { $in: ["NOCALL", "NOANSWERED"] }, // Không gọi, không trả lời

                    //cus_id: 2289376
                    // mặc định là không gọi 
                };

                //await CallAgain(functions.convertTimestamp(`${date_now} 00:00`));

                const list = await Customer.find(search, {
                        cus_from: 1,
                        id_cus_from: 1,
                        cus_id: 1,
                        emp_id: 1,
                        last_time_called: 1,
                        last_status_called: 1,
                        group_id: 1,
                        created_at: 1,
                        last_scan_called: 1,
                        fromVip: 1
                    })
                    .sort({ last_time_called: -1 })
                    // .limit(10)
                    .lean();
                console.log("list", list);
                // Lọc bỏ các NTD đang vip
                const filterListCustomer = await filterCustomer(list);
                console.log("filterListCustomer", filterListCustomer)
                    // Lấy danh sách kinh doanh
                let listKD = await AdminUser.find({
                        adm_bophan: { $ne: 0 },
                        adm_ntd: 1
                    })
                    .select("adm_bophan emp_id")
                    .sort({ adm_bophan: 1 })
                    .lean();

                const max_kd = listKD[listKD.length - 1].adm_bophan;
                for (let i = 0; i < filterListCustomer.length; i++) {
                    const customer = filterListCustomer[i];
                    const queryHistoryTransferNotCall = await HistoryTransferNotCall.findOne({}, { emp_id_new: 1, stt: 1 }).sort({ _id: -1 });
                    if (!queryHistoryTransferNotCall) {
                        const emp_id_old = customer.emp_id,
                            customer_id = customer.cus_id,
                            adm_bophan = listKD[0].adm_bophan,
                            last_status_called = customer.last_status_called,
                            last_time_called = customer.last_time_called,
                            id_cus_from = customer.id_cus_from,
                            emp_id_new = listKD[0].emp_id,
                            cus_from = customer.cus_from;
                        await updateAndSaveHistory(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from);
                    } else {
                        // lấy vị trí của usc_kd trong danh sách adm_bophan
                        const position_usc_kd = listKD.findIndex(item => item.adm_bophan === queryHistoryTransferNotCall.stt);

                        // Xử lý logic chia lại khách hàng cho KD
                        let new_val, emp_id;
                        if (queryHistoryTransferNotCall.stt === max_kd) {
                            new_val = listKD[0].adm_bophan;
                            emp_id = listKD[0].emp_id;
                        } else {
                            new_val = listKD[position_usc_kd + 1].adm_bophan;
                            emp_id = listKD[position_usc_kd + 1].emp_id;
                        }
                        const emp_id_old = customer.emp_id,
                            customer_id = Number(customer.cus_id),
                            adm_bophan = new_val,
                            last_status_called = customer.last_status_called,
                            last_time_called = customer.last_time_called,
                            id_cus_from = Number(customer.id_cus_from),
                            emp_id_new = emp_id,
                            cus_from = customer.cus_from;
                        await updateAndSaveHistory(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from);
                    }
                }
                console.log("Xong, chờ 2p");
            } else {
                console.log("Ngoài giờ làm việc, không xử lý");
            }
            await functions.sleep(time);
        }
        return true;
    } catch (error) {
        console.log(error);
        await customer_not_call();
        return false;
    }
};

customer_not_call();


const ToolHandleUserVip = async() => {
    try {
        while (true) {
            let skip = 0;
            let flag = true;
            let limit = 100;
            while (flag) {
                let listUser = await Customer.find({
                    cus_from: "tv365",
                    type: 2,
                    emp_id: { $ne: 0 },
                    $or: [{
                        fromVip: null
                    }, {
                        fromVip: 0
                    }]
                }).sort({ cus_id: -1 }).skip(skip).limit(limit).lean();
                if (listUser.length) {
                    skip = skip + 100;
                    for (let i = 0; i < listUser.length; i++) {
                        let customer = listUser[i];
                        let flagvip = false;
                        let checkNew = await News.find({
                            new_user_id: Number(customer.id_cus_from),
                            $or: [{
                                    new_hot: 1
                                },
                                {
                                    new_gap: 1
                                },
                                {
                                    new_cao: 1
                                },
                                {
                                    new_ghim: 1
                                }
                            ]
                        });
                        if (checkNew.length) {
                            flagvip = true;
                        };

                        const is_buy = await PointCompany.findOne({ usc_id: Number(customer.id_cus_from) });
                        if (!is_buy || (is_buy && is_buy.point_usc == 0 && (is_buy.ngay_reset_diem_ve_0 == 0))) {
                            flagvip = false;
                        } else {
                            flagvip = true
                        };

                        if (flagvip) {

                            await Customer.updateOne({
                                cus_id: customer.cus_id
                            }, {
                                $set: {
                                    fromVip: Number(customer.emp_id)
                                }
                            });
                        }
                    }
                } else {
                    flag = false;
                }
            };
            await functions.sleep(60000);
        }
    } catch (e) {
        console.log("ToolHandleUserVip", e);
        await ToolHandleUserVip();
        return false;
    }
}

ToolHandleUserVip()


const customer_not_call_alert = async() => {
    try {
        //await functions.sleep(5 * 60 * 1000);
        console.log("Bắt đầu", new Date());
        while (true) {
            //await functions.sleep(60000);
            const date_now = functions.convertDate(null, true);

            // test với ngày hôm qua 
            // const date_now = "2023/11/09";
            // console.log("date_now", date_now);

            // Ca sáng
            const start_time_in_morning = functions.convertTimestamp(`${date_now} 08:30`);
            const end_time_in_morning = functions.convertTimestamp(`${date_now} 11:30`);

            // Ca chiều
            const start_time_in_afternoon = functions.convertTimestamp(`${date_now} 14:30`);
            const end_time_in_afternoon = functions.convertTimestamp(`${date_now} 18:00`);

            // Lấy thứ trong tuần -> Nếu là chủ nhật thì ko cho chạy
            const date = new Date();
            const current_day = date.getDay();

            // Thông tin công ty
            const inforHHP = functions.inForHHP();
            const id_dang_thi_hang = inforHHP.id_dang_thi_hang;
            const company_id = inforHHP.company_id;
            const time = 20000; // 2 phút quét 1 lần

            const timeStamp = functions.getTimeNow();
            const time_scan = timeStamp - 3600 * 30;
            // Thời gian 30p trc
            const last_time_called_stone = new Date().getTime() / 1000 - 5 * 60;
            if (((start_time_in_morning < timeStamp && timeStamp < end_time_in_morning) || (start_time_in_afternoon < timeStamp && timeStamp < end_time_in_afternoon)) && current_day != 0) {
                //if (true) {
                // Lấy ra danh sách khách hàng chưa được gọi hoặc có gọi nhưng không nghe máy tính từ thời điểm ngày 04/11/2023

                const search = {
                    emp_id: { $nin: [id_dang_thi_hang, 0] }, // Bỏ qua khách của Hằng vì là khách chuyển đổi số
                    company_id, // Lấy theo ID công ty
                    type: 2, // type = 2 là công ty
                    $and: [{
                            updated_at: { $lte: last_time_called_stone }
                        },
                        {
                            updated_at: { $gte: start_time_in_morning - 8 * 3600 }
                        },
                    ],
                    cus_from: { $nin: ['uv365'] }, // Bỏ quả nguồn ứng viên, nguồn từ admin thêm mới
                    //is_new_customer: { $in: [0, null] }, // Những NTD đăng ký mới mà chưa được gọi, nếu gọi rồi thì giá trị = 1
                    from_admin: 0, // Bỏ qua khách được tạo từ admin, nếu được tạo từ admin thì khách đấy đã được gọi trước đó và add zalo rồi nên không gọi bằng máy bàn nữa
                    // group_id: { $nin: [453, 454, 438] }, // Bỏ qua các NTD đăng nhập, đăng tin, không quan tâm vì đã add zalo rồi nên không gọi nữa
                    last_time_called: { $lte: last_time_called_stone }, // Lấy khách hàng mà không nghe máy hoặc không đã gọi từ 30p trước
                    last_scan_called: { $lte: last_time_called_stone }, // Được quét cách 30p, sau 30p quét lại
                    last_status_called: { $in: ["NOCALL", "NOANSWERED"] }, // Không gọi, không trả lời

                    //cus_id: 2289376
                    // mặc định là không gọi 
                };

                //await CallAgain(functions.convertTimestamp(`${date_now} 00:00`));

                const list = await Customer.find(search, {
                        cus_from: 1,
                        id_cus_from: 1,
                        cus_id: 1,
                        emp_id: 1,
                        last_time_called: 1,
                        last_status_called: 1,
                        group_id: 1,
                        created_at: 1,
                        last_scan_called: 1
                    })
                    .sort({ last_time_called: -1 })
                    // .limit(10)
                    .lean();
                console.log("list", list);
                // Lọc bỏ các NTD đang vip
                const filterListCustomer = await filterCustomer(list);
                console.log("filterListCustomer", filterListCustomer)
                    // Lấy danh sách kinh doanh
                let listKD = await AdminUser.find({
                        adm_bophan: { $ne: 0 },
                        adm_ntd: 1
                    })
                    .select("adm_bophan emp_id")
                    .sort({ adm_bophan: 1 })
                    .lean();

                const max_kd = listKD[listKD.length - 1].adm_bophan;
                for (let i = 0; i < filterListCustomer.length; i++) {
                    const customer = filterListCustomer[i];
                    const queryHistoryTransferNotCall = await HistoryTransferNotCall.findOne({}, { emp_id_new: 1, stt: 1 }).sort({ _id: -1 });
                    if (!queryHistoryTransferNotCall) {
                        const emp_id_old = customer.emp_id,
                            customer_id = customer.cus_id,
                            adm_bophan = listKD[0].adm_bophan,
                            last_status_called = customer.last_status_called,
                            last_time_called = customer.last_time_called,
                            id_cus_from = customer.id_cus_from,
                            emp_id_new = listKD[0].emp_id,
                            cus_from = customer.cus_from;
                        await updateAndSaveHistoryAlert(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from);
                    } else {
                        // lấy vị trí của usc_kd trong danh sách adm_bophan
                        const position_usc_kd = listKD.findIndex(item => item.adm_bophan === queryHistoryTransferNotCall.stt);

                        // Xử lý logic chia lại khách hàng cho KD
                        let new_val, emp_id;
                        if (queryHistoryTransferNotCall.stt === max_kd) {
                            new_val = listKD[0].adm_bophan;
                            emp_id = listKD[0].emp_id;
                        } else {
                            new_val = listKD[position_usc_kd + 1].adm_bophan;
                            emp_id = listKD[position_usc_kd + 1].emp_id;
                        }
                        const emp_id_old = customer.emp_id,
                            customer_id = Number(customer.cus_id),
                            adm_bophan = new_val,
                            last_status_called = customer.last_status_called,
                            last_time_called = customer.last_time_called,
                            id_cus_from = Number(customer.id_cus_from),
                            emp_id_new = emp_id,
                            cus_from = customer.cus_from;
                        await updateAndSaveHistoryAlert(emp_id_old, customer_id, adm_bophan, last_status_called, last_time_called, id_cus_from, emp_id_new, cus_from);
                    }
                }
                console.log("Xong, chờ 2p");
            } else {
                console.log("Ngoài giờ làm việc, không xử lý");
            }
            await functions.sleep(time);
        }
        return true;
    } catch (error) {
        console.log(error);
        await customer_not_call();
        return false;
    }
};

// customer_not_call_alert();