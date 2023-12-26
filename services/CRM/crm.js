const functions = require('../functions');
const Customer = require("../../models/crm/Customer/customer");
const Users = require('../../models/Users');
const CRM_customer_group = require('../../models/crm/Customer/customer_group');
const ManageNghiPhep = require("../../models/ManageNghiPhep");
const axios = require('axios');

// true là có nghỉ phép 
// false là không có nghỉ phép 
const checkNghiPhepInternal = async(idChuyenVien, com_id) => {
    try {
        console.log("Kiểm tra tạo tài khoản", "checkNghiPhepInternal", idChuyenVien, com_id)
        let response = await axios({
            method: 'post',
            url: 'https://api.timviec365.vn/api/qlc/shift/list_shift_user_new',
            data: {
                u_id: idChuyenVien,
                c_id: Number(com_id)
            },
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response && response.data && response.data.data && response.data.data.shift && response.data.data.shift.length) {
            return false;
        } else {
            return true;
        }

        // if (dataNghi.length > 0) {
        //     return true;
        // } else {
        //     return false;
        // }

    } catch (e) {
        console.log(e);
        return true;
    }
}
exports.addCustomer = async(name, email, phone, emp_id, id_cus_from, resoure, status, group, type, link_multi, from, from_admin, comID, cit_id, district_id, address) => {
    try {
        let from_admin_tempt = 0;
        if (from_admin) {
            from_admin_tempt = 1;
        }
        const MaxId = await Customer.findOne({}, { cus_id: 1 }).sort({ cus_id: -1 });
        const cus_id = Number(MaxId.cus_id) + 1;

        let data = {
            cus_id,
            name,
            email,
            phone_number: phone,
            emp_id,
            resoure,
            status,
            group_id: group,
            type,
            created_at: functions.getTimeNow(),
            updated_at: functions.getTimeNow(),
            company_id: comID,
            id_cus_from,
            link: link_multi,
            cus_from: from,
            cit_id,
            district_id,
            address
        };

        if (from_admin) {
            data.from_admin = 1;
        }

        const customer = new Customer(data);
        await customer.save();
        return customer;
    } catch (error) {
        console.log(error)
        return false;
    }
}


exports.takeDataChuyenVien = async(gr_id, com_id) => {
    try {
        let listIdChuyenVien = [];
        let listDep = [];
        let group_father = await CRM_customer_group.findOne({ gr_id: gr_id }).lean();
        listIdChuyenVien = group_father.emp_id.split(",").map(Number).filter((e) => e != 0);
        listDep = group_father.dep_id.split(",").map(Number).filter((e) => e != 0);
        let list_group_child = await CRM_customer_group.find({
            group_parent: Number(group_father.gr_id)
        }).lean();
        if (list_group_child.length) {
            for (let i = 0; i < list_group_child.length; i++) {
                let group = list_group_child[i];
                let listIdChuyenVien_e = group.emp_id.split(",").map(Number).filter((e) => e != 0);
                let listDep_e = group.dep_id.split(",").map(Number).filter((e) => e != 0);
                for (let j = 0; j < listIdChuyenVien_e.length; j++) {
                    listIdChuyenVien.push(listIdChuyenVien_e[j]);
                };
                for (let j = 0; j < listDep_e.length; j++) {
                    listDep.push(listDep_e[j]);
                }
            }
        }
        listIdChuyenVien = listIdChuyenVien.filter((e) => e != 0);
        listDep = listDep.filter((e) => e != 0)
        let listUser = await Users.aggregate([{
            $match: {
                idQLC: { $gt: 0 },
                "inForPerson.employee.com_id": Number(group_father.company_id),
                $or: [{ idQLC: { $in: listIdChuyenVien } }, { "inForPerson.employee.organizeDetailId": { $in: listDep } }]
            }
        }]);

        let listTempt = [];
        for (let i = 0; i < listIdChuyenVien.length; i++) {
            let obj = listUser.find((e) => e.idQLC == listIdChuyenVien[i]);
            if (obj) {
                listTempt.push(obj)
            }
        };
        listUser = listTempt;
        let stt = 0;
        if (group_father.orderexpert) {
            stt = Number(group_father.orderexpert)
        };
        console.log("Số thứ tự ban đầu", stt)
        let chuyenvien = listUser[stt];
        // kiểm tra nghỉ phép => Lấy ra người không nghỉ phép 
        let flag = true;
        if (!listUser[stt]) {
            stt = stt + 1;
        };
        if (stt > (listUser.length - 1)) {

            stt = 0;
        };
        let stone = stt;

        // if (stt == 0) {
        //     stone = listUser.length - 1
        // };

        // kiểm tra nghỉ phép
        // máy chủ lấy số theo giờ GMT + 7
        // không chuyển id ngày chủ nhật 
        let day = new Date().getDay();

        if (day != 0) {
            // kiểm tra các nhân viên trong nhóm xem có đi làm không 
            while (flag && (stt != stone)) {
                // lưu ý đin 1 vòng rồi thôi
                if (!listUser[stt]) {
                    stt = stt + 1;
                };
                let check = await checkNghiPhepInternal(listUser[stt].idQLC, com_id); // nếu không có lịch làm việc thì chia đều 
                if (check) {
                    stt = stt + 1;
                    if (stt > (listUser.length - 1)) {
                        stt = 0;
                    };

                } else {
                    console.log("Chuyen vien di lam", stt)
                    flag = false;
                }
            };
        };

        // cập nhật chuyên viên 
        chuyenvien = listUser[stt];


        // cập nhât số thứ tự mới để chia giỏ 
        let new_stt = stt + 1;
        if (new_stt > (listUser.length - 1)) {
            new_stt = 0;
        };

        if (new_stt == stone) {
            new_stt = new_stt + 1;
            if (new_stt > (listUser.length - 1)) {
                new_stt = 0;
            }
        }
        console.log("stt moi", new_stt, listUser.length)
        await CRM_customer_group.updateMany({
            gr_id: gr_id
        }, {
            $set: {
                orderexpert: new_stt
            }
        });
        return chuyenvien;
    } catch (error) {
        console.log(error)
        return false;
    }
}