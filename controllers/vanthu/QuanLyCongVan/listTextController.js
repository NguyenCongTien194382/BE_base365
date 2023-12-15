const functions = require('../../../services/functions');
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan');
const vanthu = require('../../../services/vanthu.js');
const tbl_qlcv_edit = require('../../../models/Vanthu365/tbl_qlcv_edit');
const Users = require('../../../models/Users');
const TextBook = require('../../../models/Vanthu365/tbl_textBook');
const OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const folder = 'file_van_ban';
// danh sách văn bản 
exports.getListVanBan = async(req, res, next) => {
    try {
        // khai báo biến
        let key = req.body.key;
        let page = Number(req.body.page);
        let pageSize = Number(req.body.pageSize);
        let book = req.body.book;
        let dayStart = req.body.dayStart;
        let dayEnd = req.body.dayEnd;
        let comId = req.comId;
        let type = Number(req.body.type);
        //tạo phân trang
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        // khai báo điều kiện, đầu ra
        let data = {};
        let conditions = {};
        if (key) {
            conditions = {
                $or: [
                    { cv_name: new RegExp(key, 'i') },
                    { cv_so: { $regex: key } },
                ]
            }
        }
        if (dayStart) conditions.cv_date = { $gte: new Date(dayStart).getTime() / 1000 }
        if (dayEnd) conditions.cv_date = { $lte: new Date(dayEnd).getTime() / 1000 }
        if (dayStart && dayEnd) conditions.cv_date = { $gte: new Date(dayStart).getTime() / 1000, $lte: new Date(dayEnd).getTime() / 1000 }
        if (book) conditions.cv_id_book = book
        conditions.cv_usc_id = comId;
        conditions.cv_type_xoa = 0;
        conditions.cv_type_hd = 0;
        if (type === 1) {
            conditions.cv_type_loai = 1;
        } else if (type === 2) {
            conditions.cv_type_loai = 2;
        }
        let db_qr = await tbl_qly_congvan.find(conditions).sort({ cv_date: -1 }).lean().skip(skip).limit(limit);
        let count = await tbl_qly_congvan.countDocuments(conditions);
        let fullData = [];
        for (let i = 0; i < db_qr.length; i++) {
            let userNhanName;
            let bookName;
            let noiGui;
            if (db_qr[i].cv_user_save.length > 0) {
                const listIDUserNhan = db_qr[i].cv_user_save.split(',').map(Number);
                const listUserNhan = await Users.find({
                    _id: {
                        $in: listIDUserNhan
                    }
                }, { userName: 1 });
                userNhanName = listUserNhan.map(u => u.userName).join(', ');
            }
            if (db_qr[i].cv_id_book) {
                const book = await TextBook.findOne({
                    _id: db_qr[i].cv_id_book
                });
                if (book) {
                    bookName = book.name_book;
                }
            }
            if (db_qr[i].cv_type_soan == 2) {
                noiGui = db_qr[i].cv_soan_ngoai;
            } else {
                // if (db_qr[i].cv_nhan_ngoai) {
                //     const userGui = await Users.findOne({
                //         _id: Number(db_qr[i].cv_nhan_ngoai)
                //     });
                //     if (userGui && userGui.type == 1) {
                //         noiGui = userGui.userName;
                //     } else if (userGui && userGui.type == 2) {
                //         let idComGui = userGui.inForPerson.employee.com_id
                //         const ctyGui = await Users.findOne({
                //             idQLC: idComGui,
                //             type: 1
                //         });
                //         noiGui = ctyGui.userName;
                //     }
                // } else {
                if (db_qr[i].cv_phong_soan) {
                    const organize = await OrganizeDetail.findOne({
                        id: db_qr[i].cv_phong_soan,
                        comId: comId,
                    })
                    if (organize) {
                        noiGui = organize.organizeDetailName;
                    }
                }
                // }
            }
            fullData.push({
                ...db_qr[i],
                userNhanName: userNhanName,
                name_book: bookName,
                noi_gui: noiGui,
            })
        }
        db_qr = fullData;
        data.count = count;
        data.db_qr = db_qr;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
};

// tạo mới văn bản đến
exports.createIncomingText = async(req, res, next) => {
    try {
        let comId = req.comId;
        let name_vbden = req.body.name_vbden;
        let type_vbden = req.body.type_vbden;
        let so_vbden = req.body.so_vbden;
        let type_gui_vbden = Number(req.body.type_gui_vbden);
        let noi_gui_vbden = Number(req.body.noi_gui_vbden);
        let text_gui_vbden = req.body.text_gui_vbden;
        let user_gui_vbden = req.body.user_gui_vbden;
        let text_user_gui_vbden = req.body.text_user_gui_vbden;
        let date_nhan = new Date(req.body.date_nhan);
        let use_nhan_vbden = Number(req.body.use_nhan_vbden);
        let use_luu_vbden = Number(req.body.use_luu_vbden);
        let book_vb = Number(req.body.book_vb);
        let trich_yeu_vbden = req.body.trich_yeu_vbden;
        let ghi_chu_vbden = req.body.ghi_chu_vbden;
        let file = req.files.file;
        let cv_file = '';
        let cv_time_create = new Date();
        if (file && file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                let fileName = await vanthu.uploadfile(folder, file[i], cv_time_create);
                if (fileName) {
                    cv_file += fileName;
                }
            }
        }

        if (!functions.checkNumber(type_gui_vbden) || !functions.checkNumber(noi_gui_vbden) ||
            !functions.checkNumber(use_nhan_vbden) || !functions.checkNumber(use_luu_vbden) ||
            !functions.checkNumber(book_vb)) {
            return functions.setError(res, 'invalid number', 400)
        }

        if (type_vbden.length !== 0) {
            type_vbden = type_vbden.join(" ")
        }

        let _id = await vanthu.getMaxID(tbl_qly_congvan)

        if (name_vbden && so_vbden && type_gui_vbden &&
            date_nhan && use_luu_vbden && use_nhan_vbden && trich_yeu_vbden) {
            await tbl_qly_congvan.create({
                _id,
                cv_name: name_vbden,
                cv_kieu: type_vbden,
                cv_so: so_vbden,
                cv_type_soan: type_gui_vbden,
                cv_soan_ngoai: text_gui_vbden,
                cv_phong_soan: noi_gui_vbden ? noi_gui_vbden : 0,
                cv_user_soan: user_gui_vbden ? user_gui_vbden : 0,
                cv_id_book: book_vb,
                cv_date: date_nhan.getTime() / 1000,
                cv_name_soan: text_user_gui_vbden,
                cv_user_save: use_luu_vbden,
                cv_type_nhan: 1,
                cv_nhan_noibo: use_nhan_vbden,
                cv_file: cv_file,
                cv_trich_yeu: trich_yeu_vbden,
                cv_ghi_chu: ghi_chu_vbden,
                cv_type_loai: 1,
                cv_usc_id: comId,
                cv_time_created: Math.round(cv_time_create.getTime() / 1000)
            })
        } else {
            return functions.setError(res, 'missing data', 400)
        }
        return functions.success(res, 'add successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};

// sửa văn bản đến
exports.updateIncomingText = async(req, res, next) => {
    try {
        let comId = req.comId;
        let name_vbden = req.body.name_vbden;
        let type_vbden = req.body.type_vbden;
        let so_vbden = req.body.so_vbden;
        let type_gui_vbden = Number(req.body.type_gui_vbden);
        let noi_gui_vbden = Number(req.body.noi_gui_vbden);
        let text_gui_vbden = req.body.text_gui_vbden;
        let user_gui_vbden = req.body.user_gui_vbden;
        let text_user_gui_vbden = req.body.text_user_gui_vbden;
        let date_nhan = new Date(req.body.date_nhan);
        let use_nhan_vbden = Number(req.body.use_nhan_vbden);
        let use_luu_vbden = Number(req.body.use_luu_vbden);
        let book_vb = Number(req.body.book_vb);
        let trich_yeu_vbden = req.body.trich_yeu_vbden;
        let ghi_chu_vbden = req.body.ghi_chu_vbden;
        let id = Number(req.body.id);
        let file = req.files.file;
        let useId = req.useId;
        let cv_file = '';
        if (!id) return functions.setError(res, 'Không tìm thấy bản ghi trên hệ thống', 404);
        let check = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId })
        if (!check) {
            return functions.setError(res, 'Không tìm thấy bản ghi trên hệ thống', 404);
        }
        if (file && file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                let fileName = await vanthu.uploadfile(folder, file[i], new Date(check.cv_time_created * 1000));
                if (fileName) {
                    cv_file += fileName;
                }
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, { cv_file })
        }
        if (!functions.checkNumber(type_gui_vbden)) {
            functions.setError(res, 'không được để trống trường loại văn bản đến', 400)
        }
        if (!functions.checkNumber(noi_gui_vbden)) {
            functions.setError(res, 'không được để trống trường nơi gửi văn bản', 400)
        }
        if (!functions.checkNumber(use_nhan_vbden)) {
            functions.setError(res, 'không được để trống trường người nhận văn bản', 400)
        }
        if (!functions.checkNumber(use_luu_vbden)) {
            functions.setError(res, 'không được để trống trường người lưu văn bản', 400)
        }
        if (!functions.checkNumber(book_vb)) {
            functions.setError(res, 'không được để trống trường sổ văn bản', 400)
        }
        if (type_vbden && type_vbden.length !== 0) {
            type_vbden = type_vbden.join(" ")
        }
        let cv_time_update = new Date().getTime() / 1000;
        let type_edit = 0;
        let noi_dung = '';
        if (await functions.checkDate(date_nhan) === false) {
            return functions.setError(res, 'Thời gian nhận không hợp lệ', 400)
        }
        if (name_vbden && so_vbden && type_gui_vbden && text_gui_vbden &&
            date_nhan && text_user_gui_vbden && use_luu_vbden && use_nhan_vbden && trich_yeu_vbden) {
            if (name_vbden != check.cv_name) noi_dung += 'Tên văn bản,'
            if (type_vbden != check.cv_kieu) noi_dung += 'Kiểu văn bản,'
            if (so_vbden != check.cv_so) noi_dung += 'Số văn bản,'
            if (type_gui_vbden != check.cv_type_soan) noi_dung += 'Chọn nơi gửi,'
            if (noi_gui_vbden != check.cv_phong_soan) noi_dung += 'Nơi gửi nội bộ,'
            if (text_gui_vbden != check.cv_soan_ngoai) noi_dung += 'Nơi gửi ngoài,'
            if (user_gui_vbden != check.cv_user_soan) noi_dung += 'Người gửi nội bộ,'
            if (text_user_gui_vbden != check.cv_name_soan) noi_dung += 'Người gửi ngoài,'
            if (date_nhan.getTime() / 1000 != check.cv_date) noi_dung += 'Ngày nhận,'
            if (use_nhan_vbden != check.cv_nhan_noibo) noi_dung += 'Nơi nhận văn bản,'
            if (use_luu_vbden != check.cv_user_save) noi_dung += 'Người lưu trữ,'
            if (trich_yeu_vbden != check.cv_trich_yeu) noi_dung += 'Trích yếu,'
            if (ghi_chu_vbden != check.cv_ghi_chu) noi_dung += 'Ghi chú,'
            if (book_vb != check.cv_id_book) noi_dung += 'Sổ văn bản,'
            if (file && file.file) noi_dung += 'File đính kèm,'
            let users = 0;
            if (noi_dung !== '') {
                type_edit = 1;
                let _id = await vanthu.getMaxId(tbl_qlcv_edit)
                await tbl_qlcv_edit.create({
                    _id,
                    ed_cv_id: id,
                    ed_time: cv_time_update,
                    ed_type_user: req.user.data.type,
                    ed_user: req.user.data._id,
                    ed_nd: noi_dung,
                    ed_usc_id: comId,
                })
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_name: name_vbden,
                cv_kieu: type_vbden,
                cv_so: so_vbden,
                cv_type_soan: type_gui_vbden,
                cv_soan_ngoai: text_gui_vbden,
                cv_phong_soan: noi_gui_vbden,
                cv_user_soan: user_gui_vbden,
                cv_id_book: book_vb,
                cv_date: date_nhan.getTime() / 1000,
                cv_name_soan: text_user_gui_vbden,
                cv_user_save: use_luu_vbden,
                cv_type_nhan: 1,
                cv_nhan_noibo: use_nhan_vbden,
                cv_trich_yeu: trich_yeu_vbden,
                cv_ghi_chu: ghi_chu_vbden,
                cv_usc_id: comId,
                cv_type_edit: type_edit,
                cv_time_edit: cv_time_update,
            })

        } else {
            return functions.setError(res, 'Thiếu trường', 400)
        }

        return functions.success(res, 'update successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};

//chức năng xoá, khôi phục văn bản, active hợp đồng
exports.synthesisFunction = async(req, res, next) => {
    try {
        let id = Number(req.body.id);
        let action = req.body.action;
        let comId = Number(req.comId);
        let useId = Number(req.useId);
        let listId = req.body.listId;
        // Chức năng xoá  
        if (action === 'delete') {
            if (!id || !action) {
                return functions.setError(res, 'missing data input', 400)
            }
            let checkExists = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId, cv_type_xoa: 0 });
            if (!checkExists) return functions.setError(res, 'not found', 404)

            let type_user_xoa = 0;
            let user_xoa = 0;
            if (useId == 0) {
                type_user_xoa = 1;
                user_xoa = comId;
            } else {
                type_user_xoa = 2;
                user_xoa = useId;
            }
            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_type_kp: 0,
                cv_type_xoa: 1,
                cv_type_user_xoa: type_user_xoa,
                cv_user_xoa: req.user.data._id,
                cv_time_xoa: new Date().getTime() / 1000,
            })
            return functions.success(res, 'delete success')
        } else if (action === 'activeContract') {
            if (!id || !action) {
                return functions.setError(res, 'missing data input', 400)
            }
            let checkExists = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId });
            if (!checkExists) return functions.setError(res, 'not found', 404)
            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_status_hd: 2
            })
            return functions.success(res, 'active contract success')
        } else if (action === 'recovery') {
            if (!listId || listId.length === 0) {
                return functions.setError(res, 'missing data', 400)
            }
            let type_user_kp = 0;
            let user_kp = 0;
            if (useId == 0) {
                type_user_kp = 1;
                user_kp = comId;
            } else {
                type_user_kp = 2;
                user_kp = useId;
            }
            for (let i = 0; i < listId.length; i++) {
                let check = await tbl_qly_congvan.findOne({ _id: listId[i], cv_usc_id: comId });

                if (!check) return functions.setError(res, 'Không tìm thấy văn bản', 400)
                await tbl_qly_congvan.findByIdAndUpdate(listId[i], {
                    cv_type_xoa: 0,
                    cv_type_kp: 1,
                    cv_type_user_kp: type_user_kp,
                    cv_user_kp: req.user.data._id,
                    cv_time_kp: new Date().getTime() / 1000,
                })
            }
            return functions.success(res, 'recovery success')
        } else if (action === 'deleteAll') {
            if (!listId || listId.length === 0) {
                return functions.setError(res, 'missing data', 400)
            }
            for (let i = 0; i < listId.length; i++) {
                let check = await tbl_qly_congvan.findOne({ _id: listId[i] });
                if (!check) return functions.setError(res, 'Không tìm thấy văn bản', 400)
                await tbl_qly_congvan.findByIdAndDelete(listId[i])
                await tbl_qlcv_edit.deleteMany({ ed_cv_id: listId[i] })
            }
            return functions.success(res, 'recovery success')
        }
        return functions.setError(res, 'Hãy nhập hành động', 400)
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
};

