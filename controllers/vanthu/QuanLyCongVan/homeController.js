const functions = require('../../../services/functions')
const tbl_qly_congvan = require('../../../models/Vanthu365/tbl_qly_congvan');
const Deparment = require('../../../models/qlc/Deparment');
const tbl_textBook = require('../../../models/Vanthu365/tbl_textBook');
const Users = require('../../../models/Users');
const TextBook = require('../../../models/Vanthu365/tbl_textBook');
const OrganizeDetail = require('../../../models/qlc/OrganizeDetail');

exports.index = async(req, res, next) => {
    try {

        let data = {};
        let comId = req.comId;
        let dem_tong = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 0 }, { cv_id: 1 });
        let dem_den = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 0, cv_type_loai: 1 }, { cv_id: 1 });
        let dem_di = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 0, cv_type_loai: 2 }, { cv_id: 1 });
        let hd_tong = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 1 }, { cv_id: 1 });
        let hd_den = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 1, cv_type_loai: 1 }, { cv_id: 1 });
        let hd_di = await tbl_qly_congvan.countDocuments({ cv_usc_id: comId, cv_type_xoa: 0, cv_type_hd: 1, cv_type_loai: 2 }, { cv_id: 1 });
        let arr_xoa = await tbl_qly_congvan.find({ cv_usc_id: comId, cv_type_xoa: 0 }, { cv_id: 1, cv_name: 1, cv_so: 1, cv_type_loai: 1, cv_type_hd: 1, cv_time_xoa: 1 }).sort({ cv_time_xoa: -1 }).limit(6);
        data.dem_tong = dem_tong;
        data.dem_den = dem_den;
        data.dem_di = dem_di;
        data.hd_tong = hd_tong;
        data.hd_den = hd_den;
        data.hd_di = hd_di;
        data.arr_xoa = arr_xoa;
        return functions.success(res, 'get data success', { data })
    } catch (error) {
        return functions.setError(res, error)
    }
}

exports.supportSelectOption = async(req, res, next) => {
    try {
        let comId = req.comId;
        let data = {};
        let department = await Deparment.find({ companyID: comId }, { _id: 1, deparmentName: 1 })

        let employee = await Users.aggregate([{
                $match: { 'inForPerson.employee.com_id': comId }
            },
            {
                $project: {
                    idQLC: 1,
                    userName: 1,
                    depId: '$inForPerson.employee.dep_id'
                }
            }
        ])
        let book = await tbl_textBook.find({ com_id: comId }, { name_book: 1, year: 1 }).sort({ creat_date: -1 })
        data.department = department;
        data.employee = employee;
        data.book = book;
        return functions.success(res, 'get data successfully', { data })
    } catch (error) {
        console.error(error)
        return functions.setError(res, error)
    }
}

exports.thanhtravb = async(req, res, next) => {
    try {
        let comId = req.comId;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        let skip = (page - 1) * pageSize;
        let limit = pageSize;
        let type_vb = Number(req.body.type_vb);
        let name_vb = req.body.name_vb;
        let date_start = new Date(req.body.date_start).getTime() / 1000;
        let date_end = new Date(req.body.date_end).getTime() / 1000;
        let type_book = Number(req.body.type_book);

        let data = {};
        let conditions = {};
        switch (type_vb) {
            case 1:
                conditions.cv_type_loai = 1;
                conditions.cv_type_hd = 0;
                break;
            case 2:
                conditions.cv_type_loai = 2;
                conditions.cv_type_hd = 0;
                break;
            case 3:
                conditions.cv_type_loai = 1;
                conditions.cv_type_hd = 1;
                break;
            case 4:
                conditions.cv_type_loai = 2;
                conditions.cv_type_hd = 1;
                break;
        }
        if (type_book) conditions.cv_id_book = type_book;
        if (date_start) conditions.cv_date = { $gte: date_start };
        if (date_end) conditions.cv_date = { $lte: date_end };
        if (date_start && date_end) conditions.cv_date = { $gte: date_start, $lte: date_end };
        conditions.cv_usc_id = comId;
        conditions.cv_type_xoa = 0;

        if (name_vb) {
            conditions.cv_name = new RegExp(name_vb, 'i');
        }

        let db_qr = await tbl_qly_congvan.find(conditions).sort({ cv_date: -1 }).skip(skip).limit(limit).lean();
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
                if (db_qr[i].cv_phong_soan) {
                    const organize = await OrganizeDetail.findOne({
                        id: db_qr[i].cv_phong_soan,
                        comId: comId,
                    })
                    if (organize) {
                        noiGui = organize.organizeDetailName;
                    }
                }
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
        console.error(error);
        return functions.setError(res, error)
    }
}