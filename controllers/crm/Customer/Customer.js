const axios = require('axios')
const CustomerContact = require("../../../models/crm/Customer/contact_customer");
const Customer = require("../../../models/crm/Customer/customer");
const functions = require("../../../services/functions");
const customerService = require("../../../services/CRM/CRMservice");
const User = require("../../../models/Users");
const ConnectApi = require("../../../models/crm/connnect_api_config");
const HistoryEditCustomer = require("../../../models/crm/history/history_edit_customer");
const CRM_site_infor = require("../../../models/crm/site_infor");
const NhomKH = require("../../../models/crm/Customer/customer_group");
const GroupCustomer = require("../../crm/Customer/GroupCustomer");
const CustomerStatus = require("../../crm/Customer/CustomerStatus");
const moment = require('moment');
const ContentCall = require('../../../models/crm/appointment_content_call');
const Position = require('../../../models/qlc/Positions');
const ManagerExtension = require('../../../models/crm/manager_extension');
const AdminUser = require('../../../models/Timviec365/Admin/AdminUser');
const ManageNghiPhep = require("../../../models/ManageNghiPhep");
const DeXuatCongDiemModel = require("../../../models/crm/DeXuatCongDiem");
const BangDiemCrm = require("../../../models/crm/BangDiemCrm");
const HistoryPointCrm = require("../../../models/crm/HistoryPointCrm");