// xem chi tiết (chung)
exports.getDetail = async(req, res, next) => {
    try {
        let data;
        let id = Number(req.body.id);
        let comId = Number(req.comId);
        if (!id) {
            return functions.setError(res, 'missing data input', 400)
        }
        data = await tbl_qly_congvan.findOne({ _id: id, cv_usc_id: comId, cv_type_xoa: 0 }).lean();
        if (data.cv_file && data.cv_file !== "") {
            data.cv_file = vanthu.getLinkFile('file_van_ban', data.cv_time_create, data.cv_file)
        }
        if (data.cv_user_save.length > 0) {
            const listIDUserSave = data.cv_user_save.split(',').map(Number);
            const listUserSave = await Users.find({
                _id: {
                    $in: listIDUserSave
                }
            }, { userName: 1, idQLC: 1 });
            data.userSave = listUserSave
        }
        if (data.cv_user_ky) {
            const listIDUserKy = data.cv_user_ky.split(',').map(Number);
            const listUserKy = await Users.find({
                _id: {
                    $in: listIDUserKy
                }
            }, { userName: 1, idQLC: 1 });
            data.userKy = listUserKy
        }
        if (data.cv_id_book) {
            const book = await TextBook.findOne({
                _id: data.cv_id_book
            });
            if (book) {
                data.bookName = book.name_book;
            }
        }
        if (data.cv_type_soan == 2) {
            data.noiGui = data.cv_soan_ngoai;
            data.userSoan = {
                userName: data.cv_name_soan
            };
        } else {
            if (data.cv_user_soan) {
                const userSoan = await Users.findOne({
                    _id: data.cv_user_soan
                }, { userName: 1, idQLC: 1 })
                data.userSoan = userSoan
            }
            // if (data.cv_nhan_ngoai) {
            //     const userGui = await Users.findOne({
            //         _id: Number(data.cv_nhan_ngoai)
            //     });
            //     if (userGui && userGui.type == 1) {
            //         data.noiGui = userGui.userName;
            //     } else if (userGui && userGui.type == 2) {
            //         let idComGui = userGui.inForPerson.employee.com_id
            //         const ctyGui = await Users.findOne({
            //             idQLC: idComGui,
            //             type: 1
            //         });
            //         data.noiGui = ctyGui.userName;
            //     }
            // } else {
            if (data.cv_phong_soan) {
                const organize = await OrganizeDetail.findOne({
                    id: data.cv_phong_soan,
                    comId: comId,
                })
                if (organize) {
                    data.noiGui = organize.organizeDetailName;
                }
            }
            // }
        }
        if (data.cv_nhan_noibo) {
            const organize = await OrganizeDetail.findOne({
                id: data.cv_nhan_noibo,
                comId: comId,
            })
            if (organize) {
                data.noi_nhan = organize.organizeDetailName;
            }
        }
        if (data.cv_chuyen_noibo) {
            const userChuyen = await Users.findOne({
                _id: Number(data.cv_chuyen_noibo)
            }, { userName: 1, idQLC: 1 });
            if (userChuyen) {
                data.user_chuyen = userChuyen.userName
            }
        }
        return functions.success(res, 'get success', { data })
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
};

// tạo mới văn bản đi
exports.createSendText = async(req, res, next) => {
    try {
        let comId = req.comId;
        let name_vbdi = req.body.name_vbdi;
        let type_loai_vb = req.body.type_loai_vb;
        let so_vbdi = req.body.so_vbdi;
        let dvst_vbdi = Number(req.body.dvst_vbdi);
        let nst_vbdi = Number(req.body.nst_vbdi);
        let date_guidi = req.body.date_guidi;
        let use_luu_vbdi = Number(req.body.use_luu_vbdi);
        let use_ky_vbdi = Number(req.body.use_ky_vbdi);
        let nhanvb_dep = req.body.nhanvb_dep;
        let nhan_noibo_vb_di = Number(req.body.nhan_noibo_vb_di);
        let nhan_ngoai_dep_vbdi = req.body.nhan_ngoai_dep_vbdi;
        let nhanvb_use = req.body.nhanvb_use;
        let nhan_use_vbdi = Number(req.body.nhan_use_vbdi);
        let nhan_ngoai_user_vbdi = req.body.nhan_ngoai_user_vbdi;
        let trich_yeu_vbdi = req.body.trich_yeu_vbdi;
        let ghi_chu_vbdi = req.body.ghi_chu_vbdi;
        let book_vb = Number(req.body.book_vb);
        let file = req.files.file;
        let cv_time_created = new Date();
        if (type_loai_vb && type_loai_vb.length !== 0) {
            type_loai_vb = type_loai_vb.join(" ")
        }
        if (nhanvb_dep && nhanvb_dep.length !== 0) {
            nhanvb_dep = nhanvb_dep.join(" ")
        }
        if (nhanvb_use && nhanvb_use.length !== 0) {
            nhanvb_use = nhanvb_use.join(" ")
        }
        let cv_file = '';
        if (name_vbdi && so_vbdi && date_guidi && use_luu_vbdi && use_ky_vbdi && trich_yeu_vbdi) {
            if (await !functions.checkNumber(dvst_vbdi) || await !functions.checkNumber(nst_vbdi) ||
                await !functions.checkNumber(use_luu_vbdi) || await !functions.checkNumber(use_ky_vbdi) ||
                await !functions.checkNumber(book_vb)) {
                return functions.setError(res, 'invalid number', 400)
            }
            if (file && file.length > 0) {
                for (let i = 0; i < file.length; i++) {
                    let fileName = await vanthu.uploadfile(folder, file[i], cv_time_created);
                    if (fileName) {
                        cv_file += fileName;
                    }
                }
            }
            let _id = await vanthu.getMaxID(tbl_qly_congvan)
            await tbl_qly_congvan.create({
                _id,
                cv_name: name_vbdi,
                cv_kieu: type_loai_vb,
                cv_so: so_vbdi,
                cv_type_soan: 1,
                cv_phong_soan: dvst_vbdi,
                cv_user_soan: nst_vbdi,
                cv_id_book: book_vb,
                cv_file: cv_file,
                cv_date: new Date(date_guidi).getTime() / 1000,
                cv_user_save: use_luu_vbdi,
                cv_user_ky: use_ky_vbdi,
                cv_type_nhan: nhanvb_dep,
                cv_nhan_noibo: nhan_noibo_vb_di,
                cv_nhan_ngoai: nhan_ngoai_dep_vbdi,
                cv_type_chuyenden: nhanvb_use,
                cv_chuyen_noibo: nhan_use_vbdi,
                cv_chuyen_ngoai: nhan_ngoai_user_vbdi,
                cv_trich_yeu: trich_yeu_vbdi,
                cv_ghi_chu: ghi_chu_vbdi,
                cv_type_loai: 2,
                cv_usc_id: comId,
                cv_time_created: Math.round(cv_time_created.getTime() / 1000)
            })
        } else {
            return functions.setError(res, 'missing data', 400)
        }
        return functions.success(res, 'add successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};

// sửa văn bản đi
exports.updateSendText = async(req, res, next) => {
    try {
        let comId = req.comId;
        let name_vbdi = req.body.name_vbdi;
        let type_loai_vb = req.body.type_loai_vb;
        let so_vbdi = req.body.so_vbdi;
        let dvst_vbdi = Number(req.body.dvst_vbdi);
        let nst_vbdi = Number(req.body.nst_vbdi);
        let date_guidi = new Date(req.body.date_guidi);
        let use_luu_vbdi = Number(req.body.use_luu_vbdi);
        let use_ky_vbdi = Number(req.body.use_ky_vbdi);
        let nhanvb_dep = req.body.nhanvb_dep;
        let nhan_noibo_vb_di = Number(req.body.nhan_noibo_vb_di);
        let nhan_ngoai_dep_vbdi = req.body.nhan_ngoai_dep_vbdi;
        let nhanvb_use = req.body.nhanvb_use;
        let nhan_use_vbdi = Number(req.body.nhan_use_vbdi);
        let nhan_ngoai_user_vbdi = req.body.nhan_ngoai_user_vbdi;
        let trich_yeu_vbdi = req.body.trich_yeu_vbdi;
        let ghi_chu_vbdi = req.body.ghi_chu_vbdi;
        let book_vb = Number(req.body.book_vb);
        let file = req.files.file;
        let id = Number(req.body.id);
        let useId = req.useId;
        let noidung = '';
        let type_edit = 0;
        let cv_time_update = new Date().getTime() / 1000;
        if (!id) return functions.setError(res, 'missing id', 400)
        if (type_loai_vb && type_loai_vb.length !== 0) {
            type_loai_vb = type_loai_vb.join(" ")
        }
        if (nhanvb_dep && nhanvb_dep.length !== 0) {
            nhanvb_dep = nhanvb_dep.join(" ")
        }
        if (nhanvb_use && nhanvb_use.length !== 0) {
            nhanvb_use = nhanvb_use.join(" ")
        }
        let cv_file = '';
        if (name_vbdi && so_vbdi && date_guidi && use_luu_vbdi && use_ky_vbdi && trich_yeu_vbdi) {
            if (!functions.checkNumber(dvst_vbdi)) {
                return functions.setError(res, 'không được để trống trường nơi soạn thảo', 400)
            }
            if (!functions.checkNumber(nst_vbdi)) {
                return functions.setError(res, 'không được để trống trường người soạn thảo', 400)
            }
            if (!functions.checkNumber(use_luu_vbdi)) {
                return functions.setError(res, 'không được để trống trường người lưu văn bản', 400)
            }
            if (!functions.checkNumber(use_ky_vbdi)) {
                return functions.setError(res, 'không được để trống trường người ký', 400)
            }
            if (!functions.checkNumber(book_vb)) {
                return functions.setError(res, 'không được để trống trường sổ văn bản', 400)
            }
            if (functions.checkDate(date_guidi) === false) {
                return functions.setError(res, 'Thời gian nhận không hợp lệ', 400)
            }
            let check = await tbl_qly_congvan.findById(id);
            if (!check) return functions.setError(res, 'Không tìm thấy bản ghi trên hệ thống', 404)
            if (file && file.length > 0) {
                for (let i = 0; i < file.length; i++) {

                    let fileName = await vanthu.uploadfile(folder, file[i], new Date(check.cv_time_created * 1000));
                    if (fileName) {
                        cv_file += fileName;
                    }
                }
                await tbl_qly_congvan.findByIdAndUpdate(id, { cv_file })
            }
            if (name_vbdi != check.cv_name) noidung += 'Tên văn bản,';
            if (type_loai_vb != check.cv_kieu) noidung += 'Kiểu văn bản,';
            if (so_vbdi != check.cv_so) noidung += 'Số văn bản,';
            if (dvst_vbdi != check.cv_phong_soan) noidung += 'Đơn vị soạn thảo,';
            if (nst_vbdi != check.cv_user_soan) noidung += 'Người soạn thảo,';
            if (date_guidi.getTime() / 1000 != check.cv_date) noidung += 'Ngày gửi,';
            if (use_luu_vbdi != check.cv_user_save) noidung += 'Người lưu trữ,';
            if (use_ky_vbdi != check.cv_user_ky) noidung += 'Người ký,';
            if (nhanvb_dep != check.cv_type_nhan) noidung += 'Loại nơi nhận,';
            if (nhan_noibo_vb_di != check.cv_nhan_noibo) noidung += 'Nơi nhận nội bộ,';
            if (nhan_ngoai_dep_vbdi != check.cv_nhan_ngoai) noidung += 'Nơi nhận ngoài,';
            if (nhanvb_use != check.cv_type_chuyenden) noidung += 'Loại chuyển đến,';
            if (nhan_use_vbdi != check.cv_chuyen_noibo) noidung += 'Chuyển đến nội bộ,';
            if (nhan_ngoai_user_vbdi != check.cv_chuyen_ngoai) noidung += 'Chuyển đến ngoài,';
            if (trich_yeu_vbdi != check.cv_trich_yeu) noidung += 'Trích yếu,';
            if (ghi_chu_vbdi != check.cv_ghi_chu) noidung += 'Ghi chú,';
            if (book_vb != check.cv_id_book) noidung += 'Sổ văn bản,';
            if (file && file.file) noidung += 'File đính kèm,'
            let users = 0;
            if (noidung !== '') {
                type_edit = 1;
                let _id = await vanthu.getMaxId(tbl_qlcv_edit)
                await tbl_qlcv_edit.create({
                    _id,
                    ed_cv_id: id,
                    ed_time: cv_time_update,
                    ed_type_user: req.user.data.type,
                    ed_user: req.user.data._id,
                    ed_nd: noidung,
                    ed_usc_id: comId
                })
            }

            await tbl_qly_congvan.findByIdAndUpdate(id, {
                cv_name: name_vbdi,
                cv_kieu: type_loai_vb,
                cv_so: so_vbdi,
                cv_type_soan: 1,
                cv_phong_soan: dvst_vbdi,
                cv_user_soan: nst_vbdi,
                cv_id_book: book_vb,
                cv_date: date_guidi.getTime() / 1000,
                cv_user_save: use_luu_vbdi,
                cv_user_ky: use_ky_vbdi,
                cv_type_nhan: nhanvb_dep,
                cv_nhan_noibo: nhan_noibo_vb_di,
                cv_nhan_ngoai: nhan_ngoai_dep_vbdi,
                cv_type_chuyenden: nhanvb_use,
                cv_chuyen_noibo: nhan_use_vbdi,
                cv_chuyen_ngoai: nhan_ngoai_user_vbdi,
                cv_trich_yeu: trich_yeu_vbdi,
                cv_ghi_chu: ghi_chu_vbdi,
                cv_type_edit: type_edit,
                cv_time_edit: cv_time_update
            })
        } else {
            return functions.setError(res, 'Thiếu trường', 400)
        }
        return functions.success(res, 'update successfully')
    } catch (err) {
        console.error(err)
        return functions.setError(res, err)
    }
};