const functions = require('../functions');
const Customer = require("../../models/crm/Customer/customer");
const Users = require('../../models/Users');
const CRM_customer_group = require('../../models/crm/Customer/customer_group');
const ManageNghiPhep = require("../../models/ManageNghiPhep");


// true là có nghỉ phép 
// false là không có nghỉ phép 
const checkNghiPhepInternal = async(idChuyenVien) => {
    try {
        let time = new Date().getTime();
        let dataNghi = await ManageNghiPhep.find({
            idFrom: Number(idChuyenVien),
            $and: [{
                from: {
                    $lte: time
                }
            }, {
                end: {
                    $gte: time
                }
            }]
        });
        if (dataNghi.length > 0) {
            return true;
        } else {
            return false;
        }

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


exports.takeDataChuyenVien = async(gr_id) => {
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

        let stt = 0;
        if (group_father.orderexpert) {
            stt = Number(group_father.orderexpert)
        }
        let chuyenvien = listUser[stt];

        // kiểm tra nghỉ phép => Lấy ra người không nghỉ phép 
        let flag = true;
        while (flag) {
            if (stt > (listUser.length - 1)) {
                stt = 0;
            };
            if (!listUser[stt]) {
                stt = 0;
            };
            console.log(group_father.company_id, listDep, listIdChuyenVien, gr_id)
            let check = await checkNghiPhepInternal(listUser[stt].idQLC);
            if (check) {
                stt = stt + 1;
                if (stt > (listUser.length - 1)) {
                    stt = 0;
                };
                chuyenvien = listUser[stt];
            } else {
                flag = false;
            }
        }
        // cập nhât số thứ tự mới để chia giỏ 
        let new_stt = stt + 1;
        if (new_stt > (listUser.length - 1)) {
            new_stt = 0;
        };

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