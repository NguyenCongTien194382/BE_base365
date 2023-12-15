const Users = require('../../../models/Users');
const VanBans = require('../../../models/Vanthu365/van_ban');
const functions = require("../../../services/functions");
const vanThuService = require("../../../services/vanthu");
const ThayThe = require("../../../models/Vanthu365/tbl_thay_the");
const ThongBao = require("../../../models/Vanthu365/tl_thong_bao");
const UserVT = require("../../../models/Vanthu365/user_model");
const NhomVanBan = require('../../../models/Vanthu/group_van_ban');
const QuanLyCongVan = require('../../../models/Vanthu365/tbl_qly_congvan');
const FeedBack = require('../../../models/Vanthu365/tbl_feedback');
const history_duyet_vb = require('../../../models/Vanthu365/history_duyet_vb');

const folder = 'file_van_ban';
//----------------------------------------VAN BAN DI---------------------------------------------------

let checkBanHanh = async(type, comId, empId, type_ban_hanh) => {
    try {
        let banHanh = false;
        if (type == 1) banHanh = true;
        else {
            let user_model = await UserVT.findOne({ id_user: comId });
            if (!user_model) return false;
            let data_banhanh;
            if (type_ban_hanh == 1) {
                data_banhanh = user_model.type_cong_ty;
            } else if (type_ban_hanh == 2) {
                data_banhanh = user_model.type_ngoai;
            }
            if (data_banhanh.includes(empId)) banHanh = true;
        }
        return banHanh;
    } catch (err) {
        console.log(err);
    }
}