// hàm thêm mới khách hang
exports.addCustomer = async(req, res) => {
    try {
        let {
            email,
            name,
            stand_name,
            phone_number,
            cit_id,
            district_id,
            ward,
            address,
            ship_invoice_address,
            cmnd_ccnd_number,
            cmnd_ccnd_address,
            cmnd_ccnd_time,
            user_handing_over_work,
            resoure,
            description,
            tax_code,
            group_id,
            status,
            business_areas,
            category,
            business_type,
            classify,
            bill_city,
            bil_district,
            bill_ward,
            bill_address,
            bill_area_code,
            bill_invoice_address,
            bill_invoice_address_email,
            ship_city,
            ship_area,
            bank_id,
            bank_account,
            revenue,
            size,
            rank,
            website,
            number_of_day_owed,
            gender,
            deb_limit,
            share_all,
            is_input,
            is_delete,
            id_cus_from,
            cus_from,
            link,
            content,
            content_call,
        } = req.body;
        let type = req.body;
        let comId = "";
        let empId = "";

        let createDate = functions.getTimeNow();
        let linkDL = "";
        if (!type || ![1, 2].includes(type)) {
            type = 2;
        }
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            comId = req.user.data.com_id;
            empId = req.user.data.idQLC;
            let logo = null;
            let maxID = await customerService.getMaxIDCRM(Customer);
            let cus_id = 0;
            if (maxID) {
                cus_id = Number(maxID) + 1;
            }
            if (logo) {
                const imageValidationResult = await customerService.validateImage(logo);
                if (imageValidationResult === true) {
                    await customerService.uploadFileCRM(cus_id, logo);
                    linkDL = logo.name;
                } else {
                    return functions.setError(
                        res,
                        "Định dạng ảnh không hợp lệ. Chỉ hỗ trợ định dạng JPEG, JPG, PNG, GIF và BMP.",
                        400
                    );
                }
            }
            const validationResult = customerService.validateCustomerInput(
                name,
                comId
            );
            if (validationResult === true) {
                if (type == 2) {
                    // với yêu cầu là khach hàng cá nhân
                    let createCustomer = new Customer({
                        cus_id: cus_id,
                        email: email,
                        name: name,
                        stand_name: stand_name,
                        phone_number: phone_number,
                        cit_id: cit_id,
                        logo: linkDL,
                        district_id: district_id,
                        ward: ward,
                        address: address,
                        ship_invoice_address: ship_invoice_address,
                        cmnd_ccnd_number: cmnd_ccnd_number,
                        cmnd_ccnd_address: cmnd_ccnd_address,
                        cmnd_ccnd_time: cmnd_ccnd_time,
                        resoure: resoure,
                        description: description,
                        tax_code: tax_code,
                        group_id: group_id,
                        status: status,
                        business_areas: business_areas,
                        category: category,
                        business_type: business_type,
                        classify: classify,
                        bill_city: bill_city,
                        bil_district: bil_district,
                        bill_ward: bill_ward,
                        bill_address: bill_address,
                        bill_area_code: bill_area_code,
                        bill_invoice_address: bill_invoice_address,
                        bill_invoice_address_email: bill_invoice_address_email,
                        company_id: comId,
                        user_create_id: empId,
                        ship_city: ship_city,
                        ship_area: ship_area,
                        bank_id: bank_id,
                        bank_account: bank_account,
                        revenue: revenue,
                        rank: rank,
                        website: website,
                        number_of_day_owed: number_of_day_owed,
                        gender: gender,
                        deb_limit: deb_limit,
                        share_all: share_all,
                        type: type,
                        is_input: is_input,
                        is_delete: is_delete,
                        created_at: createDate,
                        id_cus_from: id_cus_from,
                        cus_from: cus_from,
                        link: link,
                    });
                    let saveCS = await createCustomer.save();
                    if (content) {
                        let maxID = await customerService.getMaxIDConnectApi(
                            HistoryEditCustomer
                        );
                        let id = 0;
                        if (maxID) {
                            id = Number(maxID) + 1;
                        }
                        let newHT = new HistoryEditCustomer({
                            id: id,
                            customer_id: cus_id,
                            content: content,
                            created_at: createDate,
                        });
                        let savehis = await newHT.save();
                    }

                    if (content_call) {
                        const maxContentCall = await ContentCall.findOne({}, { id: 1 }).sort({ id: -1 });
                        let id = 1;
                        if (maxContentCall) {
                            id = Number(maxContentCall.id) + 1;
                        }
                        const item = new ContentCall({
                            id: id,
                            id_cus: cus_id,
                            content_call: content_call,
                            created_at: new Date()
                        });
                        await item.save()
                    }

                    return functions.success(res, "get data success", { saveCS });
                }
                if (type == 1) {
                    // với yêu cầu là khach hàng doanh nghiệp
                    let createCustomer = new Customer({
                        cus_id: cus_id,
                        email: email,
                        name: name,
                        stand_name: stand_name,
                        phone_number: phone_number,
                        cit_id: cit_id,
                        logo: linkDL,
                        district_id: district_id,
                        ward: ward,
                        address: address,
                        ship_invoice_address: ship_invoice_address,
                        resoure: resoure,
                        description: description,
                        tax_code: tax_code,
                        group_id: group_id,
                        status: status,
                        business_areas: business_areas,
                        category: category,
                        business_type: business_type,
                        classify: classify,
                        bill_city: bill_city,
                        bil_district: bil_district,
                        bill_ward: bill_ward,
                        bill_address: bill_address,
                        bill_area_code: bill_area_code,
                        bill_invoice_address: bill_invoice_address,
                        bill_invoice_address_email: bill_invoice_address_email,
                        company_id: comId,
                        user_create_id: empId,
                        ship_city: ship_city,
                        ship_area: ship_area,
                        bank_id: bank_id,
                        bank_account: bank_account,
                        revenue: revenue,
                        size: size,
                        user_handing_over_work,
                        rank: rank,
                        website: website,
                        number_of_day_owed: number_of_day_owed,
                        deb_limit: deb_limit,
                        share_all: share_all,
                        type: type,
                        is_input: is_input,
                        is_delete: is_delete,
                        created_at: createDate,
                        id_cus_from: id_cus_from,
                        cus_from: cus_from,
                        link: link,
                    });
                    let saveCS = await createCustomer.save();
                    if (content) {
                        let maxID = await customerService.getMaxIDConnectApi(
                            HistoryEditCustomer
                        );
                        let id = 0;
                        if (maxID) {
                            cus_id = Number(maxID) + 1;
                        }
                        let newHT = new HistoryEditCustomer({
                            id: id,
                            customer_id: cus_id,
                            content: content,
                            created_at: createHtime,
                        });
                        let savehis = await newHT.save();
                    }

                    if (content_call) {
                        const maxContentCall = await ContentCall.findOne({}, { id: 1 }).sort({ id: -1 });
                        let id = 1;
                        if (maxContentCall) {
                            id = Number(maxContentCall.id) + 1;
                        }
                        const item = new ContentCall({
                            id: id,
                            id_cus: cus_id,
                            content_call: content_call,
                            created_at: new Date()
                        });
                        await item.save()
                    }

                    return functions.success(res, "get data success", { saveCS });

                } else {
                    return functions.setError(res, "type không hợp lệ", 400);
                }
            }
        } else {
            return functions.setError(res, "bạn không có quyền", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

const takeVipUser = async(idQLC) => {
    try {
        // console.log("Chuyển giỏ của", idQLC)
        let time = new Date().getTime();
        // let dataNghi = await ManageNghiPhep.find({
        //     idFrom: Number(idQLC),
        //     $and: [{
        //         from: {
        //             $lte: time
        //         }
        //     }, {
        //         end: {
        //             $gte: time
        //         }
        //     }]
        // });
        // if (dataNghi.length == 0) {
        //     // console.log("Đang đi làm", idQLC)
        //     // kiểm tra đơn nghỉ từ khi áp dụng phần mềm 
        //     let listDexuat = await ManageNghiPhep.find({
        //         idFrom: Number(idQLC),
        //     });
        //     if (listDexuat.length) { // từng có đề xuất 

        //     }
        // }
        console.log("Cập nhật danh sách khách VIP", idQLC)

        // khách VIP hoạt động trong 1 tuần gần nhất 
        let time2 = new Date().getTime() / 1000 - 3600 * 168;
        let lisCusVipBeTranfer = await Customer.find({
            fromVip: idQLC,
            // updated_at: { $gte: time2 },
            emp_id: { $ne: idQLC }
        }).lean();

        console.log("Danh sach khach chua duoc chuyen", lisCusVipBeTranfer)

        // chỉ riêng với tìm việc
        let admin = await AdminUser.findOne({ emp_id: idQLC }).lean();
        if (admin) {
            console.log("Co admin", admin.adm_bophan)
            let usc_kd = admin.adm_bophan;
            for (let i = 0; i < lisCusVipBeTranfer.length; i++) {
                let obj = lisCusVipBeTranfer[i];
                if (obj.cus_from == "tv365") {
                    console.log("Chuyen ve gio tren timviec", obj.id_cus_from)
                    await User.updateOne({
                        type: 1,
                        idTimViec365: Number(obj.id_cus_from)
                    }, {
                        $set: {
                            "inForCompany.usc_kd": usc_kd
                        }
                    });
                    await functions.tranferGioElastic(Number(obj.id_cus_from));

                }
            }
        };

        // site vệ tinh 
        // tạm dừng do bên Văn Long đẩy sang linh tinh 
        // gọi chuyển giỏ sang vệ tinh
        for (let i = 0; i < lisCusVipBeTranfer.length; i++) {
            const check_customer = lisCusVipBeTranfer[i];
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
            fromVip: idQLC,
            emp_id: { $ne: idQLC }
        }, {
            $set: {
                emp_id: idQLC
            }
        });
    } catch (e) {
        console.log("takeVipUser", e);
        return false;
    }
}

// Đề xuất cộng điểm CRM 
exports.DexuatCongDiem = async(req, res) => {
    try {
        let idCrm = Number(req.body.idCrm);
        let point = Number(req.body.point);
        let Kinhdoanh = await User.findOne({ idQLC: idCrm, type: 2 }).lean();
        let message = `Đồng chí ${Kinhdoanh.userName} đề xuất cộng ${point} điểm cho ngày ${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}\nChi tiết tại: https://hungha365.com/crm
                      `;
        let newmodel = new DeXuatCongDiemModel({
            creator: idCrm,
            point,
            company: Kinhdoanh.inForPerson.employee.com_id
        });
        await newmodel.save();
        await functions.sendMessageDexuatDiemCrm(1192, message)
        return res.json({
            data: {
                message: "Gửi đề xuất thành công"
            }
        })

    } catch (e) {
        console.log(e);
        return functions.setError(res, "Lỗi api");
    }
};

// api duyệt đề xuất cộng điểm
exports.DuyetDexuatCongDiem = async(req, res) => {
    try {
        const IdDeXuat = String(req.body.IdDeXuat);
        let dexuat = await DeXuatCongDiemModel.findOne({ _id: IdDeXuat }).lean();
        let com_id = dexuat.company;
        if (req.user.data.idQLC == com_id) {
            if (dexuat.status == 0) {
                let creator = await User.findOne({ idQLC: Number(dexuat.creator) }).lean();
                let time = new Date(1000 * Number(dexuat.createdAt));
                let message = `Đề xuất cộng ${dexuat.point} điểm của ${creator.userName} cho ngày ${time.getDate()}-${time.getMonth()+1}-${time.getFullYear()} đã được duyệt/nChi tiết tại: https://hungha365.com/crm`
                functions.sendMessageDexuatDiemCrm(1192, message);
                functions.sendMessageToChuyenVien(creator._id, message);

                // cập nhật trạng thái đề xuất 
                await DeXuatCongDiemModel.updateOne({
                    _id: IdDeXuat
                }, {
                    $set: {
                        status: 1
                    }
                })

                // cộng điểm cho chuyên viên
                let tt_diem = await BangDiemCrm.findOne({
                    idKinhDoanh: Number(dexuat.creator)
                });
                if (tt_diem) {
                    let newpoint = tt_diem.point + dexuat.point;
                    await BangDiemCrm.updateOne({
                        idKinhDoanh: Number(dexuat.creator)
                    }, {
                        $set: {
                            point: newpoint,
                            createdAt: new Date().getTime() / 1000,
                            updatedAt: new Date().getTime() / 1000
                        }
                    })
                } else {
                    let newBangDiem = new BangDiemCrm({
                        idKinhDoanh: Number(dexuat.creator),
                        point: dexuat.point
                    });
                    await newBangDiem.save();
                }

                // Lưu lịch sử cộng điểm 
                let newHistory = new HistoryPointCrm({
                    emp_id: Number(dexuat.creator),
                    type: "ADD"
                });
                await newHistory.save();

                return res.json({
                    data: {
                        message: "Duyệt đề xuất thành công"
                    }
                })
            } else {
                return functions.setError(res, "Đề xuất đã được duyệt");
            }

        } else {
            return functions.setError(res, "Bạn không được cấp quyền");
        }

    } catch (e) {
        console.log(e);
        return functions.setError(res, "Lỗi api");
    }
};

// api xóa đề xuất 

// api lấy danh sách đề xuất, bộ lọc theo ngày, phân trang 

// api lấy danh sách điểm 

// api lấy lịch sử điểm. 

// api lấy danh sách ứng viên, tìm kiếm ứng viên 

// làm theo cơ chế che, dùng điểm để mở , dùng điểm để xuất excel. 


//Hien thi
exports.showKH = async(req, res) => {
    try {
        let { page, perPage, keyword, status, resoure, emp_id, time_s, time_e, group_id, create_at_s, create_at_e } = req.body; // Số lượng giá trị hiển thị trên mỗi trang
        const user = req.user.data;
        page = Number(page) || 1;
        perPage = Number(perPage) || 10;

        let startIndex = (page - 1) * perPage;
        let com_id = user.com_id;
        let query = {
            company_id: com_id,
            is_delete: 0,
            // phone_number: { $nin: [null, ''] }
        };
        // cập nhật lấy lại khách hàng vip 
        takeVipUser(user.idQLC);

        if (keyword) {
            query = {
                $or: [
                    // { cus_id: keyword },
                    { name: { $regex: keyword, $options: "i" } },
                    { phone_number: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } },
                ],
                ...query
            };
        }
        if (status) {
            query.status = Number(status);
        }
        if (resoure) {
            query.resoure = Number(resoure);
        }
        if (emp_id) {
            query.emp_id = Number(emp_id);
        }
        if (group_id) {
            query.group_id = group_id;
            let listGroupChild = await NhomKH.find({ group_parent: group_id });
            if (listGroupChild.length) {
                let listIdGroup = [group_id];
                for (grChild of listGroupChild) {
                    listIdGroup.push(grChild.gr_id);
                }
                query.group_id = { $in: listIdGroup };
            }
        }

        let listUser = await User.find({ 'inForPerson.employee.com_id': com_id, type: 2 }).select('idQLC userName').lean();
        if (time_s && !time_e) {
            query.updated_at = { $gte: functions.convertTimestamp(time_s) };
        }
        if (!time_s && time_e) {
            query.updated_at = { $lte: functions.convertTimestamp(time_e) };
        }
        if (time_s && time_e) {
            query.updated_at = { $gte: functions.convertTimestamp(time_s), $lte: functions.convertTimestamp(time_e) };
        };

        // create_at_e
        // create_at_s
        if (create_at_s && !create_at_e) {
            query.created_at = { $gte: functions.convertTimestamp(create_at_s) };
        }
        if (!create_at_s && create_at_e) {
            query.created_at = { $lte: functions.convertTimestamp(create_at_e) };
        }
        if (create_at_s && create_at_e) {
            query.created_at = { $gte: functions.convertTimestamp(create_at_s), $lte: functions.convertTimestamp(create_at_e) };
        };


        let candidate = await User.findOne({ idQLC: user.idQLC, type: user.type }).select("type inForPerson.employee");
        if (user.type == 2) {
            // trường hợp là nhân viên
            let idQLC = user.idQLC;

            const position = await Position.findOne({ id: candidate.inForPerson.employee.position_id, comId: com_id }).select("isManager");
            // Nếu là cấp quản lý
            if (position) {
                if (position.isManager == 2) {
                    const listOrganizeDetailId = candidate.inForPerson.employee.listOrganizeDetailId;
                    const getListEmployeeInDep = await User.find({
                        "inForPerson.employee.com_id": com_id,
                        "inForPerson.employee.listOrganizeDetailId": { $all: listOrganizeDetailId }
                    }).select("idQLC");

                    let ListIdInDepartment = getListEmployeeInDep.map(item => item.idQLC);
                    //query = { emp_id: { $in: ListIdInDepartment }, ...query };
                    query = { emp_id: { $in: [idQLC] }, ...query }
                }
                // Nếu là cấp nhân viên
                else if (position.isManager == 0) {
                    query = { emp_id: idQLC, ...query };
                }
            } else {
                query = { emp_id: idQLC, ...query };
            }
        }

        let showCty = await Customer.find(query)
            .select("cus_id name phone_number email group_id emp_id user_create_id user_handing_over_work status description resoure updated_at link count_call cus_from birthday company_id user_create_id created_at is_delete type text_record")
            .sort({ updated_at: -1 })
            .skip(startIndex)
            .limit(perPage)
            .lean();
        for (let i = 0; i < showCty.length; i++) {
            let element = showCty[i];

            element.text_record = element.text_record || ''
                // Tìm thông tin người dùng dựa trên emp_id
            let emplopyee = await customerService.findUserByQLC(listUser, element.emp_id);
            element.userName = emplopyee.userName;

            // Tìm thông tin người tạo dựa trên user_create_id
            let employeeCreate = await customerService.findUserByQLC(listUser, element.user_create_id);
            element.userNameCreate = employeeCreate.userName;

            // Tìm thông tin người chuyển việc dựa trên user_handing_over_work
            let userHandingOverWork = await customerService.findUserByQLC(listUser, element.user_handing_over_work);
            element.NameHandingOverWork = userHandingOverWork.userName;
            element.created_at = moment(element.updated_at * 1000).format('DD/MM/YYYY HH:mm:ss');
            element.updated_at = moment(element.updated_at * 1000).format('DD/MM/YYYY HH:mm:ss');

            element.count_content_call = await ContentCall.countDocuments({ id_cus: element.cus_id });
        }
        let totalRecords = await Customer.countDocuments(query);
        return res.status(200).json({
            resule: true,
            message: "Danh sách khách hàng",
            data: showCty,
            total: totalRecords,
            query
        });

    } catch (e) {
        console.log(e)
        return functions.setError(res, e.message)
    }
};

//Xoa khach hang
exports.DeleteKH = async(req, res) => {
    try {
        let { cus_id } = req.body;
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            com_id = req.user.data.com_id;
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
        if (!cus_id || cus_id.length === 0) {
            return functions.setError(res, "Mảng cus_id không được bỏ trống", 400);
        }
        const existingCustomers = await Customer.find({
            cus_id: { $in: cus_id },
            company_id: com_id,
        });
        if (existingCustomers.length === 0) {
            return functions.setError(res, "Khách hàng không tồn tại", 400);
        }
        const deleteCustomers = existingCustomers.filter(
            (customer) => customer.is_delete === 0
        );
        if (deleteCustomers.length === 0) {
            return functions.setError(
                res,
                "Tất cả khách hàng đã bị xóa trước đó",
                400
            );
        }
        await Customer.updateMany({ cus_id: { $in: cus_id }, company_id: com_id }, { is_delete: 1 });
        return functions.success(res, "Xóa thành công");
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

// thêm mới Api kết nối
exports.addConnectCs = async(req, res) => {
    try {
        let { appID, webhook } = req.body;
        let comId = "";
        let userID = "";
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            comId = req.user.data.com_id;
            userID = req.user.data.idQLC;
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
        let tokenCn = req.headers["authorization"];
        let createDate = new Date();

        if (!appID) {
            return functions.setError(res, "appID không được bỏ trống", 400);
        }
        if (!webhook) {
            return functions.setError(res, "webhook không được bỏ trống", 400);
        }
        let maxID = await customerService.getMaxIDConnectApi(ConnectApi);
        let idAPI = 0;
        if (maxID) {
            idAPI = Number(maxID) + 1;
        }
        let checkCn = await ConnectApi.findOne({ company_id: comId });
        if (checkCn) {
            return functions.success(res, "Api kết nối đã có không thể tạo mới", {
                checkCn,
            });
        } else {
            let createApi = await new ConnectApi({
                id: idAPI,
                company_id: comId,
                appID: appID,
                webhook: webhook,
                token: tokenCn,
                user_edit_id: userID,
                user_edit_type: 1,
                stt_conn: 1,
                created_at: createDate,
            });
            let saveApi = await createApi.save();
            return functions.success(res, "thêm thành công", { saveApi });
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

// sửa Api kết nối
exports.editConnectCs = async(req, res) => {
    try {
        let { appID, webhook } = req.body;
        let emp_id = "";
        let comId = "";
        let tokenCn = req.headers["authorization"];
        let updateDate = new Date();
        if (!appID) {
            return functions.setError(res, "appID không được bỏ trống", 400);
        }
        if (!webhook) {
            return functions.setError(res, "webhook không được bỏ trống", 400);
        }
        if (req.user.data.type == 2 || req.user.data.type == 1) {
            emp_id = req.user.data.idQLC;
            comId = req.user.data.com_id;
            await customerService.getDatafindOneAndUpdate(
                ConnectApi, { company_id: comId }, {
                    company_id: comId,
                    appID: appID,
                    webhook: webhook,
                    token: tokenCn,
                    user_edit_id: emp_id,
                    user_edit_type: 1,
                    stt_conn: 1,
                    updated_at: updateDate,
                }
            );
            return functions.success(res, "Api edited successfully");
        } else {
            return functions.setError(res, "bạn không có quyền", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

// hiển thị Api kết nối
exports.ShowConnectCs = async(req, res) => {
    try {
        let comId = req.user.data.com_id;
        const check = await ConnectApi.findOne({ company_id: comId });
        return functions.success(res, "Lấy dữ liệu thành công", { check });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.searchSame = async(req, res) => {
    try {
        const {
            limit,
            start,
            choose,
            emp_id,
            com_id,
            slt_name_customer,
            name_customer,
            slt_phone_customer,
            phone_customer,
            slt_tax_code_customer,
            tax_code_customer,
            slt_website_customer,
            website_customer,
        } = req.body;

        const select =
            "cus_id email name phone_number tax_code website address resoure birthday status description group_id emp_id com_id is_delete type created_at updated_at cus_from user_handing_over_work";

        const query = {
            is_delete: 0,
            com_id: com_id,
        };

        if (emp_id !== "") {
            query.emp_id = { $in: emp_id };
        }

        if (choose === 2) {
            query.$or = [];
        }

        if (slt_name_customer && name_customer) {
            const nameCondition = getConditionObject(
                slt_name_customer,
                "name",
                name_customer
            );
            if (query.$or) {
                query.$or.push(nameCondition);
            } else {
                query.$or = [nameCondition];
            }
        }

        if (slt_phone_customer && phone_customer) {
            const phoneCondition = getConditionObject(
                slt_phone_customer,
                "phone_number",
                phone_customer
            );
            if (query.$or) {
                query.$or.push(phoneCondition);
            } else {
                query.$or = [phoneCondition];
            }
        }

        if (slt_tax_code_customer && tax_code_customer) {
            const taxCodeCondition = getConditionObject(
                slt_tax_code_customer,
                "tax_code",
                tax_code_customer
            );
            if (query.$or) {
                query.$or.push(taxCodeCondition);
            } else {
                query.$or = [taxCodeCondition];
            }
        }

        if (slt_website_customer && website_customer) {
            const websiteCondition = getConditionObject(
                slt_website_customer,
                "website",
                website_customer
            );
            if (query.$or) {
                query.$or.push(websiteCondition);
            } else {
                query.$or = [websiteCondition];
            }
        }

        if (choose === 2 && (!query.$or || query.$or.length === 0)) {
            query.$or = [{}];
        }

        const total = await Customer.countDocuments(query);
        const customers = await Customer.find(query)
            .select(select)
            .limit(limit)
            .skip(start)
            .sort({ cus_id: 1 });

        const data = {
            customer: customers,
            total: total,
        };

        return res.status(200).json(data);
    } catch (error) {
        console.error("Failed to search customers", error);
        res.status(500).json({ error: "Failed to search customers" });
    }
};

function getConditionObject(option, field, value) {
    const conditionObj = {};

    switch (option) {
        case 1:
            conditionObj[field] = value;
            break;
        case 2:
            conditionObj[field] = { $ne: value };
            break;
        case 3:
            conditionObj[field] = { $regex: value, $options: "i" };
            break;
        case 4:
            conditionObj[field] = { $not: { $regex: value, $options: "i" } };
            break;
    }

    return conditionObj;
}

exports.addFromWebsite = async(req, res) => {
    try {
        const {
            name,
            email,
            phone,
            emp_id,
            id_cus_from,
            resoure,
            status,
            from,
            group,
            type,
            link_multi,
        } = req.body;

        const customerMax = await Customer.findOne({}, { cus_id: 1 })
            .sort({ cus_id: -1 })
            .lean();

        const now = functions.getTimeNow()

        const customer = new Customer({
            cus_id: Number(customerMax.cus_id) + 1,
            name,
            email,
            phone_number: phone,
            company_id: 220309,
            emp_id: emp_id,
            resoure,
            status,
            group_id: group,
            type,
            id_cus_from: id_cus_from,
            cus_from: from,
            link: link_multi,
            created_at: now,
            updated_at: now
        });
        await customer.save();
        return functions.success(res, "Thêm mới thành công");
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

exports.editFromWebsite = async(req, res) => {
    try {
        const { name, email, phone, emp_id, id_cus_from, from, group } = req.body;
        if (id_cus_from && from) {
            const time_now = functions.getTimeNow();
            const condition = { id_cus_from, cus_from: from };
            let data = { updated_at: time_now };
            if (name) { data.name = name; }
            if (email) { data.email = email; }
            if (phone) { data.phone_number = phone; }
            if (emp_id) { data.emp_id = emp_id; }
            if (group) { data.group_id = group; }
            await Customer.updateOne(condition, { $set: data }); // Bỏ qua chạy bất đồng bộ
            return functions.success(res, "Cập nhật thành công");
        }
        return functions.setError(res, "Chưa truyền id_cus_from và from");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error.message);
    }
}

exports.update_time_called = async(req, res) => {
    try {
        const { phone_number, ext_number, last_time_called, last_status_called } = req.body;
        if (phone_number && phone_number != 'unknown') {
            const inForHHP = functions.inForHHP();
            const company_id = inForHHP.company_id;
            const line = await ManagerExtension.findOne({ company_id: company_id, ext_number: Number(ext_number) }, { emp_id: 1 }).lean();

            let query = { phone_number: { $regex: phone_number }, company_id, is_delete: 0, type: 2, cus_from: { $ne: "uv365" } };
            if (line) {
                query.emp_id = Number(line.emp_id);
            }
            const customers = await Customer.find(query).select("cus_id phone_number cus_from emp_id");
            if (customers && customers.length > 0) {
                let listCustomer = customers;
                // let listCustomer = customers.filter(item => item.cus_from == 'tv365');
                // if (listCustomer.length == 0) {
                //     listCustomer = customers;
                // }
                for (let i = 0; i < listCustomer.length; i++) {
                    const customer = listCustomer[i];
                    await Customer.updateOne({ cus_id: customer.cus_id }, {
                        $set: {
                            is_new_customer: 0,
                            last_time_called: last_time_called,
                            last_status_called: last_status_called
                        }
                    });
                    console.log(`SĐT: ${customer.phone_number}, trạng thái: ${last_status_called}, nguồn: ${customer.cus_from}, id NV: ${customer.emp_id}`);
                }
            }
            return functions.success(res, "Thành công");
        }
        return functions.setError(res, "phone_number is not unknow");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
}

exports.addCustomerVT = async(req, res) => {
    try {
        let company_id = req.user.data.id || 0,
            name = req.body.name,
            email = req.body.email,
            phone_number = req.body.phone,
            ep_id = Number(req.body.ep_id) || 0,
            id_cus_from = req.body.id_cus_from,
            resoure = Number(req.body.resoure) || 0,
            status = Number(req.body.status) || 0,
            group_id = Number(req.body.group) || 0,
            type = Number(req.body.type) || 0,
            link_multi = req.body.link_multi,
            from = req.body.from,
            from_admin = Number(req.body.from_admin) || 0,
            created_at = Number(req.body.created_at) || functions.getTimeNow(),
            updated_at = Number(req.body.updated_at) || functions.getTimeNow(),
            description = req.body.description,
            ward = Number(req.body.ward) || 0,
            city = Number(req.body.city) || 0,
            district = Number(req.body.district) || 0,
            address = req.body.address;
        if (company_id == 3312) {
            company_id = 10013446;
        }
        const MaxId = await Customer.findOne({}, { cus_id: 1 }).sort({ cus_id: -1 });
        const cus_id = Number(MaxId.cus_id) + 1;
        let data = {
            cus_id,
            name,
            email,
            phone_number,
            emp_id: ep_id ? ep_id : 0,
            cit_id: city ? city : 0,
            district_id: district ? district : '',
            address,
            id_cus_from,
            link: link_multi,
            resoure: resoure ? resoure : 0,
            status,
            cus_from: from,
            group_id,
            type,
            created_at,
            updated_at,
            company_id,
            description: description ? description : '',
            ward: ward ? ward : 0,
        };

        if (from_admin) {
            data.from_admin = 1;
        }

        const customer = new Customer(data);
        await customer.save();
        return functions.success(res, "Thành công");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error.message);
    }
}

const CheckNghiPhepChuyenVien = async(idChuyenVien, com_id) => {
    try {
        console.log("CheckNghiPhepChuyenVien", idChuyenVien, com_id);
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
            console.log("Có lịch làm việc", idChuyenVien, com_id)
            return true;
        } else {
            console.log("Không có lịch làm việc", idChuyenVien, com_id)
            return false;
        }
    } catch (e) {
        console.log("Lỗi CheckNghiPhepChuyenVien", e, idChuyenVien, com_id)
        return false;
    }
}

const CheckNghiPhep = async(customer) => {
    try {
        // máy chủ tính theo giờ GMT , bỏ qua ngày chủ nhật không chuyển 
        let day = new Date().getDay();
        if (day != 0) {
            let check = await CheckNghiPhepChuyenVien(Number(customer.emp_id), Number(customer.company_id));
            if (!check) { // nếu không có lịch làm việc
                // kiểm tra đơn xin 
                let time = new Date().getTime();
                let dataNghi = await ManageNghiPhep.find({
                    idFrom: Number(customer.emp_id),
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
                let message = `Khách hàng với ID CRM: ${customer.cus_id},
                                    ID: ${customer.id_cus_from}
                                    email: ${customer.email },
                                    số điện thoại: ${customer.phone_number},
                                    đã được chuyển tới giỏ của bạn
                                    vào lúc ${new Date().getHours()}:${new Date().getMinutes()}
                                    `
                if (dataNghi.length) { // nếu có chỉ định 
                    console.log("Có đơn chỉ định");
                    await Customer.updateOne({
                        cus_id: customer.cus_id
                    }, {
                        $set: {
                            emp_id: Number(dataNghi[0].idTo)
                        }
                    });

                    // gọi chuyển giỏ sang vệ tinh 
                    let site_infor = await CRM_site_infor.findOne({
                        cus_from: String(customer.cus_from)
                    })
                    if (site_infor) {
                        await axios({
                            method: 'post',
                            url: site_infor.link_update_cart,
                            data: {
                                cus_from_id: customer.id_cus_from,
                                emp_id: customer.emp_id,
                                userName: customer.name,
                                phone: customer.phone_number,
                                email: customer.email,
                                address: customer.address,
                            },
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                    };
                    functions.sendMessageToChuyenVienQlc(Number(dataNghi[0].idTo), message)
                } else { // không có chỉ định 
                    console.log("Không có đơn chỉ định")
                    let group_id = Number(customer.group_id);
                    let group = await NhomKH.findOne({ gr_id: Number(group_id) }).lean();
                    let list_emp_id = group.emp_id.split(",").map(Number).filter((e) => (e != 0) && (!isNaN(e)));
                    list_emp_id = list_emp_id.filter((e) => e != Number(customer.emp_id))
                    let stt = 0;
                    if (group.orderexpert) {
                        stt = Number(group.orderexpert)
                    };

                    let chuyenvienChoose = list_emp_id[stt];
                    let flag = true;
                    if (!list_emp_id[stt]) {
                        stt = stt + 1;
                    };
                    if (stt > (list_emp_id.length - 1)) {
                        stt = 0;
                    };
                    let stone = stt;

                    // if (stt == 0) {
                    //     stone = listUser.length - 1
                    // };
                    let day = new Date().getDay();
                    if (day != 0) {

                        while (flag && (stt != stone)) {
                            if (!list_emp_id[stt]) {
                                stt = stt + 1;
                            };
                            let check = await CheckNghiPhepChuyenVien(list_emp_id[stt].idQLC, Number(customer.company_id)); // nếu không có lịch làm việc thì chia đều 
                            if (check) {
                                flag = false;
                            } else {
                                stt = stt + 1;
                                if (stt > (list_emp_id.length - 1)) {
                                    stt = 0;
                                };
                            }
                        };

                        chuyenvienChoose = list_emp_id[stt];
                        // nếu tìm được thì mới chuyển giỏ 
                        if (chuyenvienChoose) {
                            await Customer.updateOne({
                                cus_id: customer.cus_id
                            }, {
                                $set: {
                                    emp_id: Number(chuyenvienChoose)
                                }
                            });
                            // gọi chuyển giỏ sang vệ tinh 
                            let site_infor = await CRM_site_infor.findOne({
                                cus_from: String(customer.cus_from)
                            });

                            if (site_infor) {
                                await axios({
                                    method: 'post',
                                    url: site_infor.link_update_cart,
                                    data: {
                                        cus_from_id: customer.id_cus_from,
                                        emp_id: chuyenvienChoose,
                                        userName: customer.name,
                                        phone: customer.phone_number,
                                        email: customer.email,
                                        address: customer.address,
                                    },
                                    headers: { 'Content-Type': 'multipart/form-data' },
                                });

                            };

                            functions.sendMessageToChuyenVienQlc(Number(chuyenvienChoose), message)

                            // cập nhât số thứ tự mới để chia giỏ
                            let new_stt = stt + 1;
                            if (new_stt > (list_emp_id.length - 1)) {
                                new_stt = 0;
                            };


                            await NhomKH.updateMany({
                                gr_id: Number(group_id)
                            }, {
                                $set: {
                                    orderexpert: new_stt
                                }
                            });
                        }
                    }
                }
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}
exports.editCustomerVT = async(req, res) => {
    try {
        console.log("editCustomerVT", req.body);
        let name = req.body.name,
            email = req.body.email,
            phone = req.body.phone,
            resoure = Number(req.body.resoure) || 0,
            status = Number(req.body.status) || 0,
            group = Number(req.body.group) || 0,
            ep_id = Number(req.body.ep_id) || 0,
            city = Number(req.body.city) || 0,
            district = Number(req.body.district) || 0,
            ward = Number(req.body.ward) || 0,
            address = req.body.address,
            from = req.body.from,
            description = req.body.description,
            id_cus_from = Number(req.body.id_cus_from) || 0;
        let data = { updated_at: functions.getTimeNow() };
        const check_customer = await Customer.findOne({ id_cus_from, cus_from: from }).lean();

        CheckNghiPhep(check_customer);


        if (name) data.name = name;
        if (email) data.email = email;
        if (phone) data.phone_number = phone;
        if (resoure) data.resoure = resoure;
        if (status) data.status = status;
        if (group && check_customer && (check_customer.group_id !== 467)) data.group_id = group;
        if (ep_id) data.ep_id = ep_id;
        if (city) data.city = city;
        if (district) data.district = district;
        if (ward) data.ward = ward;
        if (address) data.address = address;
        if (from) data.cus_from = from;
        if (description) data.description = description;
        if (id_cus_from) data.id_cus_from = id_cus_from;

        await Customer.updateOne({ id_cus_from, cus_from: from }, {
            $set: data
        });
        return functions.success(res, "Thành công");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error.message);
    }
}

exports.deleteCustomerVT = async(req, res) => {
    try {
        let from = req.body.from,
            id_cus_from = Number(req.body.id_cus_from) || 0;
        const check_customer = await Customer.deleteOne({ id_cus_from, cus_from: from })
        return functions.success(res, "Thành công");
    } catch (error) {
        console.log(error)
        return functions.setError(res, error.message);
    }
}

//Hàm nhắn tin sang app chat
const SendMess = async(senderId, contactId, message) => {
    try {
        let takeConvId = await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/conversations/CreateNewConversation",
            data: {
                userId: Number(senderId),
                contactId: Number(contactId),
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/message/SendMessage",
            data: {
                ConversationID: Number(takeConvId.data.data.conversationId),
                SenderID: Number(senderId),
                MessageType: 'text',
                Message: message
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return true;
    } catch (e) {
        console.log("SendMess", e);
        return false;
    }
}

exports.addCustomerSocial = async(req, res) => {
    try {
        const data = req.body.data
        const createDate = functions.getTimeNow();
        // Lấy thời gian hiện tại
        const currentDate = new Date();
        // Đặt giờ, phút, giây và mili giây thành 0
        currentDate.setHours(0, 0, 0, 0);
        // Lấy thời điểm đầu tiên của ngày
        const startTime = Math.floor(currentDate.getTime() / 1000)

        //Lấy ds kd đổ ntd về
        const group = await NhomKH.findOne({ gr_id: 452 })
        const list_emp_id = group.emp_id.replaceAll(' ').split(',')
            // const arr_id_KD = list_emp_id.map(emp_id => Number(emp_id))
        let arr_id_KD = []
        for (let i = 0; i < list_emp_id.length; i++) {
            if (list_emp_id[i] !== '') {
                {
                    arr_id_KD.push(Number(list_emp_id[i]))
                }
            }
        }
        //Check KD có đi làm không
        let list_temp = [];
        for (let i = 0; i < arr_id_KD.length; i++) {
            let response = await axios({
                method: 'post',
                url: 'https://api.timviec365.vn/api/qlc/shift/list_shift_user_new',
                data: {
                    u_id: arr_id_KD[i],
                    c_id: Number(group.company_id)
                },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response && response.data && response.data.data && response.data.data.shift && response.data.data.shift.length) {
                list_temp.push(arr_id_KD[i]);
            }
        }
        arr_id_KD = list_temp
            //Lấy kd đã nhận ndt cuối cùng
        const lastKD = await Customer.find({ resoure: 1 }, { emp_id: 1, created_at: 1 }).sort({ created_at: -1 }).limit(1).lean()
            //Lấy vị trí của last KD trong ds KD
        if (lastKD && lastKD.length > 0) {
            index_KD = arr_id_KD.findIndex(item => item == lastKD[0].emp_id)
        }

        for (let i = 0; i < data.length; i++) {
            let phone_number, email
            if (data[i].list_phone && data[i].list_phone.length > 0) {
                phone_number = data[i].list_phone[0] ? data[i].list_phone[0].replaceAll(' ', '').replaceAll('.', '') : null
            }
            if (data[i].list_email && data[i].list_email.length > 0) {
                email = data[i].list_email[0]
            }
            //Check ntd này đã thuộc KD nào chưa
            const check_ntd = await Customer.findOne({ phone_number: phone_number, email: email, resoure: 1 }, { emp_id: 1, cus_id: 1, created_at: 1, list_post: 1 }).sort({ created_at: -1 })
                //Chưa có ntd thì thêm mới ntd
            if (!check_ntd) {
                //Quay vòng trở lại
                if (index_KD >= arr_id_KD.length - 1) {
                    index_KD = 0
                } else {
                    index_KD += 1
                }
                if (phone_number || email) {
                    let maxID = await customerService.getMaxIDCRM(Customer);
                    let createCustomer = await Customer.create({
                        cus_id: maxID + 1,
                        name: 'NTD Social',
                        email: email,
                        phone_number: phone_number,
                        emp_id: arr_id_KD[index_KD],
                        group_id: 456,
                        company_id: 10013446,
                        type: 2,
                        resoure: 1, //nguồn từ fb
                        cus_from: 'facebook',
                        list_post: [{
                            link_user_post: data[i].link_user_post,
                            description: data[i].text || '',
                            created_at: createDate
                        }],
                        link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${maxID + 1}`,
                        description: data[i].text || '', //bài đăng
                        link_user_post: data[i].link_user_post, //link fb người đăng bài
                        created_at: createDate,
                        updated_at: createDate
                    })

                    //NTD có sdt mới thông báo về chat để gọi điện
                    if (phone_number) {
                        const senderId = 1192 //id người gửi, cty hung ha
                        const message = `Khách hàng với ID CRM: ${maxID}, số điện thoại: ${phone_number} từ Facebook đã được chuyển tới giỏ của bạn\nLink CRM: https://hungha365.com/crm/customer/detail/${maxID}?name=NTD+Social`
                        const user = await User.findOne({ idQLC: arr_id_KD[index_KD], type: 2 }, { _id: 1 })
                        await SendMess(senderId, user._id, message)
                    }
                }
            } else { // Có rồi thì lưu thêm bài viết, cập nhật lại nhóm khách hàng
                const post = {
                        link_user_post: data[i].link_user_post,
                        description: data[i].text || '',
                        created_at: createDate
                    }
                    //Check xem trong ngày đã đăng tin mới chưa
                const check_post = check_ntd.list_post.find(post => post.created_at > startTime)
                if (check_post) {
                    await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                        $push: { list_post: post },
                        $set: {
                            link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                            description: data[i].text || '', //bài đăng
                            link_user_post: data[i].link_user_post, //link fb người đăng bài
                            updated_at: createDate,
                        }
                    })
                } else {
                    await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                        $push: { list_post: post },
                        $set: {
                            group_id: 455,
                            link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                            description: data[i].text || '', //bài đăng
                            link_user_post: data[i].link_user_post, //link fb người đăng bài
                            updated_at: createDate,
                        }
                    })
                }
            }
        }

        return functions.success(res, "Thêm thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

//Thêm mới khách hàng chuyển đổi số từ mạng xã hội
exports.addCustomerDigXSocial = async(req, res) => {
    try {
        const EMP_ID = 10020503,
            CHAT_ID = 10022319,
            COM_ID = 10013446
        const data = req.body.data
        const createDate = functions.getTimeNow();
        // Lấy thời gian hiện tại
        const currentDate = new Date();
        // Đặt giờ, phút, giây và mili giây thành 0
        currentDate.setHours(0, 0, 0, 0);
        // Lấy thời điểm đầu tiên của ngày
        const startTime = Math.floor(currentDate.getTime() / 1000)

        for (let i = 0; i < data.length; i++) {
            let phone_number, email
            if (data[i].list_phone && data[i].list_phone.length > 0) {
                phone_number = data[i].list_phone[0] ? data[i].list_phone[0].replaceAll(' ', '').replaceAll('.', '') : null
            }
            if (data[i].list_email && data[i].list_email.length > 0) {
                email = data[i].list_email[0]
            }
            if (phone_number || email) {
                const check_ntd = await Customer.findOne({ phone_number: phone_number, email: email, resoure: 1 }, { emp_id: 1, cus_id: 1, created_at: 1, list_post: 1 }).sort({ created_at: -1 })
                if (!check_ntd) {
                    let maxID = await customerService.getMaxIDCRM(Customer);
                    let createCustomer = await Customer.create({
                        cus_id: maxID + 1,
                        name: 'Khách hàng từ MXH',
                        email: email,
                        phone_number: phone_number,
                        emp_id: EMP_ID,
                        group_id: 456,
                        company_id: COM_ID,
                        type: 2,
                        resoure: 1, //nguồn từ fb
                        cus_from: 'facebook',
                        list_post: [{
                            link_user_post: data[i].link_user_post,
                            description: data[i].text || '',
                            created_at: createDate
                        }],
                        description: data[i].text || '', //bài đăng
                        link_user_post: data[i].link_user_post, //link fb người đăng bài
                        created_at: createDate,
                        updated_at: createDate
                    })
                    if (phone_number) {
                        const senderId = 1192 //id người gửi, cty hung ha
                        const message = `Khách hàng với ID CRM: ${maxID}, số điện thoại: ${phone_number} từ Facebook đã được chuyển tới giỏ của bạn\nLink CRM: https://hungha365.com/crm/customer/detail/${maxID}?name=NTD+Social`
                        await SendMess(senderId, CHAT_ID, message)
                    }
                } else {
                    const post = {
                            link_user_post: data[i].link_user_post,
                            description: data[i].text || '',
                            created_at: createDate
                        }
                        //Check xem trong ngày đã đăng tin mới chưa
                    const check_post = check_ntd.list_post.find(post => post.created_at > startTime)
                    if (check_post) {
                        await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                            $push: { list_post: post },
                            $set: {
                                link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                                description: data[i].text || '', //bài đăng
                                link_user_post: data[i].link_user_post, //link fb người đăng bài
                                updated_at: createDate,
                            }
                        })
                    } else {
                        await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                            $push: { list_post: post },
                            $set: {
                                group_id: 455,
                                link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                                description: data[i].text || '', //bài đăng
                                link_user_post: data[i].link_user_post, //link fb người đăng bài
                                updated_at: createDate,
                            }
                        })
                    }
                }
            }
        }
        return functions.success(res, "Thêm thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.addCustomerChoTot = async(req, res) => {
    try {
        const data = req.body.data
        const createDate = functions.getTimeNow();
        // Lấy thời gian hiện tại
        const currentDate = new Date();
        // Đặt giờ, phút, giây và mili giây thành 0
        currentDate.setHours(0, 0, 0, 0);
        // Lấy thời điểm đầu tiên của ngày
        const startTime = Math.floor(currentDate.getTime() / 1000)

        //Lấy ds kd đổ ntd về
        const group = await NhomKH.findOne({ gr_id: 452 })
        const list_emp_id = group.emp_id.replaceAll(' ').split(',')
        let arr_id_KD = []
        for (let i = 0; i < list_emp_id.length; i++) {
            if (list_emp_id[i] !== '') {
                {
                    arr_id_KD.push(Number(list_emp_id[i]))
                }
            }
        }
        let list_temp = [];
        for (let i = 0; i < arr_id_KD.length; i++) {
            let response = await axios({
                method: 'post',
                url: 'https://api.timviec365.vn/api/qlc/shift/list_shift_user_new',
                data: {
                    u_id: arr_id_KD[i],
                    c_id: Number(group.company_id)
                },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response && response.data && response.data.data && response.data.data.shift && response.data.data.shift.length) {
                list_temp.push(arr_id_KD[i]);
            }
        }
        arr_id_KD = list_temp;
        //Lấy kd đã nhận ndt cuối cùng
        const lastKD = await Customer.find({ resoure: 1 }, { emp_id: 1, created_at: 1 }).sort({ created_at: -1 }).limit(1).lean()
            //Lấy vị trí của last KD trong ds KD
        if (lastKD && lastKD.length > 0) {
            index_KD = arr_id_KD.findIndex(item => item == lastKD[0].emp_id)
        }
        for (let i = 0; i < data.length; i++) {
            let phone_number
            if (data[i]['Số điện thoại'] && data[i]['Số điện thoại'] !== '') {
                phone_number = data[i]['Số điện thoại'] ? data[i]['Số điện thoại'].replaceAll(' ', '').replaceAll('.', '') : null
            }
            if (phone_number) {
                //Config data bài đăng
                let description = ''
                if (data[i]['Title'] && data[i]['Title'] !== '') {
                    description = `${description}${data[i]['Title']}\n`
                }
                if (data[i]['Nội dung tuyền dung'] && data[i]['Nội dung tuyền dung'] !== '') {
                    description = `${description}${data[i]['Nội dung tuyền dung']}\n`
                }
                if (data[i]['Địa điểm làm việc'] && data[i]['Địa điểm làm việc'] !== '') {
                    description = `${description}${data[i]['Địa điểm làm việc']}\n`
                }
                if (data[i]['Mức lương'] && data[i]['Mức lương'] !== '') {
                    description = `${description}Mức lương: ${data[i]['Mức lương']}\n`
                }
                if (data[i]['Hình thức trả lương'] && data[i]['Hình thức trả lương'] !== '') {
                    description = `${description}Hình thức trả lương: ${data[i]['Hình thức trả lương']}\n`
                }
                if (data[i]['Loại công việc'] && data[i]['Loại công việc'] !== '') {
                    description = `${description}Loại công việc: ${data[i]['Loại công việc']}\n`
                }
                if (data[i]['Kinh nghiệm'] && data[i]['Kinh nghiệm'] !== '') {
                    description = `${description}Kinh nghiệm: ${data[i]['Kinh nghiệm']}\n`
                }
                if (data[i]['Giới tính'] && data[i]['Giới tính'] !== '') {
                    description = `${description}Giới tính: ${data[i]['Giới tính']}\n`
                }
                if (data[i]['Số lượng tuyển dụng'] && data[i]['Số lượng tuyển dụng'] !== '') {
                    description = `${description}Số lượng tuyển dụng: ${data[i]['Số lượng tuyển dụng']}\n`
                }
                if (data[i]['Học vấn'] && data[i]['Học vấn'] !== '') {
                    description = `${description}Học vấn: ${data[i]['Học vấn']}\n`
                }
                if (data[i]['Chứng chỉ'] && data[i]['Chứng chỉ'] !== '') {
                    description = `${description}Chứng chỉ: ${data[i]['Chứng chỉ']}\n`
                }
                if (data[i]['Tuổi tối thiểu'] && data[i]['Tuổi tối thiểu'] !== '') {
                    description = `${description}Tuổi tối thiểu: ${data[i]['Tuổi tối thiểu']}\n`
                }
                if (data[i]['Tuổi tối đa'] && data[i]['Tuổi tối đa'] !== '') {
                    description = `${description}Tuổi tối đa: ${data[i]['Tuổi tối đa']}\n`
                }
                if (data[i]['Title'] && data[i]['Title'] !== '') {
                    description = `${description}${data[i]['Title']}\n`
                }
                if (data[i]['Title'] && data[i]['Title'] !== '') {
                    description = `${description}${data[i]['Title']}\n`
                }
                //Check ntd này đã thuộc KD nào chưa
                let check_ntd
                if (data[i]['Tên công ty'] && data[i]['Tên công ty'] !== '') {
                    check_ntd = await Customer.findOne({ name: data[i]['Tên công ty'] }, { emp_id: 1, cus_id: 1, created_at: 1, list_post: 1 }).sort({ created_at: -1 })
                } else {
                    check_ntd = await Customer.findOne({ phone_number: phone_number, resoure: 9 }, { emp_id: 1, cus_id: 1, created_at: 1, list_post: 1 }).sort({ created_at: -1 })
                }
                //Chưa có ntd thì thêm mới ntd
                if (!check_ntd) {
                    let maxID = await customerService.getMaxIDCRM(Customer);
                    //Quay vòng trở lại
                    if (index_KD >= arr_id_KD.length - 1) {
                        index_KD = 0
                    } else {
                        index_KD += 1
                    }
                    let createCustomer = await Customer.create({
                            cus_id: maxID + 1,
                            name: data[i]['Tên công ty'],
                            phone_number: phone_number,
                            emp_id: arr_id_KD[index_KD],
                            group_id: 456,
                            company_id: 10013446,
                            type: 2,
                            resoure: 9, //nguồn từ chotot
                            cus_from: 'chợ tốt',
                            description: description, //bài đăng
                            address: data[i]['Địa điểm làm việc'],
                            list_post: [{
                                link_post: data[i]['link_post'], //link bài viết
                                description: description, //bài đăng
                                created_at: createDate
                            }],
                            link_post: data[i]['link_post'], //link bài viết
                            created_at: createDate,
                            updated_at: createDate
                        })
                        //NTD có sdt mới thông báo về chat để gọi điện
                    const senderId = 1192 //id người gửi, cty hung ha
                    const message = `Khách hàng với ID CRM: ${maxID}, số điện thoại: ${phone_number} từ chợ tốt đã được chuyển tới giỏ của bạn\nLink CRM: https://hungha365.com/crm/customer/list?cus_id=${maxID}&group_id=452`
                        // const message = `Khách hàng với ID CRM: ${maxID}, số điện thoại: ${phone_number} từ chợ tốt đã được chuyển tới giỏ của bạn\nLink CRM: https://hungha365.com/crm/customer/detail/${maxID}?name=${data[i]['Tên công ty']}`
                    const user = await User.findOne({ idQLC: arr_id_KD[index_KD], type: 2 }, { _id: 1 })
                    await SendMess(senderId, user._id, message)
                } else { // Có rồi thì lưu thêm bài viết, cập nhật lại nhóm khách hàng
                    const post = {
                            link_post: data[i]['link_post'], //link bài viết
                            description: description,
                            created_at: createDate
                        }
                        //Check xem trong ngày đã đăng tin mới chưa
                    const check_post = check_ntd.list_post.find(post => post.created_at > startTime)
                    if (check_post) {
                        await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                            $push: { list_post: post },
                            $set: {
                                link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                                description: description, //bài đăng
                                link_post: data[i]['link_post'], //link bài viết
                                updated_at: createDate,
                            }
                        })
                    } else {
                        await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                            $push: { list_post: post },
                            $set: {
                                group_id: 455,
                                link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                                description: description, //bài đăng
                                link_post: data[i]['link_post'], //link bài viết
                                updated_at: createDate,
                            }
                        })
                    }
                }

            }
        }

        return functions.success(res, "Thêm thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.addCustomerMXH = async(req, res) => {
    try {
        const data = req.body.data
        const createDate = functions.getTimeNow();

        //Lấy ds kd đổ ntd về
        let index_KD = 0
        const group = await NhomKH.findOne({ gr_id: 452 })
        const list_emp_id = group.emp_id.replaceAll(' ').split(',')
        let arr_id_KD = []
        for (let i = 0; i < list_emp_id.length; i++) {
            if (list_emp_id[i] !== '') {
                {
                    arr_id_KD.push(Number(list_emp_id[i]))
                }
            }
        }
        let list_temp = [];
        for (let i = 0; i < arr_id_KD.length; i++) {
            let response = await axios({
                method: 'post',
                url: 'https://api.timviec365.vn/api/qlc/shift/list_shift_user_new',
                data: {
                    u_id: arr_id_KD[i],
                    c_id: Number(group.company_id)
                },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response && response.data && response.data.data && response.data.data.shift && response.data.data.shift.length) {
                list_temp.push(arr_id_KD[i]);
            }
        }
        arr_id_KD = list_temp;
        //Lấy kd đã nhận ndt cuối cùng
        const lastKD = await Customer.find({ resoure: 4 }, { emp_id: 1, created_at: 1 }).sort({ created_at: -1 }).limit(1).lean()
            //Lấy vị trí của last KD trong ds KD
        if (lastKD && lastKD.length > 0) {
            index_KD = arr_id_KD.findIndex(item => item == lastKD[0].emp_id)
        }
        for (let i = 0; i < data.length; i++) {
            let phone_number
            if (data[i]['Số điện thoại'] && data[i]['Số điện thoại'] !== '') {
                phone_number = data[i]['Số điện thoại'] ? data[i]['Số điện thoại'].replaceAll(' ', '').replaceAll('.', '') : null
            }
            if (phone_number) {
                //Config data bài đăng
                let description = ''
                if (data[i]['Vị trí tuyển dụng'] && data[i]['Vị trí tuyển dụng'] !== '') {
                    description = `${description}${data[i]['Vị trí tuyển dụng']}\n`
                }
                if (data[i]['Mô tả công việc'] && data[i]['Mô tả công việc'] !== '') {
                    description = `${description}${data[i]['Mô tả công việc']}\n`
                }
                if (data[i]['Yêu cầu công việc'] && data[i]['Yêu cầu công việc'] !== '') {
                    description = `${description}${data[i]['Yêu cầu công việc']}\n`
                }
                if (data[i]['Địa điểm làm việc'] && data[i]['Địa điểm làm việc'] !== '') {
                    description = `${description}${data[i]['Địa điểm làm việc']}\n`
                }
                //Check ntd này đã thuộc KD nào chưa
                let check_ntd
                if (data[i]['Tên công ty'] && data[i]['Tên công ty'] !== '') {
                    check_ntd = await Customer.findOne({ name: data[i]['Tên công ty'] }, { emp_id: 1, cus_id: 1, created_at: 1 }).sort({ created_at: -1 })
                } else {
                    check_ntd = await Customer.findOne({ phone_number: phone_number, resoure: 4 }, { emp_id: 1, cus_id: 1, created_at: 1 }).sort({ created_at: -1 })
                }
                //Chưa có ntd thì thêm mới ntd
                if (!check_ntd) {
                    let maxID = await customerService.getMaxIDCRM(Customer);
                    //Quay vòng trở lại
                    if (index_KD >= arr_id_KD.length - 1) {
                        index_KD = 0
                    } else {
                        index_KD += 1
                    }
                    let createCustomer = await Customer.create({
                            cus_id: maxID + 1,
                            name: data[i]['Tên công ty'],
                            phone_number: phone_number,
                            emp_id: arr_id_KD[index_KD],
                            group_id: 456,
                            company_id: 10013446,
                            type: 2,
                            resoure: 4, //nguồn từ chotot
                            cus_from: data[i]['site'],
                            description: description, //bài đăng
                            address: data[i]['Địa điểm làm việc'],
                            list_post: [{
                                link_post: data[i]['link_post'], //link bài viết
                                description: description, //bài đăng
                                created_at: createDate
                            }],
                            link_post: data[i]['link_post'], //link bài viết
                            created_at: createDate,
                            updated_at: createDate
                        })
                        //NTD có sdt mới thông báo về chat để gọi điện
                    const senderId = 1192 //id người gửi, cty hung ha
                    const message = `Khách hàng với ID CRM: ${maxID}, số điện thoại: ${phone_number} từ ${data[i]['site']} đã được chuyển tới giỏ của bạn\nLink CRM: https://hungha365.com/crm/customer/list?cus_id=${maxID}&group_id=452`
                    const user = await User.findOne({ idQLC: arr_id_KD[index_KD], type: 2 }, { _id: 1 })
                    await SendMess(senderId, user._id, message)
                } else { // Có rồi thì lưu thêm bài viết, cập nhật lại nhóm khách hàng
                    const post = {
                        link_post: data[i]['link_post'], //link bài viết
                        description: description,
                        created_at: createDate
                    }
                    await Customer.updateOne({ cus_id: check_ntd.cus_id }, {
                        $push: { list_post: post },
                        $set: {
                            group_id: 455,
                            link: `https://hungha365.com/crm/nha-tuyen-dung/detail/${check_ntd.cus_id}`,
                            description: description, //bài đăng
                            link_post: data[i]['link_post'], //link bài viết
                            updated_at: createDate,
                        }
                    })
                }

            }
        }
        return functions.success(res, "Thêm thành công");
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

// Api thống kê ntd đăng ký mới từ mxh
exports.StatisticalRegisterSocial = async(req, res) => {
    try {
        const user = req.user.data
        const { emp_id, timeStart, timeEnd, cus_from } = req.body

        const condition_match = {}
        condition_match['resoure'] = { $in: [1, 9] }
        if (emp_id) {
            condition_match['emp_id'] = emp_id
        }
        if (cus_from) {
            condition_match['cus_from'] = cus_from
        } else {
            condition_match['cus_from'] = { $ne: 0 }
        }
        if (timeStart && timeEnd) {
            condition_match['created_at'] = { $gt: timeStart, $lt: timeEnd }
        } else {
            // Lấy thời gian hiện tại
            const currentDate = new Date()
                // Đặt giờ, phút, giây và mili giây thành 0
            currentDate.setHours(0, 0, 0, 0)
            let startTime = Math.floor(currentDate.getTime() / 1000)
            condition_match['created_at'] = { $gt: startTime }
        }

        const list_cus = await Customer.aggregate([{
            '$match': condition_match
        }, {
            '$lookup': {
                'from': 'Users',
                'localField': 'emp_id',
                'foreignField': 'idQLC',
                'as': 'user'
            }
        }, {
            '$unwind': {
                'path': '$user'
            }
        }, {
            '$match': {
                'user.type': 2
            }
        }, {
            '$sort': {
                'created_at': -1
            }
        }, {
            '$project': {
                'cus_id': 1,
                'name': 1,
                'email': 1,
                'phone_number': 1,
                'emp_id': 1,
                'emp_name': '$user.userName',
                'cus_from': 1,
                'created_at': {
                    '$dateToString': {
                        'format': '%Y-%m-%d %H:%M',
                        'timezone': '+07:00',
                        'date': {
                            '$toDate': {
                                '$multiply': [
                                    '$created_at', 1000
                                ]
                            }
                        }
                    }
                }
            }
        }])
        return functions.success(res, "get data success", { list_cus });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

// Api thống kê ntd đăng tin từ mxh
exports.StatisticalPostNewSocial = async(req, res) => {
    try {
        console.log("StatisticalPostNewSocial", req.body);
        const user = req.user.data
        const { emp_id, timeStart, timeEnd, cus_from } = req.body

        const condition_match = {}
        let condition_filter = {}
        condition_match['resoure'] = { $in: [1, 9] }
        condition_match['list_post.1'] = { $exists: true }
        if (emp_id) {
            condition_match['emp_id'] = emp_id
        } else {
            condition_match['emp_id'] = { $ne: 0 }
        }
        if (cus_from) {
            condition_match['cus_from'] = cus_from
        }
        if (timeStart && timeEnd) {
            condition_filter = {
                '$and': [
                    { '$gt': ['$$listpost.created_at', timeStart] },
                    { '$lt': ['$$listpost.created_at', timeEnd] }
                ]
            };
            condition_match['created_at'] = { $lt: timeEnd }
        } else {
            // Lấy thời gian hiện tại
            const currentDate = new Date()
                // Đặt giờ, phút, giây và mili giây thành 0
            currentDate.setHours(0, 0, 0, 0)
            let startTime = Math.floor(currentDate.getTime() / 1000)
            condition_filter = { '$gt': ['$$listpost.created_at', startTime] }
        }

        const list_cus = await Customer.aggregate([{
                '$match': condition_match
            },
            {
                '$addFields': {
                    'check_post': {
                        '$filter': {
                            'input': '$list_post',
                            'as': 'listpost',
                            'cond': condition_filter
                        }
                    }
                }
            }, {
                '$match': {
                    'check_post.0': {
                        '$exists': true
                    }
                }
            }, {
                '$addFields': {
                    'last_post': {
                        '$slice': [
                            '$list_post', -1
                        ]
                    }
                }
            }, {
                '$unwind': {
                    'path': '$last_post'
                }
            }, {
                '$lookup': {
                    'from': 'Users',
                    'localField': 'emp_id',
                    'foreignField': 'idQLC',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$match': {
                    'user.type': 2
                }
            }, {
                '$sort': {
                    'last_post.created_at': -1
                }
            }, {
                '$project': {
                    'cus_id': 1,
                    'name': 1,
                    'email': 1,
                    'phone_number': 1,
                    'emp_id': 1,
                    'emp_name': '$user.userName',
                    'cus_from': 1,
                    'created_at': {
                        '$dateToString': {
                            'format': '%Y-%m-%d %H:%M',
                            'timezone': '+07:00',
                            'date': {
                                '$toDate': {
                                    '$multiply': [
                                        '$last_post.created_at', 1000
                                        //'$created_at', 1000
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ])
        return functions.success(res, "get data success", { list_cus });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

//Api lấy ra nguồn khách hàng: mxh, chợ tốt, fb
exports.GetListCusfromMXH = async(req, res) => {
    try {
        const list_cus_from = await Customer.aggregate([{
            '$match': {
                'resoure': {
                    '$in': [
                        1, 4, 9
                    ]
                }
            }
        }, {
            '$group': {
                '_id': '$cus_from'
            }
        }, {
            '$match': {
                '_id': {
                    '$nin': [
                        'ntd_facebook', 'tv365', 'ntd_vieclamtot.com', '', null
                    ]
                }
            }
        }])
        const list = list_cus_from.map(item => item._id)
        return functions.success(res, "get data success", { list });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}