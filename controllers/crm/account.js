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

exports.transformDataCrmCart = async(req, res) => {
    try {
        let from = String(req.body.from);
        let id_cus_from = String(req.body.id_cus_from);
        let new_emp_id = Number(req.body.emp_id);


        if (customer) {
            await Customer.updateOne({ cus_id: Number(customer.cus_id) }, {
                $set: {
                    fromVip: customer.emp_id
                }
            })
        }
        return functions.success(res, "Cập nhật VIP CRM thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.ShowDulieuKhachHangKinhDoanh = async(req, res) => {
    try {
        // lấy danh sách kinh doanh. 
        let start = Number(req.body.start);
        let end = Number(req.body.end);
        let response = await axios({
            method: 'post',
            url: 'http://210.245.108.202:3007/api/crm/account/TakeListUserFromGroupNoToken',
            data: {
                IdGroup: 429,
                companyId: 10013446
            },
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response && response.data && response.data.data && response.data.data.listUser) {
            // đếm số lượng khách hàng của 
            let listUser = response.data.data.listUser;
            let listData = [];
            for (let i = 0; i < listUser.length; i++) {
                let user = listUser[i];
                let listFrom = await Customer.aggregate([{
                        $match: {
                            emp_id: user.idQLC,
                            $and: [
                                { created_at: { $gt: start } },
                                { created_at: { $lt: end } }
                            ]
                        }
                    },
                    { $group: { _id: "$cus_from" } }
                ]);
                let listCount = [];
                for (let j = 0; j < listFrom.length; j++) {
                    let count = await Customer.countDocuments({
                        emp_id: user.idQLC,
                        $and: [
                            { created_at: { $gt: start } },
                            { created_at: { $lt: end } }
                        ],
                        cus_from: listFrom[j]
                    });
                    listCount.push(count)
                }
                listData.push({
                    idQLC: user.idQLC,
                    userName: user.userName,
                    listFrom: listFrom,
                    listCount
                })
            }
            return res.json({
                data: {
                    listData
                }
            })

        } else {
            return functions.setError(res, "Không lấy được danh sách kinh doanh");
        }

    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.takeListCustomer = async(req, res) => {
    try {
        let start = Number(req.body.start);
        let end = Number(req.body.end);
        let from = String(req.body.from);
        let idQLC = Number(req.body.idQLC);
        let user = await Users.findOne({ idQLC: idQLC, type: 2 }).lean();
        let flag = false;
        if ((req.user.data.idQLC == idQLC) || (req.user.data.idQLC == user.inForPerson.employee.com_id)) {
            flag = true
        };
        if (flag) {
            if (user) {
                let listCus = await Customer.find({
                    emp_id: idQLC,
                    cus_from: from,
                    $and: [
                        { created_at: { $gt: start } },
                        { created_at: { $lt: end } }
                    ]
                });
                return res.json({
                    data: {
                        listCus
                    }
                })
            } else {
                return functions.setError(res, "Lỗi không tồn tại user");
            }
        } else {
            return functions.setError(res, "Không được phân quyến");
        }

    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.takeDuLieuChuyenGio = async(req, res) => {
    try {
        let group = await CRM_customer_group.findOne({ gr_id: 456 }).lean();
        let listEmp = group.emp_id.split(",").map(Number).filter((e) => e != 0);
        let listKD = await Users.find({ idQLC: { $in: listEmp }, type: 2 }).lean();
        let listName = [];
        for (let i = 0; i < listEmp.length; i++) {
            let obj = listKD.find((e) => e.idQLC == listEmp[i]);
            listName.push(obj.userName);
        }
        let idChon = listEmp[group.orderexpert];
        let kd_check = listKD.find((e) => e.idQLC == idChon)
        return res.json({
            "listKD": listName,
            "KdNext": listName[group.orderexpert],
            "KdNextCheck": kd_check.userName
        })
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.updateVip = async(req, res) => {
    try {
        let customer = await Customer.findOne({
            id_cus_from: String(req.body.id_cus_from),
            cus_from: String(req.body.cus_from),
            type: Number(req.body.type)
        }).lean();

        if (customer) {
            await Customer.updateOne({ cus_id: Number(customer.cus_id) }, {
                $set: {
                    fromVip: customer.emp_id
                }
            })
        }
        return functions.success(res, "Cập nhật VIP CRM thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.addUserToCrm = async(req, res) => {
    try {
        console.log("addUserToCrm", req.body);
        // tất cả các trường hợp test đều có cus_from là site_test 
        // 448: NTD không nghe máy 
        // 168 : Khách hàng xem nhưng không mua 
        const gr_id = Number(req.body.gr_id);
        const com_id = Number(req.body.com_id);
        const cus_from = String(req.body.cus_from);
        const link_multi = String(req.body.link_multi);
        const type = Number(req.body.type);
        const status = Number(req.body.status);
        const resoure = Number(req.body.resoure);
        const id_cus_from = String(req.body.id_cus_from);
        const phone = String(req.body.phone);
        const email = String(req.body.email);
        const name = String(req.body.name);
        const cit_id = req.body.cit_id ? Number(req.body.cit_id) : null;
        const district_id = req.body.district_id ? Number(req.body.district_id) : null;
        const address = req.body.address ? String(req.body.address) : null;
        const from_admin = req.body.from_admin ? Number(req.body.from_admin) : 0;
        let chuyenvien;
        if (!req.body.emp_id) {
            chuyenvien = await serviceCrm.takeDataChuyenVien(gr_id, com_id);
        }
        let idChuyenVien = req.body.emp_id ? Number(req.body.emp_id) : chuyenvien.idQLC;
        let account = await serviceCrm.addCustomer(name, email, phone, idChuyenVien, id_cus_from, resoure, status, gr_id, type, link_multi, cus_from, from_admin, com_id, cit_id, district_id, address);

        return functions.success(res, "Thêm nhân viên thành công", { chuyenvien, account });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.getListEmployee = async(req, res) => {
    try {
        const user = req.user.data;
        const com_id = user.com_id;
        let condition = {
            "inForPerson.employee.com_id": com_id
        };
        let idQLC = user.idQLC;
        if (user.type == 2) {
            let candidate = await User.findOne({ idQLC: user.idQLC, type: user.type }).select("type inForPerson.employee");

            const position = await Position.findOne({ id: candidate.inForPerson.employee.position_id, comId: com_id }).select("isManager");
            if (position.isManager == 2) {
                const listOrganizeDetailId = candidate.inForPerson.employee.listOrganizeDetailId;
                const getListEmployeeInDep = await User.find({
                    "inForPerson.employee.com_id": com_id,
                    "inForPerson.employee.listOrganizeDetailId": { $all: listOrganizeDetailId }
                }).select("idQLC");

                let ListIdInDepartment = getListEmployeeInDep.map(item => item.idQLC);
                condition = { "idQLC": { $in: ListIdInDepartment }, ...condition };
            } else if (position.isManager == 0) {
                condition = { "idQLC": idQLC, ...condition };
            }
        }

        const list = await User.aggregate([{
                $match: condition
            },
            {
                $lookup: {
                    from: "QLC_OrganizeDetail",
                    localField: "inForPerson.employee.organizeDetailId",
                    foreignField: "id",
                    as: "organizeDetail",
                }
            },
            {
                $project: {
                    ep_id: "$idQLC",
                    ep_name: "$userName",
                    dep_name: "$organizeDetail.organizeDetailName"
                }
            }
        ]);
        list.map(item => { item.dep_name = item.dep_name.toString() });

        return functions.success(res, "Danh sách nhân viên", { items: list });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

// Lấy danh sách nhân viên có 1 nhóm khách hàng 
exports.TakeListUserFromGroup = async(req, res) => {
    try {
        let company_Id = Number(req.body.companyId)
        let flag_com = false;
        if (company_Id == Number(req.user.data.idQLC)) {
            flag_com = true;
        }

        let IdGroup = Number(req.body.IdGroup);
        let data = {};
        let Group = await CRM_customer_group.findOne({
            gr_id: IdGroup
        }).lean();
        if (Group) {
            let listEmId = Group.emp_id.split(",");
            let listTempt = [];
            for (let i = 0; i < listEmId.length; i++) {
                if (listEmId[i]) {
                    if (!isNaN(Number(listEmId[i]))) {
                        listTempt.push(Number(listEmId[i]));
                    }
                }
            };
            listEmId = listTempt;

            if (Group.group_parent == 0) {
                let listChild = await CRM_customer_group.find({
                    group_parent: IdGroup
                }, {
                    emp_id: 1
                }).lean();
                for (let i = 0; i < listChild.length; i++) {
                    let listEmId_child = listChild[i].emp_id.split(",");
                    for (let j = 0; j < listEmId_child.length; j++) {
                        if (listEmId_child[i]) {
                            listEmId.push(Number(listEmId_child[j]));
                        }
                    };
                };
            };
            listEmId = [...new Set(listEmId)];
            listEmId = listEmId.filter((e) => e > 1000000);
            let history = await history_update_cart.find({ emp_id: { $in: listEmId } }).sort({ created_at: -1 }).lean();
            console.log("history", history);
            let listUser = await Users.aggregate([{
                    $match: {
                        idQLC: { $in: listEmId },
                        type: 2
                    }
                },
                {
                    $lookup: {
                        from: 'QLC_OrganizeDetail',
                        localField: 'inForPerson.employee.organizeDetailId',
                        foreignField: 'id',
                        as: 'organizeDetail',
                    },
                },
                {
                    $unwind: {
                        path: '$organizeDetail',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'QLC_Positions',
                        localField: 'inForPerson.employee.position_id',
                        foreignField: 'id',
                        pipeline: [{
                            $match: {
                                comId: company_Id
                            }
                        }],
                        as: 'positions',
                    },
                },
                {
                    $unwind: {
                        path: '$positions',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        idQLC: 1,
                        userName: 1,
                        position: "$positions.positionName",
                        organization: "$organizeDetail.organizeDetailName",
                        phoneTK: 1,
                        email: 1
                    }
                }
            ]);
            const key = 'idQLC';
            listUser = [...new Map(listUser.map((item) => [item[key], item])).values()];
            if (!flag_com) {
                listUser = listUser.filter((e) => e.idQLC == Number(req.user.data.idQLC))
            };
            let listTempt2 = [];
            for (let i = 0; i < listUser.length; i++) {
                let obj = listUser[i];
                let check = history.find((e) => e.emp_id == obj.idQLC);
                if (check) {
                    listTempt2.push({...obj, date_add: check.created_at })
                } else {
                    listTempt2.push(obj);
                }
            }
            data.listUser = listTempt2;
        }
        return functions.success(res, "Danh sách nhân viên trong giỏ", data);
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

// lấy danh sách nhân viên mà không cần token 
exports.TakeListUserFromGroupNoToken = async(req, res) => {
        try {
            let company_Id = Number(req.body.companyId)
            let flag_com = false;


            let IdGroup = Number(req.body.IdGroup);
            let data = {};
            let Group = await CRM_customer_group.findOne({
                gr_id: IdGroup
            }).lean();
            if (Group) {
                let listEmId = Group.emp_id.split(",");
                let listTempt = [];
                for (let i = 0; i < listEmId.length; i++) {
                    if (listEmId[i]) {
                        if (!isNaN(Number(listEmId[i]))) {
                            listTempt.push(Number(listEmId[i]));
                        }
                    }
                };
                listEmId = listTempt;

                if (Group.group_parent == 0) {
                    let listChild = await CRM_customer_group.find({
                        group_parent: IdGroup
                    }, {
                        emp_id: 1
                    }).lean();
                    for (let i = 0; i < listChild.length; i++) {
                        let listEmId_child = listChild[i].emp_id.split(",");
                        for (let j = 0; j < listEmId_child.length; j++) {
                            if (listEmId_child[i]) {
                                listEmId.push(Number(listEmId_child[j]));
                            }
                        };
                    };
                };
                listEmId = [...new Set(listEmId)];
                listEmId = listEmId.filter((e) => e > 1000000);
                let history = await history_update_cart.find({ emp_id: { $in: listEmId } }).sort({ created_at: -1 }).lean();

                let listUser = await Users.aggregate([{
                        $match: {
                            idQLC: { $in: listEmId },
                            type: 2
                        }
                    },
                    {
                        $lookup: {
                            from: 'QLC_OrganizeDetail',
                            localField: 'inForPerson.employee.organizeDetailId',
                            foreignField: 'id',
                            as: 'organizeDetail',
                        },
                    },
                    {
                        $unwind: {
                            path: '$organizeDetail',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'QLC_Positions',
                            localField: 'inForPerson.employee.position_id',
                            foreignField: 'id',
                            pipeline: [{
                                $match: {
                                    comId: company_Id
                                }
                            }],
                            as: 'positions',
                        },
                    },
                    {
                        $unwind: {
                            path: '$positions',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            idQLC: 1,
                            userName: 1,
                            position: "$positions.positionName",
                            organization: "$organizeDetail.organizeDetailName",
                            phoneTK: 1,
                            email: 1
                        }
                    }
                ]);
                const key = 'idQLC';
                listUser = [...new Map(listUser.map((item) => [item[key], item])).values()];
                let listTempt2 = [];
                for (let i = 0; i < listUser.length; i++) {
                    let obj = listUser[i];
                    let check = history.find((e) => e.emp_id == obj.idQLC);
                    if (check) {
                        listTempt2.push({...obj, date_add: check.created_at })
                    } else {
                        listTempt2.push(obj);
                    }
                }
                data.listUser = listTempt2;
            }
            return functions.success(res, "Danh sách nhân viên trong giỏ", data);
        } catch (error) {
            console.log(error);
            return functions.setError(res, error.message);
        }
    }
    // Lấy danh sách nhóm của 1 người 
exports.TakeListGroupOfUser = async(req, res) => {
    try {
        let IdCRM = Number(req.body.IdCRM)
        let data = {};
        let inforUser = await Users.findOne({ idQLC: IdCRM }).lean();
        // let dep_id = inforUser.inForPerson.employee.organizeDetailId;
        let ListGroup = await CRM_customer_group.find({
            $or: [{
                    emp_id: new RegExp(IdCRM, 'i')
                }
                // {
                //     dep_id: new RegExp(dep_id, 'i')
                // }
            ]
        }, ).lean();
        data.ListGroup = ListGroup;
        return functions.success(res, "Lấy danh sách nhóm thành công", data);
    } catch (error) {
        console.log(error);
        return functions.success(res, "Lấy danh sách nhóm thành công", { ListGroup: [] });
        return functions.setError(res, error.message);
    }
}


// Lấy danh sách nhóm cha của công ty 
exports.TakeListGroup = async(req, res) => {
    try {
        let company_id = Number(req.body.company_id)
        let data = {};
        let Group = await CRM_customer_group.find({
            company_id: company_id
                // group_parent: 0
        }, ).lean();
        data.Group = Group;
        return functions.success(res, "Lấy danh sách nhóm thành công", data);
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// xóa giỏ hàng của 1 chuyên viên 
exports.deleteCart = async(req, res) => {
    try {
        let idCRM = Number(req.body.idCRM);
        // chuyển đều khách hàng của nhà đó sang giỏ khác 
        // Lấy danh sách id kinh doanh
        let listKD = await AdminUser.find({
                adm_bophan: { $ne: 0 },
                adm_ntd: 1
            })
            .select("adm_bophan emp_id")
            .sort({ adm_bophan: 1 })
            .lean();
        let length_List_kd = listKD.length;
        let stt = 0;
        let flag = true;
        let skip = 0;

        // trên CRM + admin 
        while (flag) {
            let listCus = await Customer.find({
                emp_id: idCRM
            }).sort({ cus_id: 1 }).skip(skip).limit(200);
            if (listCus.length) {
                skip = skip + 200
                    // lấy ra tập họp tài khoản admin có thể nhân 
                for (let i = 0; i < listCus.length; i++) {
                    // check từng khách hàng => lấy thông tin từng nhóm => random số thứ tự và loại người đấy ra
                    // group_id
                    let customer = listCus[i];
                    let group = await CRM_customer_group.findOne({ gr_id: Number(customer.group_id) });
                    if (group) {
                        console.log(group);
                        let listChuyenVienId = group.emp_id.split(",").map(Number);
                        listChuyenVienId = listChuyenVienId.filter((e) => (e > 1000000) && (e != idCRM));
                        if (listChuyenVienId.length) {
                            let stt_chuyenvien = getRndInteger(0, listChuyenVienId.length - 1)
                            let id_chuyenvien = listChuyenVienId[stt_chuyenvien];

                            // Chuyển dưới CRM 
                            if (!customer.fromVip) {
                                await Customer.updateOne({
                                    cus_id: Number(customer.cus_id)
                                }, {
                                    $set: {
                                        emp_id: id_chuyenvien
                                    }
                                })
                            } else {
                                await Customer.updateOne({
                                    cus_id: Number(customer.cus_id)
                                }, {
                                    $set: {
                                        emp_id: id_chuyenvien,
                                        fromVip: id_chuyenvien
                                    }
                                })
                            };

                            // chuyển trên admin 
                            // chuyển trong tìm việc
                            if ((listCus[i].cus_from == "tv365") && (listCus[i].type == 2)) {

                                let admin = await AdminUser.findOne({ emp_id: id_chuyenvien }).lean(lean);
                                await Users.updateMany({
                                    idTimViec365: Number(listCus[i].id_cus_from)
                                }, {
                                    $set: {
                                        "inForCompany.usc_kd": admin.adm_bophan
                                    }
                                });
                                functions.tranferGioElastic(Number(listCus[i].id_cus_from));
                            } else {
                                // chuyển ngoai site vệ tinh 
                                const check_customer = listCus[i];
                                let site_infor = await CRM_site_infor.findOne({
                                    cus_from: String(check_customer.cus_from)
                                })
                                if (site_infor) {
                                    await axios({
                                        method: 'post',
                                        url: site_infor.link_update_cart,
                                        data: {
                                            cus_from_id: check_customer.id_cus_from,
                                            emp_id: check_customer.emp_id,
                                            userName: check_customer.name,
                                            phone: check_customer.phone_number,
                                            email: check_customer.email,
                                            address: check_customer.address,
                                        },
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    });
                                }
                            };



                        } else {
                            console.log("không có người cùng nhóm thì không chuyển")
                        }
                    }
                }
            } else {
                flag = false;
            }
        }
        return functions.success(res, "Xóa giỏ thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

// chuyển giỏ hàng giữa hai chuyên viên 
exports.tranformCart = async(req, res) => {
    try {
        let IdCrmFrom = Number(req.body.IdCrmFrom);
        let listIdCrmTo = String(req.body.IdCrmTo).split(",");
        let list_tempt = [];
        for (let i = 0; i < listIdCrmTo.length; i++) {
            list_tempt.push(Number(listIdCrmTo[i]))
        };
        listIdCrmTo = list_tempt;

        let adminFrom = await AdminUser.findOne({
            emp_id: IdCrmFrom
        }).lean();

        let listadminTo = await AdminUser.find({
            emp_id: { $in: listIdCrmTo }
        }).lean();

        let flag = true;
        let skip = 0;
        let count = 0;
        while (flag) {
            let listCustomer = await Customer.find({ em_id: { $in: listIdCrmTo } }).sort({ cus_id: 1 }).skip(skip).limit(100).lean();
            if (listCustomer.length) {
                skip = skip + 100;
                for (let i = 0; i < listCustomer.length; i++) {

                    // chuyển trong tìm việc
                    if ((listCustomer[i].cus_from == "tv365") && (listCustomer[i].type == 2)) {
                        functions.tranferGioElastic(Number(listCustomer[i].id_cus_from));
                        await Users.updateMany({
                            "idTimViec365": Number(listCustomer[i].id_cus_from)
                        }, {
                            $set: {
                                "inForCompany.usc_kd": listadminTo[count].adm_bophan
                            }
                        });
                    } else {
                        // chuyển ngoai site vệ tinh 
                        const check_customer = listCustomer[i];
                        let site_infor = await CRM_site_infor.findOne({
                            cus_from: String(check_customer.cus_from)
                        })
                        if (site_infor) {
                            await axios({
                                method: 'post',
                                url: site_infor.link_update_cart,
                                data: {
                                    cus_from_id: check_customer.id_cus_from,
                                    emp_id: check_customer.emp_id,
                                    userName: check_customer.name,
                                    phone: check_customer.phone_number,
                                    email: check_customer.email,
                                    address: check_customer.address,
                                },
                                headers: { 'Content-Type': 'multipart/form-data' },
                            });
                        }
                    };

                    await Customer.updateMany({
                        cus_id: listCustomer[i].cus_id
                    }, {
                        $set: {
                            emp_id: listadminTo[count].emp_id
                        }
                    })
                    count = count + 1;
                    if (count = listadminTo.length - 1) {
                        count = 0
                    }
                }
            } else {
                flag = false
            }
        }


        return functions.success(res, "chuyển giỏ hàng giữa hai chuyên viên thành công");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

// Thêm nhân viên vào giỏ hàng 
exports.AddUserToCart = async(req, res) => {
    try {
        let listIdCrm = String(req.body.IdCrm).split(",").map(Number);
        let listDepCrm = req.body.depId ? req.body.depId.split(",").map(Number) : [];

        // console.log("AddUserToCart", req.body);
        let IdCart = Number(req.body.IdCart)

        let inforCart = await CRM_customer_group.findOne({
            gr_id: IdCart
        }).lean();
        // let userInfo = await Users.findOne({ idQLC: IdCrm }).lean();
        if (inforCart) {
            let str = inforCart.emp_id;
            if (listIdCrm.length) {
                for (let i = 0; i < listIdCrm.length; i++) {
                    let IdCrmAdd = listIdCrm[i];
                    if (str.length) {
                        str = `${str},${IdCrmAdd}`
                    } else {
                        str = String(IdCrmAdd)
                    };

                    // lưu lại lịch sử thêm vào giỏ 
                    let newobj = new history_update_cart({
                        cart_id: IdCart,
                        emp_id: IdCrmAdd,
                        type: "Add",
                    });
                    await newobj.save();
                }
            };

            let str_dep = inforCart.dep_id;
            if (listDepCrm.length) {
                for (let i = 0; i < listDepCrm.length; i++) {
                    let IdDepAdd = listDepCrm[i];
                    if (str_dep.length) {
                        str_dep = `${str},${IdDepAdd}`
                    } else {
                        str_dep = String(IdDepAdd)
                    };

                    // lấy danh sách người dùng thuộc phòng 
                    let listUserInDep = await Users.aggregate([{
                        $match: {
                            "inForPerson.employee.organizeDetailId": { $in: [Number(IdDepAdd)] }
                        }
                    }]);
                    for (let j = 0; j < listUserInDep.length; j++) {
                        // lưu lại lịch sử thêm vào giỏ 
                        let newobj = new history_update_cart({
                            cart_id: IdCart,
                            emp_id: listUserInDep[i].idQLC,
                            type: "Add",
                        });
                        await newobj.save();
                    }
                }
            }

            await CRM_customer_group.updateOne({
                gr_id: IdCart
            }, {
                $set: {
                    emp_id: str,
                    dep_id: str_dep
                }
            });



            return functions.success(res, "Thêm nhân viên vào giỏ hàng thành công");
        } else {
            return functions.setError(res, "Không tìm thấy giỏ của khách hàng");
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

// xóa nhân viên khỏi giỏ hàng s
exports.DeleteUserFromCart = async(req, res) => {
    try {
        let IdCrm = Number(req.body.IdCrm);
        let IdCart = Number(req.body.IdCart)
        let inforCart = await CRM_customer_group.findOne({
            gr_id: IdCart
        }).lean();
        if (inforCart) {
            let listArr = inforCart.emp_id.split(",");
            let str = "";
            for (let i = 0; i < listArr.length; i++) {
                if (listArr[i] && (!isNaN(listArr[i]))) {
                    if (String(listArr[i]) != String(IdCrm)) {
                        if (!str) {
                            str = String(IdCrm)
                        } else {
                            str = `${str},${String(IdCrm)}`
                        }
                    }
                }
            };
            str = inforCart.emp_id.replace(String(IdCrm), "")
            await CRM_customer_group.updateOne({
                gr_id: IdCart
            }, {
                $set: {
                    emp_id: str
                }
            });

            // let list_child = await CRM_customer_group.find({
            //     group_parent: 429
            // }).lean();
            // if ((IdCart == 429) || (list_child.find((e) => e.gr_id == IdCart))) {
            //     await AdminUser.updateMany({ emp_id: IdCrm }, { $set: { adm_ntd: 0 } })
            // };

            // xóa trong tập hợp giỏ con 
            let listGroupChild = await CRM_customer_group.find({
                group_parent: IdCart
            }).lean();
            for (let i = 0; i < listGroupChild.length; i++) {
                let group = listGroupChild[i];
                let str_e = group.emp_id.replace(String(IdCrm), "");
                await CRM_customer_group.updateOne({
                    gr_id: Number(group.gr_id)

                }, {
                    $set: {
                        emp_id: str_e
                    }
                });
            };

            // chia đều khách hàng nằm trong nhóm cho những thành viên khác ở trong cùng nhóm khách hàng 
            return functions.success(res, "Xóa nhân viên vào giỏ hàng thành công");
        } else {
            return functions.setError(res, "Không tìm thấy giỏ của khách hàng");
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}


// Lấy danh sách nhân viên được chia giỏ 
exports.takeListNvienKinhDoanh = async(req, res) => {
    try {
        let com_id = Number(req.body.com_id);
        let flag_com = false;
        // console.log(com_id, req.user.data.idQLC)
        if (com_id == Number(req.user.data.idQLC)) {
            flag_com = true;
        }
        let listGroup = await CRM_customer_group.find({
            company_id: com_id,
            // group_parent: 0
        });
        let list_emp = [];
        let list_dep = [];
        for (let i = 0; i < listGroup.length; i++) {
            let list = listGroup[i].emp_id.split(",");
            for (let j = 0; j < list.length; j++) {
                if (list[j] && (!isNaN(list[j]))) {
                    if (!list_emp.find((e) => e == list[j])) {
                        list_emp.push(Number(list[j]))
                    }
                }
            }
            // số phòng cài để nhận khách đang sai => Phải cài lại 
            let listDep = [];
            if (listGroup[i] && listGroup[i].dep_id) {
                listDep = listGroup[i].dep_id.split(",");
                for (let j = 0; j < listDep.length; j++) {
                    if (listDep[j] && (!isNaN(listDep[j]))) {
                        if (!list_dep.find((e) => e == listDep[j])) {
                            list_dep.push(Number(listDep[j]))
                        }
                    }
                }
            }
        };
        // console.log("takeListNvienKinhDoanh", list_emp)
        // dính cả tk tháng trước nữa ?   
        let listUser = await Users.aggregate([{
                $match: {
                    "inForPerson.employee.com_id": com_id,
                    $or: [{ idQLC: { $in: list_emp } }, { "inForPerson.employee.organizeDetailId": { $in: list_dep } }]
                }
            },
            {
                $lookup: {
                    from: 'QLC_OrganizeDetail',
                    localField: 'inForPerson.employee.organizeDetailId',
                    foreignField: 'id',
                    as: 'organizeDetail',
                },
            },
            {
                $unwind: {
                    path: '$organizeDetail',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    pipeline: [{
                        $match: {
                            comId: com_id
                        }
                    }],
                    as: 'positions',
                },
            },
            {
                $unwind: {
                    path: '$positions',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    idQLC: 1,
                    userName: 1,
                    position: "$positions.positionName",
                    organization: "$organizeDetail.organizeDetailName",
                    ep_id: "$idQLC",
                    phoneTK: 1

                }
            }
        ]);
        const key = 'idQLC';
        listUser = [...new Map(listUser.map((item) => [item[key], item])).values()];
        let data = {};
        if (!flag_com) {
            // lấy danh sách nhân viên trong tổ chức mà được quyền xem 
            let dataUser = await Users.findOne({ idQLC: Number(req.user.data.idQLC), type: { $ne: 1 } }).lean();
            if (dataUser) {
                let listIdAllow = [Number(req.user.data.idQLC)];
                let inforPosition = await Positions.findOne({
                    id: dataUser.inForPerson.employee.position_id,
                    comId: com_id
                });
                // if (inforPosition) {
                //     let level = inforPosition.level;
                //     let listUserInDep = await Users.aggregate([{
                //         $match: {
                //             'inForPerson.employee.organizeDetailId': dataUser.inForPerson.employee.organizeDetailId,
                //             'inForPerson.employee.com_id': com_id,
                //             type: {
                //                 $ne: 1
                //             }
                //         }
                //     }, {
                //         $lookup: {
                //             from: 'QLC_Positions',
                //             localField: 'inForPerson.employee.position_id',
                //             foreignField: 'id',
                //             let: { comId: '$comId' },
                //             pipeline: [{
                //                 $match: {
                //                     comId: com_id,
                //                     level: {
                //                         $gte: level
                //                     }
                //                 }
                //             }],
                //             as: 'positions',
                //         }
                //     }, {
                //         $project: {
                //             idQLC: 1
                //         }
                //     }]);
                //     for (let i = 0; i < listUserInDep.length; i++) {
                //         listIdAllow.push(listUserInDep[i].idQLC);
                //     }
                // }
                listUser = listUser.filter((e) => (listIdAllow.find((f) => f == e.idQLC)));

            } else {
                listUser = [];
            }
        }
        data.listUser = listUser;
        return functions.success(res, "Danh sách nhân viên được phân quyền giỏ hàng", data);
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}