exports.getDataAndCheck = async(req, res, next) => {
    try {
        let {
            ten_vanban,
            so_vanban,
            trich_yeu,
            noidung_vanban,
            nam_vb,
            ten_so_vanban,
            nhom_van_ban,
            thoi_gian_ban_hanh,
            nguoi_theo_doi,
            ghi_chu,
            xet_duyet_van_ban,
            loai_xet_duyet,
            thoi_gian_duyet,
            data_nguoi_duyet,
            type_thay_the,
            type_khan_cap,
            type_bao_mat,
            type_tai,
            type_duyet_chuyen_tiep,
            type_nhan_chuyen_tiep
        } = req.body;
        let fieldsCheck = [ten_vanban, so_vanban, trich_yeu, nam_vb, ten_so_vanban, xet_duyet_van_ban, nhom_van_ban, thoi_gian_ban_hanh];
        for (let i = 0; i < fieldsCheck.length; i++) {
            if (!fieldsCheck[i]) {
                return functions.setError(res, `Missing input ${i+1}!`, 404);
            }
        }

        thoi_gian_ban_hanh = vanThuService.convertTimestamp(thoi_gian_ban_hanh * 1000);
        created_date = vanThuService.convertTimestamp(Date.now());
        let type_xet_duyet = '';
        let nguoi_xet_duyet = '';
        let type_duyet = 1;
        let trang_thai_vb = 6;

        if (xet_duyet_van_ban == 2) {
            if (!loai_xet_duyet || !thoi_gian_duyet || !data_nguoi_duyet) {
                return functions.setError(res, "Missing input xet duyet van ban!", 406);
            }
            thoi_gian_duyet = thoi_gian_duyet;
            type_xet_duyet = loai_xet_duyet;
            nguoi_xet_duyet = data_nguoi_duyet.join(", ");
            type_duyet = 0;
            trang_thai_vb = 0;
        } else {
            thoi_gian_duyet = '';
        }


        let file = req.files.file_vb;
        let file_vb_name = '';
        let NameFile = '';
        let InfoFile = '';
        let date = new Date(Date.now());
        const y = date.getFullYear();
        const m = ('0' + (date.getMonth() + 1)).slice(-2);
        const d = ('0' + date.getDate()).slice(-2);
        if (file) {
            for (let i = 0; i < file.length; i++) {
                let fileNameOrigin = file[i].name;

                let fileName = await vanThuService.uploadFileNameRandom(folder, file[i]);
                if (fileName) {
                    file_vb_name += fileName;
                }

                const filePath = `https://vanthu.timviec365.vn/uploads/file_van_ban/${y}/${m}/${d}/${fileName}`;
                if (NameFile == '') {
                    NameFile += `'${file[i].originalFilename.replace(/,/g, '')}'`;
                    InfoFile += `'${filePath.replace(/,/g, '')}'`;
                } else {
                    NameFile += `,'${file[i].originalFilename.replace(/,/g, '')}'`;
                    InfoFile += `,'${filePath.replace(/,/g, '')}'`;
                }
            }
        }
        req.NameFile = NameFile;
        req.InfoFile = InfoFile;
        let id = req.user.data.idQLC;
        let comId = req.user.data.com_id;
        let userName = req.user.data.userName;
        req.fields = {
            title_vb: ten_vanban,
            so_vb: so_vanban,
            des_vb: trich_yeu,
            nd_vb: noidung_vanban, //but phe
            book_vb: nam_vb,
            time_ban_hanh: thoi_gian_ban_hanh,
            time_hieu_luc: thoi_gian_ban_hanh,
            nhom_vb: nhom_van_ban,
            user_send: id,
            com_user: comId,
            name_user_send: userName,
            file_vb: file_vb_name,
            type_xet_duyet: type_xet_duyet,
            thoi_gian_duyet: thoi_gian_duyet,
            nguoi_xet_duyet: nguoi_xet_duyet,
            nguoi_theo_doi: nguoi_theo_doi,
            type_thay_the: type_thay_the,
            type_khan_cap: type_khan_cap,
            type_bao_mat: type_bao_mat,
            type_tai: type_tai,
            type_duyet_chuyen_tiep: type_duyet_chuyen_tiep,
            type_nhan_chuyen_tiep: type_nhan_chuyen_tiep,
            created_date: created_date,
            type_duyet: type_duyet,
            trang_thai_vb: trang_thai_vb,
            duyet_vb: xet_duyet_van_ban,
            ghi_chu: ghi_chu,
            so_van_ban: ten_so_vanban,
        }
        return next();
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

exports.createVanBanOut = async(req, res, next) => {
    try {
        //user_send,com_user,name_user_send => lay tu token

        //user_cty, mail_cty, name_com, user_nhan, gui_ngoai_cty => cac truong thay doi so voi van ban trong cong ty
        let fields = req.fields;
        let _id = req.user.data._id;
        let id = req.user.data.idQLC;
        let com_id = req.user.data.com_id;
        let type = req.user.data.type;
        let { id_cong_ty, mail_congty, id_user_nhan, tk_mail_nhan, noidung_guimail, type_usn, name_cty_nhan, email_add_them } = req.body;

        if (!id_cong_ty || !mail_congty || !name_cty_nhan) {
            return functions.setError(res, "Missing input value!", 407);
        }
        if (!id_user_nhan) {
            return functions.setError(res, "Vui lòng chọn tài khoản người nhận!", 408);
        }
        if (fields.duyet_vb != 2) {
            if (!await checkBanHanh(type, com_id, id, 2)) {
                return res.status(200).json({ message: 'Tài khoản chưa được phân quyền để ban hành ra ngoài công ty' })
            }
        }
        const id_uv_nhan_tb = id_user_nhan;
        if (email_add_them) {
            const user_add_them = await Users.find({
                email: email_add_them
            })
            for (let i = 0; i < user_add_them.length; i++) {
                id_user_nhan.push(user_add_them[i]._id);
            }
        }
        id_user_nhan = id_user_nhan.join(", ");
        let phieu_trinh = req.files.phieu_trinh;
        let fileName = '';
        if (phieu_trinh) {
            fileName = await vanThuService.uploadFileNameRandom('file_van_ban', phieu_trinh);
        }
        fields = {...fields,
            user_send: _id,
            user_cty: id_cong_ty,
            mail_cty: mail_congty,
            name_com: name_cty_nhan, //mang
            user_nhan: id_user_nhan, //mang
            gui_ngoai_cty: 1,
            phieu_trinh: fileName,
        }

        let maxIdVB = await vanThuService.getMaxId(VanBans);
        fields._id = maxIdVB;
        let vanBan = new VanBans(fields);
        vanBan = await vanBan.save();
        if (!vanBan) {
            return functions.setError(res, "Create van ban fail!", 504);
        }
        // thay the van ban
        let { type_thay_the, so_vb_tt, ten_vb_tt, trich_yeu_tt, } = req.body;
        if (type_thay_the == 1) {
            if (!so_vb_tt || !ten_vb_tt || !trich_yeu_tt) {
                return functions.setError(res, "Missing input van ban thay the!", 405);
            }
            let maxIdThayThe = await vanThuService.getMaxId(ThayThe);
            let fieldsThayThe = { _id: maxIdThayThe, id_vb_tt: maxIdVB, so_vb_tt, ten_vb_tt, trich_yeu_tt, create_time: fields.created_date };

            let thayThe = new ThayThe(fieldsThayThe);
            thayThe = thayThe.save();
            if (!thayThe) {
                return functions.setError(res, "Insert data into tbl thay the fail!", 505);
            }
        }

        //
        let type_user = '';
        let type_sent = '';
        if (type == 2) {
            if (type_usn == 2) type_user = 1;
            else type_user = 2;
            type_sent = 3;
        } else {
            if (type_usn == 2) type_user = 3;
            else type_user = 4;
            type_sent = 1;
        }

        let Status = 2;
        let ListReceive = id_user_nhan; // mang
        if (fields.xet_duyet_van_ban == 2) {
            Status = 1;
            ListReceive = fields.nguoi_xet_duyet;
        }

        const link = `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-can-duyet/${maxIdVB}`;
        //gui thong bao qua chat
        let dataSend = {
                EmployeeId: id,
                ListReceive: `[${ListReceive}]`,
                CompanyId: com_id,
                ListFollower: `[${fields.nguoi_theo_doi}]`,
                Status: Status,
                Message: fields.nhom_vb,
                Type: type_user,
                Title: fields.title_vb,
                Link: link,
                SenderId: id
            }
            // gui email
        let dataSendChat = await functions.getDataAxios(vanThuService.arrAPI().NotificationReport, dataSend);
        //gui file qua chat
        dataSend = {
            SenderId: id,
            ReceiveId: `[${ListReceive}]`,
            CompanyId: com_id,
            Type: type_sent,
            InfoFile: req.InfoFile,
            NameFile: req.NameFile,
            Status: fields.nhom_vb,
            Title: fields.title_vb,
            Link: link
        }
        dataSendChat = await functions.getDataAxios(vanThuService.arrAPI().SendContractFile, dataSend);

        for (var id_uv in id_uv_nhan_tb) {
            let maxIdThongBao = await vanThuService.getMaxId(ThongBao);
            let fieldsThongBao = { _id: maxIdThongBao, id_user: fields.user_send, id_user_nhan: id_uv, type: 1, view: 0, created_date: fields.created_date, id_van_ban: maxIdVB };
            if (noidung_guimail == '') {
                if (id_uv == 0) {
                    return functions.setError(res, "Email not found!", 406);
                }
                fieldsThongBao.id_uv = tk_mail_nhan;
                delete fieldsThongBao.view;
            }
            //them thong bao
            let thongBao = new ThongBao(fieldsThongBao);
            thongBao = await thongBao.save();
            if (!thongBao) {
                return functions.setError(res, "Insert data into tbl thong bao fail!", 505);
            }
        }
        if (vanBan.gui_ngoai_cty == 1) {
            if (vanBan.nguoi_theo_doi) {
                vanThuService.chatNotification_using_id(vanBan.user_send, Number(vanBan.nguoi_theo_doi), `Bạn có văn bản cần theo dõi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
            for (let i = 0; i < listUserDuyet.length; i++) {
                vanThuService.chatNotification_using_id(vanBan.user_send, listUserDuyet[i], `Bạn có văn bản cần duyệt \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            if (vanBan.trang_thai_vb == 6) {
                const listUserNhan = vanBan.user_nhan.split(',').map(Number);
                for (let i = 0; i < listUserNhan.length; i++) {
                    vanThuService.chatNotification_using_id(vanBan.user_send, listUserNhan[i], `Bạn đã nhận được văn bản \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            }
        } else {
            if (vanBan.nguoi_theo_doi) {
                vanThuService.chatNotification(vanBan.user_send, Number(vanBan.nguoi_theo_doi), com_id, `Bạn có văn bản cần theo dõi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
            for (let i = 0; i < listUserDuyet.length; i++) {
                vanThuService.chatNotification(vanBan.user_send, listUserDuyet[i], com_id, `Bạn có văn bản cần duyệt \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            if (vanBan.trang_thai_vb == 6) {
                const listUserNhan = vanBan.user_nhan.split(',').map(Number);
                for (let i = 0; i < listUserNhan.length; i++) {
                    vanThuService.chatNotification(vanBan.user_send, listUserNhan[i], com_id, `Bạn đã nhận được văn bản \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            }
        }
        return res.status(200).json({ message: 'Tạo văn bản đi ngoài công ty thành công' })
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.createVanBanIn = async(req, res, next) => {
    try {
        let fields = req.fields;
        let { vb_th, type_nhieu_nguoi_ky, nguoi_ky, chuc_vu_nguoi_ky, id_uv_nhan } = req.body;
        let id = req.user.data.idQLC;
        let type = req.user.data.type;
        let comId = req.user.data.com_id;
        let id_user_send = id;
        let user_cty = '';
        let com_user = comId;
        let type_thu_hoi = 0,
            so_vb_th;

        if (!vb_th || !type_nhieu_nguoi_ky || !nguoi_ky || !id_uv_nhan) {
            return functions.setError(res, "Thiếu trường", 408);
        }

        if (fields.duyet_vb != 2) {
            if (!await checkBanHanh(type, comId, id, 1)) {
                return res.status(200).json({ message: 'Tài khoản chưa được phân quyền để ban hành nội bộ công ty' })
            }
        }

        let vanBan = await VanBans.findOne({ _id: vb_th }, { _id: 1, so_vb: 1 });
        if (vanBan) {
            so_vb_th = vanBan._id;
            type_thu_hoi = 1;
        }

        let list_duyet = await UserVT.findOne({ id_user: comId }, { duyet_pb: 1, type_cong_ty: 1 });

        //Đặt một biến đệm để về sau gọi api thông báo
        const ids_uv_nhan_tb = id_uv_nhan;
        id_uv_nhan = id_uv_nhan.join(", ");
        if (type_nhieu_nguoi_ky == 'on') {
            nguoi_ky = nguoi_ky.join(", ");
        } else {
            nguoi_ky = nguoi_ky[0]
        }
        let phieu_trinh = req.files.phieu_trinh;
        let fileName = '';
        if (phieu_trinh) {
            fileName = await vanThuService.uploadFileNameRandom('file_van_ban', phieu_trinh);
        }

        fields = {...fields,
            user_nhan: id_uv_nhan,
            user_cty: user_cty,
            type_thu_hoi: type_thu_hoi,
            phieu_trinh: fileName,
            nguoi_ky: nguoi_ky,
            chuc_vu_nguoi_ky: chuc_vu_nguoi_ky,
        }
        let maxIdVB = await vanThuService.getMaxId(VanBans);
        fields._id = maxIdVB;
        vanBan = new VanBans(fields);
        vanBan = await vanBan.save();
        if (!vanBan) {
            return functions.setError(res, "Create van ban fail!", 504);
        }

        if (type_thu_hoi == 1) {
            await VanBans.deleteOne({ _id: so_vb_th });
        }

        // thay the van ban
        let { type_thay_the, so_vb_tt, ten_vb_tt, trich_yeu_tt, } = req.body;
        if (type_thay_the == 1) {
            if (!so_vb_tt || !ten_vb_tt || !trich_yeu_tt) {
                return functions.setError(res, "Missing input van ban thay the!", 405);
            }
            let maxIdThayThe = await vanThuService.getMaxId(ThayThe);
            let fieldsThayThe = { _id: maxIdThayThe, id_vb_tt: maxIdVB, so_vb_tt, ten_vb_tt, trich_yeu_tt, create_time: fields.created_date };

            let thayThe = new ThayThe(fieldsThayThe);
            thayThe = thayThe.save();
            if (!thayThe) {
                return functions.setError(res, "Insert data into tbl thay the fail!", 505);
            }
        }

        //thong bao
        for (var id_nv in ids_uv_nhan_tb) {
            let maxIdThongBao = await vanThuService.getMaxId(ThongBao);
            let fieldsThongBao = { _id: maxIdThongBao, id_user: fields.user_send, id_user_nhan: id_nv, type: 1, view: 0, created_date: fields.created_date, id_van_ban: maxIdVB };
            //them thong bao
            let thongBao = new ThongBao(fieldsThongBao);
            thongBao = await thongBao.save();
            if (!thongBao) {
                return functions.setError(res, "Insert data into tbl thong bao fail!", 505);
            }
        }
        let type_user = '';
        let type_sent = '';
        if (type == 2) {
            type_user = 1;
            type_sent = 3;
        } else {
            type_user = 3;
            type_sent = 1;
        }

        let Status = 2;
        let ListReceive = fields.user_nhan; // mang
        if (fields.xet_duyet_van_ban == 2) {
            Status = 1;
            ListReceive = fields.nguoi_xet_duyet;
        }

        const link = `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-can-duyet/${maxIdVB}`;
        //gui thong bao qua chat
        let dataSend = {
            EmployeeId: id,
            ListReceive: `[${ListReceive}]`,
            CompanyId: comId,
            ListFollower: `[${fields.nguoi_theo_doi}]`,
            Status: Status,
            Message: fields.nhom_vb,
            Type: type_user,
            Title: fields.title_vb,
            SenderId: id,
            Link: link
        }
        let dataSendchat = await functions.getDataAxios(vanThuService.arrAPI().NotificationReport, dataSend);
        //gui file qua chat

        dataSend = {
            SenderId: id,
            ReceiveId: `[${ListReceive}]`,
            CompanyId: comId,
            Type: type_sent,
            InfoFile: req.InfoFile,
            NameFile: req.NameFile,
            Status: fields.nhom_vb,
            Title: fields.title_vb,
            Link: link
        }
        dataSendchat = await functions.getDataAxios(vanThuService.arrAPI().SendContractFile, dataSend);

        if (vanBan.gui_ngoai_cty == 1) {
            if (vanBan.nguoi_theo_doi) {
                vanThuService.chatNotification_using_id(vanBan.user_send, Number(vanBan.nguoi_theo_doi), `Bạn có văn bản cần theo dõi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
            for (let i = 0; i < listUserDuyet.length; i++) {
                vanThuService.chatNotification_using_id(vanBan.user_send, listUserDuyet[i], `Bạn có văn bản cần duyệt \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            if (vanBan.trang_thai_vb == 6) {
                const listUserNhan = vb.user_nhan.split(',').map(Number);
                for (let i = 0; i < listUserNhan.length; i++) {
                    vanThuService.chatNotification_using_id(vb.user_send, listUserNhan[i], `Bạn đã nhận được văn bản \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            }
        } else {
            if (vanBan.nguoi_theo_doi) {
                vanThuService.chatNotification(vanBan.user_send, Number(vanBan.nguoi_theo_doi), comId, `Bạn có văn bản cần theo dõi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
            for (let i = 0; i < listUserDuyet.length; i++) {
                vanThuService.chatNotification(vanBan.user_send, listUserDuyet[i], comId, `Bạn có văn bản cần duyệt \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            const listUserKy = vanBan.nguoi_ky.split(',').map(Number);
            for (let i = 0; i < listUserKy.length; i++) {
                vanThuService.chatNotification(vanBan.user_send, listUserKy[i], comId, `Bạn có văn bản cần ký \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
            }
            if (vanBan.trang_thai_vb == 6) {
                const listUserNhan = vanBan.user_nhan.split(',').map(Number);
                for (let i = 0; i < listUserNhan.length; i++) {
                    vanThuService.chatNotification(vanBan.user_send, listUserNhan[i], comId, `Bạn đã nhận được văn bản \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            }
        }
        return res.status(200).json({ message: 'Tạo văn bản đi trong công ty thành công' })
    } catch (err) {
        console.log(err);
        return functions.setError(res, err.message);
    }
}

exports.getListVanBanDiDaGui = async(req, res, next) => {
    try {
        let { id_vb, ten_vb_search, trang_thai_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        if (time_start) time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        if (time_end) time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;

        let id = req.user.data.idQLC;
        let _id = req.user.data._id;
        let condition = {
            $or: [{
                    user_send: id,
                    gui_ngoai_cty: 0,
                },
                {
                    user_send: id,
                    gui_ngoai_cty: { $exists: false }
                },
                {
                    user_send: _id,
                    gui_ngoai_cty: 1,
                },
            ]
        };
        if (id_vb) condition._id = Number(id_vb);
        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (trang_thai_search == '2') {
            condition.trang_thai_vb = 3;
        } else if (trang_thai_search == '3') {
            condition.trang_thai_vb = 6;
        } else if (trang_thai_search == '4') {
            condition.trang_thai_vb = 0;
        }
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (!time_start && time_end) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanDi = await VanBans.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        let totalCount = await VanBans.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            {
                $group: { _id: null, count: { $sum: 1 } }
            },
            {
                $project: { _id: 0, count: 1 }
            }
        ]);
        if (listVanBanDi && listVanBanDi.length > 0) {
            for (let i = 0; i < listVanBanDi.length; i++) {
                let link = vanThuService.getLinkFile(folder, listVanBanDi[i].created_date, listVanBanDi[i].file_vb);
                listVanBanDi[i].linkFile = link;

                const listUserNhanID = listVanBanDi[i].user_nhan.split(',').map(Number);
                let userNhanName = [];
                if (listVanBanDi[i].gui_ngoai_cty == 1) {
                    for (let j = 0; j < listUserNhanID.length; j++) {
                        const userNhan = await Users.findOne({
                            _id: listUserNhanID[j],
                            type: {
                                $in: [1, 0]
                            },
                        });
                        if (userNhan) {
                            userNhanName.push(userNhan.userName);
                        }
                    }
                    listVanBanDi[i].userNhanName = userNhanName;
                } else {
                    for (let j = 0; j < listUserNhanID.length; j++) {
                        const userNhan = await Users.findOne({
                            idQLC: listUserNhanID[j],
                            type: 2,
                        });
                        if (userNhan) {
                            userNhanName.push(userNhan.userName);
                        }
                    }
                    listVanBanDi[i].userNhanName = userNhanName.join(', ');
                }
                const history_confirm = await history_duyet_vb.findOne({
                    id_user: id,
                    id_vb: listVanBanDi[i]._id,
                }).sort({ time: -1 });

                if (history_confirm && history_confirm.type_handling == 2) {
                    listVanBanDi[i].you_confirm = true;
                } else {
                    listVanBanDi[i].you_confirm = false;
                }
            }
        }
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban gui di success!", { totalCount, page, pageSize, listVanBanDi });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}
exports.getListVanBanDiChoDuyet = async(req, res, next) => {
    try {
        let { id_vb, ten_vb_search, trang_thai_search, time_start, time_end, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        if (time_start) time_start = time_start ? vanThuService.convertTimestamp(time_start) : null;
        if (time_end) time_end = time_end ? vanThuService.convertTimestamp(time_end) : null;

        let id = req.user.data.idQLC;
        let _id = req.user.data._id;
        let condition = {
            $or: [{
                    user_send: id,
                    gui_ngoai_cty: 0,
                },
                {
                    user_send: id,
                    gui_ngoai_cty: { $exists: false }
                },
                {
                    user_send: _id,
                    gui_ngoai_cty: 1,
                },
            ]
        };
        condition.trang_thai_vb = {
            $in: [0, 10]
        }
        if (id_vb) condition._id = Number(id_vb);
        if (ten_vb_search) condition.title_vb = new RegExp(ten_vb_search, 'i');
        if (trang_thai_search) condition.trang_thai_vb = Number(trang_thai_search);
        if (time_start && !time_end) condition.created_date = { $gte: time_start };
        if (!time_start && time_end) condition.created_date = { $lte: time_end };
        if (time_start && time_end) condition.created_date = { $gte: time_start, $lte: time_end }

        let listVanBanDi = await VanBans.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        let totalCount = await VanBans.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: "vanthu_group_van_bans",
                    localField: "nhom_vb",
                    foreignField: "id_group_vb",
                    as: "matchedDocuments"
                }
            },
            {
                $group: { _id: null, count: { $sum: 1 } }
            },
            {
                $project: { _id: 0, count: 1 }
            }
        ]);
        if (listVanBanDi && listVanBanDi.length > 0) {
            for (let i = 0; i < listVanBanDi.length; i++) {
                let link = vanThuService.getLinkFile(folder, listVanBanDi[i].created_date, listVanBanDi[i].file_vb);
                listVanBanDi[i].linkFile = link;

                const listUserNhanID = listVanBanDi[i].user_nhan.split(',').map(Number);
                let userNhanName = [];
                if (listVanBanDi[i].gui_ngoai_cty == 1) {
                    for (let j = 0; j < listUserNhanID.length; j++) {
                        const userNhan = await Users.findOne({
                            _id: listUserNhanID[j],
                            type: {
                                $in: [1, 0]
                            },
                        });
                        if (userNhan) {
                            userNhanName.push(userNhan.userName);
                        }
                    }
                    listVanBanDi[i].userNhanName = userNhanName;
                } else {
                    for (let j = 0; j < listUserNhanID.length; j++) {
                        const userNhan = await Users.findOne({
                            idQLC: listUserNhanID[j],
                            type: 2,
                        });
                        if (userNhan) {
                            userNhanName.push(userNhan.userName);
                        }
                    }
                    listVanBanDi[i].userNhanName = userNhanName.join(', ');
                }
                const history_confirm = await history_duyet_vb.findOne({
                    id_user: id,
                    id_vb: listVanBanDi[i]._id,
                }).sort({ time: -1 });

                if (history_confirm && history_confirm.type_handling == 2) {
                    listVanBanDi[i].you_confirm = true;
                } else {
                    listVanBanDi[i].you_confirm = false;
                }
            }
        }
        totalCount = totalCount.length > 0 ? totalCount[0].count : 0;
        return functions.success(res, "Get list van ban gui di success!", { totalCount, page, pageSize, listVanBanDi });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}
exports.getDetailVanBan = async(req, res, next) => {
    try {
        let id_vb = req.body.id_vb;
        let id = req.user.data.idQLC;
        if (!id_vb) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let vanBan = await VanBans.findOne({ _id: id_vb }).lean();

        let phieutrinhLink = [];
        let filevbLink = [];
        const phieu_trinhs = vanBan.phieu_trinh ? vanBan.phieu_trinh.split(',').filter(file => file !== '') : null;
        const file_vbs = vanBan.file_vb ? vanBan.file_vb.split(',').filter(file => file !== '') : null;
        const time_created = vanBan.created_date;
        const date = new Date(time_created);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const timestamp = Math.round(date.getTime() / 1000);

        const folder = 'file_van_ban'
        const dir = `/vanthu/uploads/${folder}/${year}/${month}/${day}/`;
        if (phieu_trinhs && phieu_trinhs.length > 0) {
            for (let i = 0; i < phieu_trinhs.length; i++) {
                const phieu_trinh_link = `${phieu_trinhs[i]}`;
                const filepath = 'https://api.timviec365.vn' + dir + phieu_trinh_link;
                phieutrinhLink.push({
                    name: phieu_trinhs[i],
                    link: filepath
                });
            }
        }
        if (file_vbs && file_vbs.length > 0) {
            for (let i = 0; i < file_vbs.length; i++) {
                const file_vb_link = `${file_vbs[i]}`;
                const filepath = 'https://api.timviec365.vn' + dir + file_vb_link;
                filevbLink.push({
                    name: file_vbs[i],
                    link: filepath
                });
            }
        }

        if (!vanBan) {
            return functions.setError(res, "Khong tin tai van ban!", 405);
        }
        //check luu van ban
        let checkLuuQLCV = await QuanLyCongVan.findOne({ cv_id_vb: id_vb });
        let checkLuu = false;
        if (checkLuuQLCV) {
            checkLuu = true;
        }
        vanBan.check_qlcv = checkLuu;

        //lay ra phan hoi
        let feedBack = await FeedBack.findOne({ vb_fb: id_vb }).lean();
        vanBan.feedBack = feedBack;

        //lay ra thong tin van ban thay the
        let thayThe;
        if (vanBan.type_thay_the == 1) {
            thayThe = await ThayThe.findOne({ id_vb_tt: id_vb }).lean();
        }
        vanBan.thayThe = thayThe;
        const history_confirm = await history_duyet_vb.findOne({
            id_user: id,
            id_vb: id_vb
        }).sort({ time: -1 });

        if (history_confirm && history_confirm.type_handling == 2) {
            vanBan.you_confirm = true;
        } else {
            vanBan.you_confirm = false;
        }
        //neu la van ban den se chuyen du lieu da xem hay chua
        let checkThongBao = await ThongBao.findOneAndUpdate({ id_user_nhan: id, id_van_ban: id_vb, view: 0, type: 1 }, { view: 1 }, { new: true });
        vanBan = {
            ...vanBan,
            phieu_trinh_files: phieutrinhLink,
            file_vb_files: filevbLink,
        }
        return functions.success(res, "Get detail van ban success!", { vanBan: vanBan });
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}

exports.createChuyenTiep = async(req, res, next) => {
    try {
        let { ten_nguoi_nhan, id_vb } = req.body;
        if (!ten_nguoi_nhan || !id_vb) {
            return functions.setError(res, "Missing input value!", 404);
        }
        const idQLC = req.user.data.idQLC;
        const com_id = req.user.data.com_id;
        let vanBan = await VanBans.findOne({ _id: id_vb });
        if (!vanBan) {
            return functions.setError(res, "Van ban not found!", 504);
        }
        let user_nhan;
        for (let i = 0; i < ten_nguoi_nhan.length; i++) {
            if (vanBan.user_forward) {
                if (vanBan.user_forward.includes(ten_nguoi_nhan[i].toString())) {
                    return functions.setError(res, "Người được chọn đã được chuyển tiếp");
                }
                user_nhan = `${vanBan.user_forward},${ten_nguoi_nhan.join(',')}`;
            } else {
                user_nhan = `${ten_nguoi_nhan.join(',')}`;
            }
        }
        vanBan = await VanBans.findOneAndUpdate({ _id: id_vb }, { user_forward: user_nhan, update_time: vanThuService.convertTimestamp(Date.now()) }, { new: true });
        if (!vanBan) {
            return functions.setError(res, "Chuyen tiep van ban that bai!", 505);
        }
        vanThuService.chatNotification(idQLC, Number(ten_nguoi_nhan), com_id, `Bạn đã nhận được văn bản \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
        return functions.success(res, "Chuyen tiep van ban thanh cong!", vanBan);
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}

exports.deleteVanBan = async(req, res, next) => {
    try {
        let id_vb = req.body.id_vb;
        if (!id_vb || id_vb == 0) {
            return functions.setError(res, "Missing input id_vb!", 404);
        }
        let vanBan = await VanBans.deleteOne({ _id: id_vb });
        if (vanBan && vanBan.deletedCount == 1) {
            return functions.success(res, "Delete van ban success!");
        }
        return functions.setError(res, "Van ban not found!", 504);
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

exports.checkLuuQLCV = async(req, res, next) => {
    try {
        let id_vb = req.body.id_vb;
        if (!id_vb || id_vb == 0) {
            return functions.setError(res, "Missing input id_vb!", 404);
        }
        let checkLuuQLCV = await QuanLyCongVan.findOne({ cv_id_vb: id_vb });
        let checkLuu = false;
        if (checkLuuQLCV) {
            checkLuu = true;
        }
        return functions.success(res, "Check luu van ban noi bo cong ty!", { checkLuu: checkLuu })

    } catch (err) {
        return functions.setError(res, err.message);
    }
}

exports.luuVBCTY = async(req, res, next) => {
    try {
        let { id_vb, book_vb, so_vb, type } = req.body;
        const com_id = req.user.data.idQLC;
        if (!id_vb || !book_vb || !so_vb) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let congVan = await QuanLyCongVan.findOne({ cv_id_vb: id_vb });
        if (congVan) {
            return functions.setError(res, "Cong van da duoc luu!", 405);
        }
        let vanBan = await VanBans.findOne({ _id: id_vb });
        if (!vanBan) {
            return functions.setError(res, "Van ban khong tim thay!", 406);
        }
        if (!type) {
            let list_id_user_nhan = vanBan.user_nhan.split(',').map(Number)
            if (vanBan.gui_ngoai_cty == 1) {
                let list_user_nhan = await Users.find({
                    _id: {
                        $in: list_id_user_nhan
                    }
                })
                let list_idQLC_user_nhan = list_user_nhan.map(u => u.idQLC);
                if (list_idQLC_user_nhan.some(id => id == com_id)) {
                    type = 1;
                } else {
                    type = 2;
                }
            } else {
                if (list_id_user_nhan.some(id => id == com_id)) {
                    type = 1;
                } else {
                    type = 2;
                }
            }
        }
        if (type == 2 && vanBan.gui_ngoai_cty != 1) {
            let user_send = await Users.findOne({
                idQLC: Number(vanBan.user_send),
                type: 1
            });
            vanBan.user_send = user_send._id;
            let list_id_user_nhan = vanBan.user_nhan.split(',').map(Number);
            let list_user_nhan = await Users.find({
                idQLC: {
                    $in: list_id_user_nhan
                },
                'inForPerson.employee.com_id': com_id,
            });
            vanBan.user_nhan = list_user_nhan.map(u => u._id).join(',');
            if (vanBan.nguoi_ky) {
                let list_id_user_ky = vanBan.nguoi_ky.split(',').map(Number);
                let list_user_ky = await Users.find({
                    idQLC: {
                        $in: list_id_user_ky
                    },
                    'inForPerson.employee.com_id': com_id,
                });
                vanBan.nguoi_ky = list_user_ky.map(u => u._id).join(',');
            }
        }
        let kieu = '',
            type_hd = 0,
            status_hd = 0,
            type_soan, phong_soan, user_soan, nhan_noibo, chuyen_noibo;

        if (vanBan.type_khan_cap == 1) kieu = 1;
        if (vanBan.type_bao_mat == 1) kieu = 2;

        if (vanBan.nhom_vb == 17) {
            type_hd = 1;
            status_hd = 1;
            if (vanBan.trang_thai_vb == 6) status_hd = 2;
        }
        type_soan = 1;
        phong_soan = "";
        user_soan = vanBan.user_send;
        let soan_ngoai = "",
            name_soan = "",
            nhan_ngoai = "",
            chuyen_ngoai = "";
        let type_nhan = 1,
            type_chuyenden = 1;
        chuyen_noibo = vanBan.user_nhan;
        if (vanBan.gui_ngoai_cty == 1) {
            type_nhan = type_chuyenden = 2;
            nhan_noibo = chuyen_noibo = "";
            nhan_ngoai = chuyen_ngoai = vanBan.user_send;
        }
        let maxIdQLCV = await vanThuService.getMaxId(QuanLyCongVan);
        congVan = new QuanLyCongVan({
            _id: maxIdQLCV,
            cv_id_vb: vanBan._id,
            cv_id_book: book_vb,
            cv_name: vanBan.title_vb,
            cv_kieu: kieu,
            cv_so: so_vb,
            cv_type_soan: type_soan,
            cv_soan_ngoai: soan_ngoai,
            cv_phong_soan: phong_soan,
            cv_user_soan: user_soan,
            cv_name_soan: name_soan,
            cv_date: vanBan.created_date / 1000,
            cv_user_save: vanBan.user_nhan,
            cv_user_ky: vanBan.nguoi_ky,
            cv_type_nhan: type_nhan,
            cv_nhan_noibo: nhan_noibo,
            cv_nhan_ngoai: nhan_ngoai,
            cv_type_chuyenden: type_chuyenden,
            cv_chuyen_noibo: chuyen_noibo,
            cv_chuyen_ngoai: chuyen_ngoai,
            cv_trich_yeu: vanBan.des_vb,
            cv_ghi_chu: vanBan.nd_vb,
            cv_file: vanBan.file_vb,
            cv_type_loai: Number(type),
            cv_type_hd: type_hd,
            cv_status_hd: status_hd,
            cv_usc_id: com_id,
            cv_time_created: vanBan.created_date / 1000
        })
        congVan = await congVan.save();
        if (!congVan) {
            return functions.setError(res, "Luu cong van fail!", 506);
        }
        return functions.success(res, "Luu cong van thanh cong!");
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}

exports.setTrangThaiVanBan = async(req, res, next) => {
    try {
        let { id_vb, trang_thai_vb } = req.body;
        if (!id_vb || !trang_thai_vb) {
            return functions.setError(res, "Missing input value!", 404);
        }
        let vanBan = await VanBans.findOneAndUpdate({ _id: id_vb }, { trang_thai_vb: trang_thai_vb }, { new: true });
        if (!vanBan) {
            return functions.setError(res, "Khong ton tai van ban!", 504);
        }
        return functions.success(res, "Cap nhat trang thai thanh cong!");
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

exports.checkQuyenBanHanh = async(req, res, next) => {
    try {
        let type = req.body.type;
        if (type != 1 && type != 2) {
            return functions.setError(res, "Truyen type=1 or type=2!", 404);
        }
        let banHanh;
        if (type == 1) {
            banHanh = await checkBanHanh(req.type, req.comId, req.id, 1);
            return functions.success(res, "Check ban hanh noi bo cong ty", { banHanh: banHanh });
        }
        banHanh = await checkBanHanh(req.type, req.comId, req.id, 2);
        return functions.success(res, "Check ban hanh ngoai", { banHanh: banHanh });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}

exports.getUserByEmail = async(req, res, next) => {
    try {
        let { type, email } = req.body;
        if (!type || !email) {
            return functions.setError(res, "Missing input type or email!", 404);
        }
        let user = await Users.findOne({ email: email, type: type }, { _id: 1, idQLC: 1, userName: 1, email: 1 });
        if (!user) {
            return functions.setError(res, "User khong ton tai!", 405);
        }
        return functions.success(res, "Get user by email success!", { user: user });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}
exports.getUserByType = async(req, res, next) => {
    try {
        let { type } = req.body;
        if (type) {
            let user = await Users.find({ type: type }, { idQLC: 1, userName: 1, email: 1 });
            if (!user) {
                return functions.setError(res, "User khong ton tai!", 405);
            }
            return functions.success(res, "Get user by type success!", { user: user });
        }
        return functions.setError(res, "Missing input type or email!", 404);
    } catch (err) {
        return functions.setError(res, err.message);
    }
}
exports.getUserByOrganize = async(req, res, next) => {
    try {
        const com_id = req.user.data.com_id;
        const {
            listOrganizeDetailId,
            position_id,
        } = req.body;
        const conditions = {
            "inForPerson.employee.com_id": com_id
        }
        if (listOrganizeDetailId) conditions["inForPerson.employee.listOrganizeDetailId"] = { $all: listOrganizeDetailId }
        if (position_id) conditions["inForPerson.employee.position_id"] = position_id
        const user = await Users.aggregate([{
                $match: conditions
            },
            {
                $sort: { userName: -1 },
            },
            {
                $project: {
                    ep_id: '$idQLC',
                    ep_email: '$email',
                    ep_phone: '$phone',
                    ep_name: '$userName',
                    ep_image: '$avatarUser',
                    role_id: '$role',
                    position_id: '$inForPerson.employee.position_id',
                    com_id: '$inForPerson.employee.com_id',
                    listOrganizeDetailId: '$inForPerson.employee.listOrganizeDetailId',
                    organizeDetailId: '$inForPerson.employee.organizeDetailId',
                },
            }
        ])
        return functions.success(res, "Get user by organize success!", { user: user });
    } catch (err) {
        return functions.setError(res, err.message);
    }
}
exports.getInforCompanyOrPersonById = async(req, res, next) => {
    try {
        const {
            list_id
        } = req.body;
        const data = await Users.find({
            _id: {
                $in: list_id
            },
        })
        return res.status(200).json({ data })
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}
exports.getInforCompanyByIdQLC = async(req, res, next) => {
    try {
        const com_id = Number(req.body.com_id)
        const foundGateway = await Users.findOne({
            idQLC: com_id,
            type: 1,
        }, )
        if (foundGateway)
            return functions.success(res, 'Thông tin công ty', {
                data: foundGateway,
            })
        return functions.setError(res, 'Công ty không tồn tại')
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}
exports.thuhoi = async(req, res, next) => {
    try {
        const {
            id_vb
        } = req.body;
        const comId = req.user.data.com_id;
        const vanBan = await VanBans.findOneAndUpdate({
            _id: id_vb
        }, {
            $set: {
                type_thu_hoi: 1,
            }
        }, {
            new: true
        });
        if (vanBan) {
            if (vanBan.gui_ngoai_cty == 1) {
                if (vanBan.nguoi_theo_doi) {
                    vanThuService.chatNotification_using_id(vanBan.user_send, Number(vanBan.nguoi_theo_doi), `Văn bản bị thu hồi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
                const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
                for (let i = 0; i < listUserDuyet.length; i++) {
                    vanThuService.chatNotification_using_id(vanBan.user_send, listUserDuyet[i], `Văn bản bị thu hồi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            } else {
                if (vanBan.nguoi_theo_doi) {
                    vanThuService.chatNotification(vanBan.user_send, Number(vanBan.nguoi_theo_doi), comId, `Văn bản bị thu hồi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
                const listUserDuyet = vanBan.nguoi_xet_duyet.split(',').map(Number);
                for (let i = 0; i < listUserDuyet.length; i++) {
                    vanThuService.chatNotification(vanBan.user_send, listUserDuyet[i], comId, `Văn bản bị thu hồi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
                const listUserKy = vanBan.nguoi_ky.split(',').map(Number);
                for (let i = 0; i < listUserKy.length; i++) {
                    vanThuService.chatNotification(vanBan.user_send, listUserKy[i], comId, `Văn bản bị thu hồi \n Người gửi: ${vanBan.name_user_send}`, `https://hungha365.com/van-thu-luu-tru/van-ban-den/van-ban-moi/${vanBan._id}`)
                }
            }
            return res.status(200).json({ message: 'Thu hồi văn bản thành công', vanban: vanBan })
        } else {
            return res.status(200).json({ message: 'Không tìm thấy văn bản trong hệ thống' })
        }
    } catch (err) {
        console.log(err)
        return functions.setError(res, err.message);
    }
}