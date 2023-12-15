const Customer = require("../../../models/crm/Customer/customer");
const CustomerStt = require("../../../models/crm/Customer/customer_status");
const functions = require("../../../services/functions");
const customerService = require("../../../services/CRM/CRMservice");
const HistoryEditCustomer = require("../../../models/crm/history/history_edit_customer");
const ShareCustomer = require("../../../models/crm/tbl_share_customer");
const User = require("../../../models/Users");
const City = require("../../../models/City");
const District = require("../../../models/District");
const Ward = require("../../../models/crm/ward");
const NhomKH = require("../../../models/crm/Customer/customer_group");
const AppointmentContentCall = require("../../../models/crm/appointment_content_call");
const ManagerExtension = require('../../../models/crm/manager_extension')
const moment = require('moment');
const axios = require('axios')
const { log } = require("console");
const customer_campaign = require("../../../models/crm/Campaign/customer_campaign");

// hàm hiển thị chi tiết khách hàng
exports.detail = async (req, res) => {
    try {
        let { cus_id } = req.body;
        let com_id = "";
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            com_id = req.user.data.com_id;
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
        if (typeof cus_id === "undefined") {
            return functions.setError(res, "cus_id không được bỏ trống", 400);
        }
        if (typeof cus_id !== "number" && isNaN(Number(cus_id))) {
            return functions.setError(res, "cus_id phải là 1 số", 400);
        }
        let findCus = await Customer.findOne({ cus_id, company_id: com_id });
        if (!findCus) {
            return functions.setError(res, "không tìm thấy bản ghi phù hợp", 400);
        }
        let name_tao = await User.findOne({ idQLC: findCus.user_create_id }).select(
            "userName"
        );
        if (!name_tao) {
            name_tao = "";
        }
        let name_sua = await User.findOne({ idQLC: findCus.user_edit_id }).select(
            "userName"
        );
        if (!name_sua) {
            name_sua = "";
        }
        let name_phu_trach = await User.findOne({ idQLC: findCus.emp_id }).select(
            "userName"
        );
        if (!name_phu_trach) {
            name_phu_trach = "";
        }
        let name_nhom = await NhomKH.findOne({ gr_id: findCus.group_id }).select(
            "gr_name"
        );
        if (!name_nhom) {
            name_nhom = "";
        }
        //stt
        let name_stt = await CustomerStt.findOne({ stt_id: findCus.status }).select(
            "stt_name"
        );
        if (!name_stt) {
            name_nhom = "";
        }

        let thanh_pho = await City.findOne({ _id: findCus.cit_id }).select("name");
        let info_thanh_pho = await City.findOne({ _id: findCus.cit_id }).select(
            "_id"
        );
        if (!thanh_pho) {
            thanh_pho = "";
        }
        let huyen = await District.findOne({ _id: findCus.district_id }).select(
            "name"
        );
        let info_huyen = await District.findOne({
            _id: findCus.district_id,
        }).select("_id");
        if (!huyen) {
            huyen = "";
        }

        let ten_xa = await Ward.findOne({ ward_id: findCus.ward }).select(
            "ward_name"
        );
        let info_ten_xa = await Ward.findOne({ ward_id: findCus.ward }).select(
            "district_id"
        );
        if (!ten_xa) {
            ten_xa = "";
        }
        let hd_thanh_pho = await City.findOne({ _id: findCus.cit_id }).select(
            "name"
        );
        let info_hd_thanh_pho = await City.findOne({ _id: findCus.cit_id }).select(
            "_id"
        );
        if (!hd_thanh_pho) {
            hd_thanh_pho = "";
        }
        let hd_huyen = await District.findOne({ _id: findCus.district_id }).select(
            "name"
        );
        let info_hd_huyen = await District.findOne({
            _id: findCus.district_id,
        }).select("_id");
        if (!hd_huyen) {
            hd_huyen = "";
        }
        let hd_ten_xa = await Ward.findOne({ ward_id: findCus.ward }).select(
            "ward_name"
        );
        let info_hd_ten_xa = await Ward.findOne({ ward_id: findCus.ward }).select(
            "ward_id"
        );
        if (!hd_ten_xa) {
            hd_ten_xa = "";
        }
        if (findCus.type == 2) {
            let data = {
                cus_id: findCus.cus_id, // id khách hàng
                email: {
                    info: findCus.email,
                    detail: findCus.email,
                }, // địa chỉ email khách hàng
                phone_number: {
                    info: findCus.phone_number,
                    detail: findCus.phone_number,
                },
                name: findCus.name, // tên khách hàng
                stand_name: {
                    info: findCus.stand_name,
                    detail: findCus.stand_name,
                },
                logo: findCus.logo, // ảnh đại diện
                birthday: findCus.birthday, // ngày sinh nếu là cá nhân
                tax_code: findCus.tax_code, // mã số thuế
                cit_id: {
                    info: info_thanh_pho,
                    detail: thanh_pho,
                }, //thành phố
                district_id: {
                    info: info_huyen,
                    detail: huyen,
                }, // huyện
                ward: {
                    info: info_ten_xa,
                    detail: ten_xa,
                }, //phường hoặc xã
                address: {
                    info: findCus.address,
                    detail: findCus.address,
                }, // số nhà đường phố
                ship_invoice_address: {
                    info: findCus.ship_invoice_address,
                    detail: findCus.ship_invoice_address,
                }, // địa chỉ đơn hàng
                gender: findCus.gender, // giới tính
                cmnd_ccnd_number: findCus.cmnd_ccnd_number, // số chứng minh thư nhân dân
                cmnd_ccnd_address: findCus.cmnd_ccnd_address, // đia chỉ nơi cấp
                cmnd_ccnd_time: findCus.cmnd_ccnd_time, // thời gian cấp
                resoure: {
                    info: findCus.resoure,
                    detail: findCus.resoure,
                }, // ngưồn khách hàng
                description: {
                    info: findCus.description,
                    detail: findCus.description,
                }, // thông tin mô tả
                introducer: findCus.introducer, // Người giới thiệu
                contact_name: findCus.contact_name,
                contact_email: findCus.contact_email,
                contact_phone: findCus.contact_phone,
                contact_gender: findCus.contact_gender,
                company_id: findCus.company_id,
                emp_id: {
                    info: findCus.emp_id,
                    detail: name_phu_trach,
                },
                user_handing_over_work: findCus.user_handing_over_work, //id người bàn giao
                user_create_id: findCus.user_create_id, //id nhân viên tạo
                user_create_type: findCus.user_create_type, //id người tạo
                user_edit_id: findCus.user_edit_id, //id người sửa
                group_id: {
                    info: findCus.group_id,
                    detail: name_nhom,
                }, // id nhóm khách hàng
                status: {
                    info: findCus.status,
                    detail: name_stt,
                }, // trạng thái khach hàng
                business_areas: {
                    info: findCus.business_areas,
                    detail: findCus.business_areas,
                }, // lĩnh vực
                classify: {
                    info: findCus.classify,
                    detail: findCus.classify,
                }, // loại khách hàng
                business_type: {
                    info: findCus.business_type,
                    detail: findCus.business_type,
                },
                category: {
                    info: findCus.category,
                    detail: findCus.category, //
                },
                bill_city: {
                    info: info_hd_thanh_pho,
                    detail: hd_thanh_pho,
                }, // hóa đơn id thành phố
                bill_district: {
                    info: info_hd_huyen,
                    detail: hd_huyen,
                }, // hóa đơn id huyện
                bill_ward: {
                    info: info_hd_ten_xa,
                    detail: hd_ten_xa,
                }, // hóa đơn id phường xã
                bill_address: {
                    info: findCus.bill_address,
                    detail: findCus.bill_address,
                }, // địa chỉ đơn hàng
                bill_area_code: {
                    info: findCus.bill_area_code,
                    detail: findCus.bill_area_code,
                }, // Mã vùng thông tin viết hóa đơn
                bill_invoice_address: {
                    info: findCus.bill_invoice_address,
                    detail: findCus.bill_invoice_address,
                }, // Địa chỉ giao hàng
                bill_invoice_address_email: findCus.bill_invoice_address_email, // địa chỉ đơn hàng email
                ship_city: hd_thanh_pho, // giao hàng tại thành phố
                ship_area: {
                    info: findCus.ship_area,
                    detail: findCus.ship_area,
                }, // Mã vùng thông tin giao hàng
                bank_id: {
                    info: findCus.bank_id,
                    detail: findCus.bank_id,
                }, // id của ngân hàng
                bank_account: {
                    info: findCus.bank_account,
                    detail: findCus.bank_account,
                }, // tài khoản ngân hàng
                revenue: {
                    info: findCus.revenue,
                    detail: findCus.revenue,
                }, // doanh thu
                size: {
                    info: findCus.size,
                    detail: findCus.size,
                }, //Quy mô nhân sự
                rank: {
                    info: findCus.rank,
                    detail: findCus.rank,
                }, // xếp hạng khách hàng

                website: {
                    info: findCus.website,
                    detail: findCus.website,
                }, // website ngân hàng
                number_of_day_owed: findCus.number_of_day_owed, // số ngày được nợ
                share_all: findCus.share_all,
                type: findCus.type, //Loại công ty
                is_input: findCus.is_input,
                is_delete: findCus.is_delete,
                created_at: findCus.created_at,
                updated_at: findCus.updated_at,
                id_cus_from: findCus.id_cus_from,
                cus_from: findCus.cus_from,
                link: findCus.link,
                user_create_name: name_tao.userName,
                user_edit_name: name_sua.userName,
                giao_hang_huyen: hd_huyen, // giao hàng tại huyện
                giao_hang_xa: hd_ten_xa, // giao hàng tại phường,xã
                website: findCus.website, // website ngân hàng
                han_muc_no: findCus.deb_limit, // hạn mức nợ
                loai_hinh_khach_hang: findCus.type, // loại hình khách hàng
                la_khach_hang_tu: findCus.created_at, // là khách hàng từ ngày
                nguoi_tao: name_tao.userName, // tên nhân viên tạo
                nguoi_sua: name_sua.userName, // tên nhân viên sửa
                ngay_tao: findCus.created_at,
                ngay_sua: findCus.updated_at,
                link_user_post: findCus.link_user_post, //fb người tạo bài đăng
            };
            return res.status(200).json({
                result: true,
                message: "Thông tin khách hàng",
                data: { ...data },
            });
        } else if (findCus.type == 1) {
            let data2 = {
                ma_khach_hang: findCus.cus_id, // id khách hàng
                email: findCus.email, // địa chỉ email khách hàng
                ten_khach_hang: findCus.name, // tên khách hàng
                ten_viet_tat: findCus.stand_name, // tên viết tắt
                dien_thoai: findCus.phone_number, // số điện thoại
                anh_dai_dien: findCus.logo, // ảnh đại diện
                thanh_pho: thanh_pho, //thành phố
                huyen: huyen, // huyện
                phuong_xa: ten_xa, //phường hoặc xã
                so_nha_duong_pho_hd: findCus.address, // số nhà đường phố
                ship_invoice_address: findCus.ship_invoice_address, // địa chỉ đơn hàng
                resoure: findCus.resoure, // ngưồn khách hàng
                thong_tin_mo_ta: findCus.description, // thông tin mô tả
                ma_so_thue: findCus.tax_code, // mã số thuế
                group_id: name_nhom.gr_name, // id nhóm khách hàng
                status: findCus.status, // trạng thái khach hàng
                linh_vuc: findCus.business_areas, // lĩnh vực
                category: findCus.category, //
                nhan_vien_phu_trach: name_phu_trach, // tên nhân viên phụ trách
                loai_hinh: findCus.business_type, // loại hình
                phan_loai_khach_hang: findCus.classify, // loại khách hàng
                hoa_don_tp: hd_thanh_pho, // hóa đơn id thành phố
                hoa_don_huyen: hd_huyen, // hóa đơn id huyện
                hoa_don_xa: hd_ten_xa, // hóa đơn id phường xã
                so_nha_duong_pho_gh: findCus.bill_address, // địa chỉ đơn hàng
                ma_vung_hoa_don: findCus.bill_area_code, // Mã vùng thông tin viết hóa đơn
                bill_invoice_address: findCus.bill_invoice_address, // Địa chỉ giao hàng
                bill_invoice_address_email: findCus.bill_invoice_address_email, // địa chỉ đơn hàng email
                giao_hang_tp: hd_thanh_pho, // giao hàng tại thành phố
                giao_hang_huyen: hd_huyen, // giao hàng tại huyện
                giao_hang_xa: hd_ten_xa, // giao hàng tại phường,xã
                ma_vung_giao_hang: findCus.ship_area, // Mã vùng thông tin giao hàng
                bank_id: findCus.bank_id, // id của ngân hàng
                bank_account: findCus.bank_account, // tài khoản ngân hàng
                rank: findCus.rank, // xếp hạng khách hàng
                website: findCus.website, // website ngân hàng
                so_ngay_duoc_no: findCus.number_of_day_owed, // số ngày được nợ
                quy_mo_nhan_su: findCus.size, // quy mô nhân sự
                han_muc_no: findCus.deb_limit, // hạn mức nợ
                loai_hinh_khach_hang: findCus.type, // loại hình khách hàng
                doanh_thu: findCus.revenue, // doanh thu
                la_khach_hang_tu: findCus.created_at, // là khách hàng từ ngày
                nguoi_tao: name_tao.userName, // tên nhân viên tạo
                nguoi_sua: name_sua.userName, // tên nhân viên sửa
                ngay_tao: findCus.created_at,
                ngay_sua: findCus.updated_at,
            };
            return functions.success(res, "get data success", { data2 });
        } else {
            return functions.setError(res, "không tìm thấy bản ghi phù hợp", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.GetDetailCustomerSocial = async (req, res) => {
    try {
        // const user = req.user.data
        const { cus_id } = req.body
        const cus_detail = await Customer.aggregate([
            {
                '$match': {
                    'cus_id': Number(cus_id)
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
                '$project': {
                    'cus_id': 1,
                    'name': 1,
                    'cus_from': 1,
                    'phone_number': 1,
                    'email': 1,
                    'list_post': {
                        '$slice': ['$list_post', -6]
                    },
                    'emp_id': 1,
                    'emp_name': '$user.userName'
                }
            }, {
                '$sort': {
                    created_at: -1
                }
            }, {
                '$limit': 1
            }
        ])
        return functions.success(res, "get data success", { customer: cus_detail[0] });
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.listCity = async (req, res) => {
    try {
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            let listCity = await City.find({}).select("_id name");
            return functions.success(res, "get data success", { listCity });
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.listDistrict = async (req, res) => {
    try {
        let { _id } = req.body;
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            let listDistrict = await District.find({ parent: _id }).select(
                "_id name"
            );
            if (!listDistrict) {
                listDistrict = [];
            }
            return functions.success(res, "get data success", { listDistrict });
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.listWard = async (req, res) => {
    try {
        let { _id } = req.body;
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            let listWard = await Ward.find({ district_id: _id }).select(
                "ward_id ward_name"
            );
            if (!listWard) {
                listWard = [];
            }
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
// hàm chỉnh sửa khách hàng
exports.editCustomer = async (req, res) => {
    try {
        let {
            cus_id,
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
            type,
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
            created_at,
            cus_from,
            link,
            content,
            content_call,
            text_record
        } = req.body;
        // let logo = req.files.logo;
        let updateDate = functions.getTimeNow();
        let createHtime = functions.getTimeNow();
        let linkDL = "";
        // if (logo) {
        //     const imageValidationResult = await customerService.validateImage(logo);
        //     if (imageValidationResult === true) {
        //         await customerService.uploadFileCRM(cus_id, logo);
        //         linkDL = customerService.createLinkFileCRM(cus_id, logo.name);
        //     }
        // }
        if (typeof cus_id === "undefined") {
            return functions.setError(res, "cus_id không được bỏ trống", 400);
        }
        if (typeof cus_id !== "number" && isNaN(Number(cus_id))) {
            return functions.setError(res, "cus_id phải là 1 số", 400);
        }
        let dataUpdate = { updated_at: updateDate };
        if (group_id) { dataUpdate.group_id = group_id; }
        if (status) { dataUpdate.status = status; }
        if (resoure) { dataUpdate.resoure = resoure; }
        if (description) { dataUpdate.description = description };
        if (text_record) { dataUpdate.text_record = text_record };

        if (content_call) {
            const maxContentCall = await AppointmentContentCall.findOne({}, { id: 1 }).sort({ id: -1 });
            let id = 1;
            if (maxContentCall) {
                id = Number(maxContentCall.id) + 1;
            }
            const item = new AppointmentContentCall({
                id: id,
                id_cus: cus_id,
                content_call: content_call,
                created_at: new Date()
            });
            item.save()
        }

        await Customer.updateOne({ cus_id }, { $set: dataUpdate });
        return functions.success(res, "Customer edited successfully");

    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

//Hàm cập nhật nội dung cuộc gọi
exports.updateContentCall = async (req, res) => {
    try {
        const { phone_number, ext_number, content_call } = req.body

        //Dựa vào ext_number trên dth để lấy ra KD
        const manager_extension = await ManagerExtension.findOne({ company_id: 10013446, ext_number: Number(ext_number) }).sort({ id: -1 })
        if (manager_extension) {
            //Lấy ra cus_id trong bảng Customer
            const customer = await Customer.findOne({ phone_number: phone_number, emp_id: Number(manager_extension.emp_id) }, { cus_id: 1, updated_at: 1 }).sort({ updated_at: -1 })
            if (customer) {
                //Lưu lại nội dung cuộc gọi
                const maxContentCall = await AppointmentContentCall.findOne({}, { id: 1 }).sort({ id: -1 });
                let id = 1;
                if (maxContentCall) {
                    id = Number(maxContentCall.id) + 1;
                }
                const item = new AppointmentContentCall({
                    id: id,
                    id_cus: customer.cus_id,
                    content_call: content_call,
                    created_at: new Date()
                });
                item.save()
            }
        }
        return functions.success(res, "Update Success");
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
}

// hàm hiển thị lịch sử trợ lý kinh doanh (theo id khach hang)
exports.showHisCus = async (req, res) => {
    try {
        let { cus_id } = req.body;
        if (!cus_id) {
            return functions.setError(res, "cus_id không được bỏ trống", 400);
        }
        if (typeof cus_id !== "number" && isNaN(Number(cus_id))) {
            return functions.setError(res, "cus_id phải là 1 số", 400);
        }
        let checkHis = await AppointmentContentCall.find({ id_cus: cus_id })
            .sort({ id: -1 })
            .lean();
        return functions.success(res, "get data success", { checkHis });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

//Ham ban giao cong viec
exports.banGiao = async (req, res) => {
    try {
        let { user_handing_over_work, cus_id, emp_id } = req.body;
        const { type, com_id } = req.user.data;
        if (type === 1) {
            if (emp_id) {
                // Nếu không có cus_id
                if (user_handing_over_work && !cus_id) {
                    const customer = await Customer.find({ emp_id: user_handing_over_work })
                    if (!customer) {
                        return functions.setError(res, "Nhân viên này không phụ trách khách hàng nào");
                    }

                    const result = await Customer.updateMany({ emp_id: user_handing_over_work }, {
                        emp_id: emp_id,
                        user_handing_over_work: user_handing_over_work,
                    });
                    return functions.success(res, "Bàn giao công việc thành công");
                } else if (!user_handing_over_work && !cus_id) {
                    let { keyword, status, resoure, ep_id, time_s, time_e, group_id } = req.body; // Số lượng giá trị hiển thị trên mỗi trang
                    const user = req.user.data;

                    let com_id = user.com_id;
                    let query = {
                        company_id: com_id,
                        is_delete: 0,
                    };

                    if (keyword) {
                        query = {
                            $or: [
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
                    if (ep_id) {
                        query.emp_id = Number(ep_id);
                    }
                    if (group_id) {
                        query.group_id = group_id;
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
                    }

                    let checkUser = await User.findOne({ idQLC: user.idQLC, type: user.type });
                    if (user.type == 2) {
                        // trường hợp là nhân viên
                        let idQLC = user.idQLC;

                        /** Nếu tài khoản đăng nhập thuộc các chức vụ: Nhóm phó, trưởng nhóm,phó tổ trưởng, tổ trưởng,phó ban dự án,trưởng ban dự án
                        Phó trưởng phòng,trường phòng */
                        if ([20, 4, 12, 13, 11.10, 5, 6].includes(checkUser.inForPerson.employee.position_id)) {
                            let dep_id = checkUser.inForPerson.employee.dep_id;
                            let getListEmployeeInDep = await User.find({
                                "inForPerson.employee.dep_id": dep_id,
                                "inForPerson.employee.com_id": com_id,
                            })
                                .select("idQLC")
                                .lean();
                            let ListIdInDepartment = getListEmployeeInDep.map(item => item.idQLC);

                            query = { emp_id: { $in: ListIdInDepartment }, ...query };
                        }
                        /* Nếu tài khoản đăng là các chức vụ: Sinh viên thực tập,nhân viên thử việc,nhân viên part time, nhân viên chính thức */
                        else if ([1, 2, 3, 9].includes(checkUser.inForPerson.employee.position_id)) {
                            query.emp_id = idQLC;
                        }
                    }

                    let showCty = await Customer.find(query)
                        .select("cus_id name phone_number email group_id emp_id user_create_id user_handing_over_work status description resoure updated_at link count_call cus_from birthday company_id user_create_id created_at is_delete type")
                        .sort({ updated_at: -1 })
                        .lean();

                    for (let i = 0; i < showCty.length; i++) {
                        let element = showCty[i];

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

                    }

                    await Promise.all(showCty.map(async (customer) => {
                        await Customer.findOneAndUpdate({ cus_id: customer.cus_id }, {
                            emp_id: emp_id,
                            user_handing_over_work: customer.emp_id,
                        });
                    }));
                    return functions.success(res, "Bàn giao công việc thành công");
                }

                // Có cus_id
                else {
                    const cusIdArr = cus_id.split(",").map(Number);

                    await Promise.all(
                        cusIdArr.map(async (cusId) => {
                            const customer = await Customer.findOne({ cus_id: cusId });
                            if (customer) {
                                await customerService.getDatafindOneAndUpdate(
                                    Customer, { cus_id: cusId }, {
                                    emp_id: emp_id,
                                    user_handing_over_work: customer.emp_id,
                                }
                                );
                            }
                        })
                    );
                    return functions.success(res, "Bàn giao công việc thành công");
                }
            } else {
                return functions.setError(res, "Nhập thiếu thông tin");
            }
        } else {
            return functions.setError(res, "Bạn không có quyền");
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};


//hàm chia sẻ khách hàng
exports.ShareCustomer = async (req, res) => {
    try {
        let { customer_id, role, dep_id, receiver_id } = req.body;

        // Tách các chuỗi thành mảng
        const customerIds = customer_id.split(",").map(Number);
        const receiverIds = receiver_id.split(",").map(Number);
        const depIds = dep_id.split(",").map(Number);

        let NVshare = "";

        const existingShareCustomers = await ShareCustomer.find({
            customer_id: { $in: customerIds },
            $or: [{ dep_id: { $in: depIds } }, { receiver_id: { $in: receiverIds } }],
        });

        if (existingShareCustomers) {
            for (const customerId of customerIds) {
                const shareCustomer = existingShareCustomers.filter((record) => record.customer_id === customerId);
                for (let index = 0; index < shareCustomer.length; index++) {
                    const resultReceiverID = shareCustomer[index].receiver_id.split(",").map(Number).filter(item => !receiver_id.includes(item)).join(",");
                    const resultDepID = shareCustomer[index].dep_id.split(",").map(Number).filter(item => !dep_id.includes(item)).join(",");
                    shareCustomer[index].receiver_id = resultReceiverID || null
                    shareCustomer[index].dep_id = resultDepID || null
                    await shareCustomer[index].save()
                }
            }
        }

        const maxID = await customerService.getMaxIDConnectApi(ShareCustomer);
        const maxId = maxID ? Number(maxID) + 1 : 1;
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            com_id = req.user.data.com_id;
            NVshare = req.user.data.idQLC;

        } else {
            return functions.setError(res, "Không có quyền truy cập", 400);
        }

        const createAt = new Date();
        const updateAt = new Date();

        // Tạo tài liệu riêng lẻ cho từng giá trị
        const createPromises = [];
        for (let i = 0; i < customerIds.length; i++) {
            const createShareCustomer = new ShareCustomer({
                id: maxId + i,
                customer_id: customerIds[i],
                emp_share: NVshare,
                dep_id: dep_id,
                receiver_id: receiver_id,
                role: role,
                created_at: createAt.getTime(),
                updated_at: updateAt.getTime(),
            });

            const savedShareCustomer = createShareCustomer.save();
            createPromises.push(savedShareCustomer);
        }

        const savedShareCustomers = await Promise.all(createPromises);


        if (savedShareCustomers.length > 0) {
            return functions.success(res, "Tạo chia sẻ thành công");
        } else {
            return functions.setError(res, "Lỗi khi tạo chia sẻ", 500);
        }
    } catch (e) {
        console.error(e);
        return functions.setError(res, e.message);
    }
};


//Api hiển thị chọn khách hàng gộp

exports.ChosseCustomer = async (req, res) => {
    try {
        let { arrCus } = req.body;
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            const com_id = req.user.data.com_id;
            if (!arrCus || !Array.isArray(arrCus) || arrCus.length === 0) {
                return functions.setError(res, "Mảng arrCus không được bỏ trống", 400);
            }
            if (!arrCus.every((item) => Number.isInteger(parseInt(item)))) {
                return functions.setError(
                    res,
                    "Tất cả các giá trị trong mảng arrCus phải là số nguyên",
                    400
                );
            }
            const customers = await Customer.find({
                cus_id: { $in: arrCus },
                company_id: com_id,
            });
            return functions.success(res, "get data success", { customers });
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.CombineCustome = async (req, res) => {
    try {
        let {
            target_id,
            arrCus,
            email,
            name,
            logo,
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
            user_edit_id,
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
            comId,
            empId,
        } = req.body;

        if (req.user.data.type == 1 || req.user.type == 2) { } else {
            return functions.setError(res, "Error", 400);
        }
        const type = req.body.type || 2;
        if (![1, 2].includes(type)) {
            return functions.setError(res, "loại khách hàng không hợp lệ", 400);
        }
        let createDate = new Date();
        const validationResult = customerService.validateCustomerInput(name, comId);
        if (validationResult !== true) {
            res.status(400).json({ error: "Invalid customer input" });
            return;
        }

        const convertArrCus = arrCus.split(",").map(Number)
        const recordWithTargetId = await ShareCustomer.find({ customer_id: target_id })
        const arrShareCustomer = await ShareCustomer.find({ $and: [{ customer_id: { $in: convertArrCus } }, { customer_id: { $ne: target_id } }] })

        let dep_ids = [];
        let receiver_ids = []
        if (recordWithTargetId) {
            dep_ids = recordWithTargetId.map(record => record.dep_id)
            receiver_ids = recordWithTargetId.map((record) => record.receiver_id);
        }
        const resultShareCustomerTargetID = {
            dep_ids: dep_ids.filter((item) => item !== undefined && item !== 0).filter((item) => item !== null && item !== ""),
            receiver_ids: receiver_ids.filter((item) => item !== undefined && item !== 0).filter((item) => item !== null && item !== "")
        }

        const depIdsToRemove = resultShareCustomerTargetID.dep_ids;
        const receiverIdsToRemove = resultShareCustomerTargetID.receiver_ids;

        // Cập nhật tất cả bản ghi trong mảng arrShareCustomer
        const bulkOps = arrShareCustomer.map((item) => {
            let updateFields = {};

            // Kiểm tra và cập nhật dep_id nếu cần
            if (item.dep_id) {
                const depIdsArr = item.dep_id.split(',').map((id) => id.trim());
                const updatedDepIds = depIdsArr.filter((id) => !depIdsToRemove.includes(id));
                updateFields.dep_id = updatedDepIds.join(',');
            }

            // Kiểm tra và cập nhật receiver_id nếu cần
            if (item.receiver_id) {
                const receiverIdsArr = item.receiver_id.split(',').map((id) => id.trim());
                const updatedReceiverIds = receiverIdsArr.filter((id) => !receiverIdsToRemove.includes(id));
                updateFields.receiver_id = updatedReceiverIds.join(',');
            }

            updateFields.customer_id = target_id;

            return {
                updateOne: {
                    filter: { customer_id: item.customer_id },
                    update: updateFields,
                },
            };
        });

        await ShareCustomer.bulkWrite(bulkOps);

        await customerService.deleteCustomerByIds(convertArrCus);

        let createCustomer = new Customer({
            cus_id: target_id,
            email: email,
            name: name,
            stand_name: stand_name,
            phone_number: phone_number,
            cit_id: cit_id,
            logo: logo,
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
            user_handing_over_work: user_handing_over_work,
            user_edit_id: user_edit_id,
            user_create_id: empId,
            company_id: comId,
            emp_id: empId,
            ship_city: ship_city,
            ship_area: ship_area,
            bank_id: bank_id,
            size: size,
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
        // Xóa các id khách hàng từ danh sách
        return functions.success(res, "get data success", { saveCS });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};


// Api kiểm tra trùng
exports.CheckCompareMerging = async (req, res) => {
    try {
        const { name_customer, stt_name_customer, choose, phone_customer, stt_phone_customer, tax_code_customer, stt_tax_code_customer, website_customer, stt_website_customer } = req.body
        if (req.user.data.type == 1 || req.user.data.type == 2) {
            const com_id = req.user.data.com_id;
        } else {
            return functions.setError(res, "không có quyền truy cập", 400);
        }

        const functionSTTParams = (stt, valueToCompare, fieldToCompare) => {
            let condition = {};

            if (stt === "0") {
                // So sánh bằng
                condition = {
                    [fieldToCompare]: valueToCompare
                };
            }
            if (stt === "1") {
                // So sánh không bằng
                condition = {
                    [fieldToCompare]: { $ne: valueToCompare }
                };
            }
            if (stt === "2") {
                // Chứa stt
                condition = {
                    [fieldToCompare]: { $regex: stt }
                };
            }
            if (stt === "3") {
                // Không chứa Stt
                condition = {
                    [fieldToCompare]: { $not: { $regex: stt } }
                };
            }

            return condition;
        }

        const functionSTTParamsForNumber = (stt, valueToCompare, fieldToCompare) => {
            let condition = {};

            if (stt === "0") {
                // So sánh bằng
                condition = {
                    [fieldToCompare]: valueToCompare
                };
            }
            if (stt === "1") {
                // So sánh không bằng
                condition = {
                    [fieldToCompare]: { $ne: valueToCompare }
                };
            }
            return condition;
        }

        if (Number(choose) === 1) {
            const result = await Customer.find({
                $and: [
                    stt_name_customer ? functionSTTParams(stt_name_customer, name_customer, "name") : {},
                    stt_phone_customer ? functionSTTParams(stt_phone_customer, phone_customer, "phone_number") : {},
                    stt_tax_code_customer ? functionSTTParamsForNumber(stt_tax_code_customer, Number(tax_code_customer), "tax_code") : {},
                    stt_website_customer ? functionSTTParams(stt_website_customer, website_customer, "website") : {},
                ]
            })
            return functions.success(res, "Get Same Customer Success", result)
        } else {
            const result = await Customer.find({
                $or: [
                    stt_name_customer ? functionSTTParams(stt_name_customer, name_customer, "name") : {},
                    stt_phone_customer ? functionSTTParams(stt_phone_customer, phone_customer, "phone_number") : {},
                    stt_tax_code_customer ? functionSTTParamsForNumber(stt_tax_code_customer, Number(tax_code_customer), "tax_code") : {},
                    stt_website_customer ? functionSTTParams(stt_website_customer, website_customer, "website") : {},
                ]
            })
            return functions.success(res, "Get Same Customer Success", result)
        }
    } catch (err) {
        console.log("Error: " || err)
        return functions.setError(res, err.message);
    }
}

exports.GetListCustomerAnswer = async (req, res) => {
    try {
        const time = req.body.time
        const companyId = Number(req.body.comId)

        if (isNaN(time)) {
            return functions.setError(res, "Thời gian phải là số", 400);
        }
        //Call api lấy ds phone_number đã được gọi
        const response = await axios({
            method: "post",
            url: "https://voip.timviec365.vn/api/GetListCustomerAnswer",
            data: {
                companyId: companyId,
                time
            },
            headers: { "Content-Type": "multipart/form-data" }
        })
        const listPhoneNumber = response.data.data.listPhoneNumber
        const timeDay = `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)}`
        const customers = await Customer.find({ type: 2, phone_number: { $nin: listPhoneNumber }, company_id: companyId, updated_at: { $gt: functions.convertTimestamp(timeDay) } }, {
            _id: 1,
            cus_id: 1,
            email: 1,
            phone_number: 1,
            name: 1,
            address: 1,
            company_id: 1,
            emp_id: 1,
            group_id: 1,
            status: 1,
            id_cus_from: 1,
            cus_from: 1,
            link: 1
        }).lean()
        return functions.success(res, "Lấy danh sách thành công", { customers });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
}

// Them chien dich cho khach hang:
exports.addCampaignForCustomer = async (req, res) => {
    try {
      let { arr_cus_id, arr_campaign_id } = req.body;
      let time = functions.convertTimestamp(Date.now());
      if (req.user.data.type !== 1 && req.user.data.type != 2) {
        return functions.setError(res, "Bạn không có quyền", 403);
      }
      if (
        arr_cus_id &&
        arr_cus_id.length > 0 &&
        arr_cus_id &&
        arr_cus_id.length > 0
      ) {
        for (let i = 0; i < arr_cus_id.length; i++) {
          for (let j = 0; j < arr_campaign_id.length; j++) {
            let new_id = await functions.getMaxIdByField(customer_campaign, "id");
            const checkExit = await customer_campaign.findOne({
              cus_id: arr_cus_id[i],
              campaign_id: arr_campaign_id[j],
              company_id: req.user.data.com_id,
            });
            if (!checkExit) {
              let new_doc = new customer_campaign({
                id: new_id,
                cus_id: arr_cus_id[i],
                campaign_id: arr_campaign_id[j],
                created_at: time,
                status: 1,
                company_id: req.user.data.com_id,
              });
              await new_doc.save();
            }
          }
        }
        return functions.success(res, "Add potential into campaign success!");
      }
      return functions.setError(res, "Missing input value!", 400);
    } catch (error) {
      return functions.setError(res, error.message);
    }
};