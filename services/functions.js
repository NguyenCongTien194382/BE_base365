// check ảnh và video
const fs = require('fs')
    // upload file
const multer = require('multer')

// gửi mail
const nodemailer = require('nodemailer')
    // tạo biến môi trường
const dotenv = require('dotenv')
    // mã hóa mật khẩu
const crypto = require('crypto')
    // gọi api
const axios = require('axios')
    //Render ảnh và pdf
const puppeteer = require('puppeteer')
    // check video
const path = require('path')
    //check ảnh
const { promisify } = require('util')
    // tạo token
const jwt = require('jsonwebtoken')
const CV = require('../models/Timviec365/CV/Cv365')
const SettingPropose = require('../models/qlc/SettingPropose')
const Users = require('../models/Users')
const Tv365PointCompany = require('../models/Timviec365/UserOnSite/Company/ManagerPoint/PointCompany');
const HistoryCrm = require("../models/Timviec365/UserOnSite/ManageHistory/HistoryCrm");
const ManageNghiPhep = require("../models/ManageNghiPhep");
const slugify = require('slugify')
const MbSize = 1024 * 1024
const FormData = require('form-data');
// giới hạn dung lượng video < 100MB
const MAX_VIDEO_SIZE = 100 * MbSize
    // danh sách các loại video cho phép
const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.flv']
    // giới hạn dung lượng ảnh < 2MB
const MAX_IMG_SIZE = 2 * MbSize
    // giới hạn dung lượng kho ảnh
exports.MAX_STORAGE = 300 * MbSize

dotenv.config()

// 1543408 : gửi tin nhắn vào nhóm duyệt đề xuất 
exports.sendMessageDexuatDiemCrm = async(IdChatChuyenVien, mess) => {
    try {
        await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/message/SendMessage",
            data: {
                ConversationID: 1543408,
                SenderID: IdChatChuyenVien,
                MessageType: 'text',
                Message: mess
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return true;
    } catch (e) {
        console.log("sendMessageToChuyenVien error", e)
        return false;
    }
};

exports.sendMessageToChuyenVien = async(IdChatChuyenVien, mess) => {
    try {
        console.log("Gửi tin nhắn cho chuyên viên", IdChatChuyenVien)
        let res = await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/conversations/CreateNewConversation",
            data: {
                userId: IdChatChuyenVien,
                contactId: 1192,
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        let conversationId = res.data.data.conversationId;

        await axios({
            method: "post",
            url: "http://210.245.108.202:9000/api/message/SendMessage",
            data: {
                ConversationID: Number(conversationId),
                SenderID: 1192,
                MessageType: 'text',
                Message: mess
            },
            headers: { "Content-Type": "multipart/form-data" }
        });
        return true;
    } catch (e) {
        console.log("sendMessageToChuyenVien error", e)
        return false;
    }
};

exports.sendMessageToChuyenVienQlc = async(idQlcChuyenVien, mess) => {
        try {
            let chuyenvien = await Users.findOne({ idQLC: idQlcChuyenVien, type: 2 }, { _id: 1 }).lean();
            let IdChatChuyenVien = chuyenvien._id;
            console.log("Gửi tin nhắn cho chuyên viên", IdChatChuyenVien)
            let res = await axios({
                method: "post",
                url: "http://210.245.108.202:9000/api/conversations/CreateNewConversation",
                data: {
                    userId: IdChatChuyenVien,
                    contactId: 1192,
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            let conversationId = res.data.data.conversationId;

            await axios({
                method: "post",
                url: "http://210.245.108.202:9000/api/message/SendMessage",
                data: {
                    ConversationID: Number(conversationId),
                    SenderID: 1192,
                    MessageType: 'text',
                    Message: mess
                },
                headers: { "Content-Type": "multipart/form-data" }
            });
            return true;
        } catch (e) {
            console.log("sendMessageToChuyenVien error", e)
            return false;
        }
    }
    // kiểm tra đơn nghỉ phép CRM để chuyển giở khi NTD đăng ký đăng nhập đăng tin khi kinh doanh nghỉ 
exports.CheckNghiPhep = async(idCRM) => {
    let time = new Date().getTime() / 1000;
    let dataNghi = await ManageNghiPhep.find({
        idFrom: Number(idCRM),
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
    if (dataNghi.length) {
        return dataNghi
    } else {
        return true
    }
}

// check title
const removeAccent = (str) => {
    const accents = 'àáâãäåèéêëìíîïòóôõöùúûüýÿđ'
    const accentRegex = new RegExp(`[${accents}]`, 'g')
    const accentMap = {
        à: 'a',
        á: 'a',
        â: 'a',
        ã: 'a',
        ä: 'a',
        å: 'a',
        è: 'e',
        é: 'e',
        ê: 'e',
        ë: 'e',
        ì: 'i',
        í: 'i',
        î: 'i',
        ï: 'i',
        ò: 'o',
        ó: 'o',
        ô: 'o',
        õ: 'o',
        ö: 'o',
        ù: 'u',
        ú: 'u',
        û: 'u',
        ü: 'u',
        ý: 'y',
        ÿ: 'y',
        đ: 'd',

    }
    return str.replace(accentRegex, (match) => accentMap[match])
}

// chuyển giỏ admin elastic 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function removeVietnameseTones(str) {
    if (str && (str.trim()) && (str.trim() != "")) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g, " ");
        str = str.trim();

        str = str.replace(/!|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\:|{|}|\||\\/g, " ");
        return str;
    } else {
        return ""
    }
}
exports.tranferGioElastic = async(userId) => {
    try {
        let listUser = await Users.find({ idTimViec365: Number(userId), type: 1 }).lean();
        for (let i = 0; i < listUser.length; i++) {
            // console.log(listUser[i].idTimViec365);
            let data = new FormData();
            let obj_save = listUser[i];
            let usc_md5 = "";
            if (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_md5) {
                usc_md5 = obj_save.inForCompany.timviec365.usc_md5;
            };
            if (obj_save.type == 1) {
                data.append('usc_id', obj_save.idTimViec365 || "");
                data.append('usc_email', obj_save.email || "");

                data.append('usc_phone_tk', obj_save.phoneTK ? obj_save.phoneTK : "");
                data.append('usc_name', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_name) ? obj_save.inForCompany.timviec365.usc_name : "");
                data.append('usc_name_add', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_name_add) ? obj_save.inForCompany.timviec365.usc_name_add : "");
                data.append('usc_name_phone', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_name_phone) ? obj_save.inForCompany.timviec365.usc_name_phone : "");
                data.append('usc_name_email', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_name_email) ? obj_save.inForCompany.timviec365.usc_name_email : "");
                data.append('usc_canonical', "");
                data.append('usc_pass', "");
                data.append('usc_company', obj_save.userName || "");
                data.append('usc_name_novn', obj_save.userName ? removeVietnameseTones(obj_save.userName) : "");
                data.append('usc_alias', obj_save.alias || "");
                data.append('usc_md5', usc_md5);
                data.append('usc_redirect', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_redirect) ? obj_save.inForCompany.timviec365.usc_redirect : "");

                data.append('usc_address', obj_save.address || "");
                data.append('usc_phone', obj_save.phone || "");
                data.append('usc_logo', obj_save.avatarUser || "");
                data.append('usc_size', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_size) ? obj_save.inForCompany.timviec365.usc_size : "");
                data.append('usc_website', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_website) ? obj_save.inForCompany.timviec365.usc_website : "");
                data.append('usc_city', obj_save.city || "");
                data.append('usc_qh', obj_save.district || "");
                data.append('usc_create_time', obj_save.createdAt ? Number(obj_save.createdAt).toFixed(0) : "");
                data.append('usc_update_time', obj_save.updatedAt ? Number(obj_save.updatedAt).toFixed(0) : "");
                data.append('usc_update_new', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_update_new) ? obj_save.inForCompany.timviec365.usc_update_new : "");
                data.append('usc_view_count', "");
                data.append('usc_time_login', obj_save.time_login ? Number(obj_save.time_login).toFixed(0) : "");
                data.append('usc_active', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_active) ? obj_save.inForCompany.timviec365.usc_active : "");
                data.append('usc_show', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_show) ? obj_save.inForCompany.timviec365.usc_show : "");
                data.append('usc_mail', "");
                data.append('usc_stop_mail', "");
                data.append('usc_utl', "");
                data.append('usc_ssl', "");
                data.append('usc_mst', "");

                data.append('usc_authentic', obj_save.authentic || "");
                data.append('usc_security', "");
                data.append('usc_lat', "");
                data.append('usc_long', "");
                data.append('usc_ip', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_ip) ? obj_save.inForCompany.timviec365.usc_ip : "");
                data.append('usc_loc', "");
                data.append('usc_kd', (obj_save.inForCompany && obj_save.inForCompany.timviec365) ? obj_save.inForCompany.usc_kd : "");
                data.append('usc_kd_first', (obj_save.inForCompany && obj_save.inForCompany.timviec365) ? obj_save.inForCompany.usc_kd_first : "");
                data.append('usc_mail_app', "");
                data.append('dk', obj_save.fromDevice || 0);
                data.append('usc_xac_thuc', obj_save.otp || "");
                data.append('usc_cc365', "");
                data.append('usc_crm', "");
                data.append('usc_video', "");
                data.append('usc_video_type', "");
                data.append('usc_video_active', "");
                data.append('usc_images', "");

                data.append('usc_active_img', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_active_img) ? obj_save.inForCompany.timviec365.usc_active_img : "");
                data.append('up_crm', "");
                data.append('chat365_id', obj_save.chat365_id || "");
                data.append('chat365_secret', obj_save.chat365_secret || "");
                data.append('usc_block_account', "");
                data.append('usc_stop_noti', "");
                data.append('otp_time_exist', "");
                data.append('id_qlc', obj_save.idQLC || "");
                data.append('use_test', "");
                data.append('usc_badge', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_badge) ? obj_save.inForCompany.timviec365.usc_badge : "");
                data.append('usc_star', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_star) ? obj_save.inForCompany.timviec365.usc_star : "");
                data.append('scan_base365', obj_save.scan_base365 || "");
                data.append('check_chat', obj_save.check_chat || "");
                data.append('usc_vip', (obj_save.inForCompany && obj_save.inForCompany.timviec365 && obj_save.inForCompany.timviec365.usc_vip) ? obj_save.inForCompany.timviec365.usc_vip : "");
                data.append('usc_xacthuc_email', "");
                data.append('usc_manager', "");
                data.append('usc_license', "");
                data.append('usc_active_license', "");
                data.append('usc_license_additional', "");
                data.append('raonhanh365_id', obj_save.idRaoNhanh365 || "");
                data.append('check_raonhanh_id', "");
                data.append('status_dowload_appchat', "");
                data.append('status_dowload_wfchat', "");
                data.append('usc_founding', "");
                data.append('scan_elastic', "");
                data.append('point', "");
                // lấy dữ liệu về điểm 
                let point_usc = 0;
                let ngay_reset_diem_ve_0 = 0;
                let data_point = await Tv365PointCompany.findOne({ usc_id: Number(obj_save.idTimViec365) });
                if (data_point) {
                    point_usc = data_point.point_usc;
                    ngay_reset_diem_ve_0 = data_point.ngay_reset_diem_ve_0 ? Number(data_point.ngay_reset_diem_ve_0).toFixed(0) : "";
                    // console.log(data_point);
                    //console.log(listUser[i].idTimViec365, point_usc, ngay_reset_diem_ve_0)
                }
                data.append('point_usc', point_usc);
                data.append('ngay_reset_diem_ve_0', ngay_reset_diem_ve_0);
                data.append('day_reset_point', "");
                data.append('point_bao_luu', "");
                data.append('chu_thich_bao_luu', "");
                data.append('table', "Users");
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'http://43.239.223.57:9006/add_company',
                    data: data
                };
                //console.log("Cập nhật lại tất", listUser[i].idTimViec365);
                axios.request(config).catch((e) => console.log("Lỗi khi cập nhật dữ liệu"));
                await sleep(40);
                //console.log(response.data);
                //     // return true;
                // }
            }
        };
        return true;
    } catch (e) {
        console.log("tranferGio", e);
        return true;
    }
}

// check title
exports.checkTilte = async(input, list) => {
    const formattedInput = removeAccent(input).toLowerCase()
    const foundKeyword = list.find((keyword) => {
        const formattedKeyword = removeAccent(keyword).toLowerCase()
        return formattedInput.includes(formattedKeyword)
    })

    if (foundKeyword) {
        return false
    } else {
        return true
    }
}

// hàm check title khi update
exports.removeSimilarKeywords = (keyword, arr) => {
    return arr.filter((file) => !file.startsWith(keyword))
}

// hàm mã otp ngẫu nhiên có 6 chữ số
exports.randomNumber = Math.floor(Math.random() * 900000) + 100000
exports.keywordsTilte = ['hot', 'tuyển gấp', 'cần gấp', 'lương cao']

// hàm validate phone
exports.checkPhoneNumber = async(phone) => {
    const phoneNumberRegex = /^(?:\+84|0|\+1)?([1-9][0-9]{8,9})$/
    return phoneNumberRegex.test(phone)
}

// hàm validate email
exports.checkEmail = async(email) => {
    const gmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    return gmailRegex.test(email)
}

// hàm validate link
exports.checkLink = async(link) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/
    return urlRegex.test(link)
}

// hàm validate thơi gian
exports.checkTime = async(time) => {
    const currentTime = new Date() // Lấy thời gian hiện tại
    const inputTime = new Date(time) // Thời gian nhập vào
    console.log(currentTime)
    console.log(inputTime)
    if (inputTime < currentTime) {
        return false
    } else {
        return true
    }
}

// hàm check thời gian đăng tin 10p/1 lần
exports.isCurrentTimeGreaterThanInputTime = (timeInput) => {
    const now = this.getTimeNow()

    const diffInMinutes = (now - timeInput) / 60

    if (diffInMinutes >= 10) {
        return true
    } else {
        return false
    }
}
exports.getDatafindOne = async(model, condition) => {
    return model.findOne(condition).lean()
}

exports.getDatafind = async(model, condition) => {
    return model.find(condition).lean()
}

exports.getDatafindOneAndUpdate = async(model, condition, projection) => {
    return model.findOneAndUpdate(condition, projection)
}

// hàm khi thành công
exports.success = (res, messsage = '', data = []) => {
    return res
        .status(200)
        .json({ data: { result: true, message: messsage, ...data }, error: null })
}

exports.success_v2 = (res, messsage = '', data) => {
    return res
        .status(200)
        .json({ data: { result: true, message: messsage, data }, error: null })
}

exports.success_v2 = (res, messsage = '', data = []) => {
    return res
        .status(200)
        .json({ data: { result: true, message: messsage, data }, error: null })
}

// hàm thực thi khi thất bại
exports.setError = (res, message, code = 500) => {
    return res.status(code).json({ data: null, code, error: { message } })
}

// hàm tìm id max
exports.getMaxID = async(model) => {
    const maxUser =
        (await model.findOne({}, {}, { sort: { _id: -1 } }).lean()) || 0
    return maxUser._id
}

// hàm check định dạng ảnh
const isImage = async(filePath) => {
    const extname = path.extname(filePath).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extname)
}

// hàm check ảnh
exports.checkImage = async(filePath) => {
    if (typeof filePath !== 'string') {
        return false
    }

    const { size } = await promisify(fs.stat)(filePath)
    if (size > MAX_IMG_SIZE) {
        return false
    }

    const isImg = await isImage(filePath)
    if (!isImg) {
        return false
    }

    return true
}

// hàm check video
exports.checkVideo = async(filePath) => {
    // kiểm tra loại file
    if (!allowedTypes.includes(path.extname(filePath.originalname).toLowerCase())) {
        return false
    }
    // kiểm tra kích thước file
    if (filePath.size > MAX_VIDEO_SIZE) {
        return false
    }
    return true
}

exports.getDataDeleteOne = async(model, condition) => {
    return model.deleteOne(condition)
}

// storage để updload file
const storageMain = (destination) => {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            const userId = req.user.data._id // Lấy id người dùng từ request
            const userDestination = `${destination}/${userId}` // Tạo đường dẫn đến thư mục của người dùng
            if (!fs.existsSync(userDestination)) {
                // Nếu thư mục chưa tồn tại thì tạo mới
                fs.mkdirSync(userDestination, { recursive: true })
            }
            cb(null, userDestination)
        },
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            cb(
                null,
                file.fieldname + uniqueSuffix + '.' + file.originalname.split('.').pop()
            )
        },
    })
}

const storageFile = (destination) => {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            let userDestination = ' '
            if (req.user) {
                const userId = req.user.data._id // Lấy id người dùng từ request
                const d = new Date(req.user.data.createdAt * 1000),
                    day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
                    month =
                    d.getMonth() < 10 ? '0' + Number(d.getMonth() + 1) : d.getMonth(),
                    year = d.getFullYear()
                userDestination = `${destination}/${year}/${month}/${day}` // Tạo đường dẫn đến thư mục của người dùng
                if (!fs.existsSync(userDestination)) {
                    // Nếu thư mục chưa tồn tại thì tạo mới
                    fs.mkdirSync(userDestination, { recursive: true })
                }
            } else {
                userDestination = 'public/company'
            }
            cb(null, userDestination)
        },
        fileFilter: function(req, file, cb) {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'video/mp4',
                'video/webm',
                'video/quicktime',
            ]
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error('Only .jpeg, .png, .mp4, .webm and .mov format allowed!'))
            }
        },
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            cb(
                null,
                file.fieldname +
                '-' +
                uniqueSuffix +
                '.' +
                file.originalname.split('.').pop()
            )
        },
    })
}

const storageDocCVTmp = (destination) => {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            let userDestination = destination
            cb(null, userDestination)
        },
        fileFilter: function(req, file, cb) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error('Only .doc format allowed!'))
            }
        },
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            cb(
                null,
                file.fieldname +
                '-' +
                uniqueSuffix +
                '.' +
                file.originalname.split('.').pop()
            )
        },
    })
}

exports.uploadVideoAndIMGNewTV = multer({
    storage: storageFile('public/KhoAnh'),
})

exports.uploadVideoAndIMGRegister = multer({ storage: storageFile('public/company') },
    (fileFilter = function(req, file, cb) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'video/mp4',
            'video/webm',
            'video/quicktime',
        ]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only .jpeg, .png, .mp4, .webm and .mov format allowed!'))
        }
    })
)

//  hàm upload ảnh ở cập nhập avatar
exports.uploadImg = multer({ storage: storageMain('public/KhoAnh') })

//  hàm upload ảnh ở kho ảnh
exports.uploadImgKhoAnh = multer({ storage: storageMain('public/KhoAnh') })

//  hàm upload video ở kho ảnh
exports.uploadVideoKhoAnh = multer({ storage: storageMain('public/KhoAnh') })

// hàm upload video ở cập nhập KhoAnh
exports.uploadVideo = multer({ storage: storageMain('public/KhoAnh') })

//hàm upload file ứng viên
exports.uploadFileUv = multer({
    storage: storageFile('../storage/base365/timviec365/pictures/cv'),
})

// Upload ảnh đại diện
exports.uploadAvatar = multer({
    storage: storageFile('../storage/base365/timviec365/pictures/uv'),
})

//hàm upload file lưu trữ tạm thời CV
exports.uploadFileDocTmpCV = multer({
    storage: storageDocCVTmp('../storage/base365/timviec365/cv365/tmp'),
})

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) throw err
    })
}

// hàm xóa file
exports.deleteImg = async(condition) => {
    if (typeof condition == 'string') {
        return await deleteFile(condition)
    }

    if (typeof condition == 'object') {
        return await deleteFile(condition.path)
    }
}

// storega check file
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/cvUpload')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(
            null,
            file.fieldname +
            uniqueSuffix +
            `.$ { file.originalname.split('.').slice(-1)[0]
}
`
        )
    },
})

// hàm check file
exports.uploadFile = multer({ storage: storageFile })

exports.createError = async(code, message) => {
    const err = new Error()
    err.code = code
    err.message = message
    return { data: null, error: err }
}

// hàm cấu hình mail
const transport = nodemailer.createTransport({
    host: process.env.NODE_MAILER_HOST,
    port: Number(process.env.NODE_MAILER_PORT),
    service: process.env.NODE_MAILER_SERVICE,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    },
})

// hàm gửi mail
exports.sendEmailVerificationRequest = async(otp, email, nameCompany) => {
    let options = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Tìm việc 365 WEB xác thực email',
        html: `
        <body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;"><table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000"><tr style="height: 165px;background-image: url(https://timviec365.vn/images/email/bg1.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
        <img src="https://timviec365.vn/images/email/logo2.png"></td>
        <td style="text-align: left;float: right;">
        <ul style="margin-top: 15px;padding-left: 0px;">
        <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">
        Hiển thị danh sách ứng viên online</span></li>
        <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Nhắn tin trực tiếp ứng viên qua Chat365</span></li><li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Cam kết bảo hành 100%</span></li></ul></td></tr><tr style="float: left;padding:10px 30px 30px 30px;"><td colspan="2"><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin chào <span style="color:#307df1;">${nameCompany}</span></p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Chúc mừng bạn đã hoàn thành thông tin đăng ký tài khoản nhà tuyển dụng tại website Timviec365</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Dưới đây là thông tin tài khoản đã tạo:</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-left: 35px;">- Tài khoản: ${email}</p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-left: 35px;">- Mật khẩu: ****** </p><p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Dưới đây là mã OTP của bạn</p><p style="margin: auto;margin-top: 45px;text-align: center;width: 160px;height: 43px;background:#307df1;border-radius: 5px;font-size: 22px;color: #fff">${otp}</a></p></td></tr><tr style="height: 160px;background-image: url(https://timviec365.vn/images/email/bg2.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;"><td style="padding-top: 50px;"><ul><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;">Liên hệ với chúng tôi để được hỗ trợ nhiều hơn:</span></li><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;">Hotline: <span style="color: #ffa111;">1900633682</span> - ấn phím 1</span></li><li style="list-style-type: none;color: #fff;margin-bottom: 5px;"><span style="font-size: 18px;line-height: 18px;color: #ffa111;">Trân trọng !</span></li></ul></td></tr></table></body>
        `,
    }
    transport.sendMail(options, (err, info) => {
        if (err) {
            console.log(err)
        } else {}
    })
}

exports.verifyPassword = async(inputPassword, hashedPassword) => {
    const md5Hash = crypto.createHash('md5').update(inputPassword).digest('hex')
    return md5Hash === hashedPassword
}

exports.createMd5 = (password) => {
    return crypto.createHash('md5').update(password).digest('hex')
}

// hàm check token
exports.checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Missing token' })
    }
    jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }
        req.user = user
        next()
    })
}

// ham check admin rao nhanh 365
exports.isAdminRN365 = async(req, res, next) => {
    let user = req.user.data
    let admin = await functions.getDatafindOne(AdminUserRaoNhanh365, {
        _id: user._id,
        isAdmin: 1,
        active: 1,
    })
    if (admin) return next()
    return res.status(403).json({ message: 'is not admin RN365' })
}

const checkTokenV3 = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Missing token' })
    }
    jwt.verify(token, process.env.NODE_SERCET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }
        req.user = user
        next()
    })
}

// hàm tạo token
exports.createToken = async(data, time) => {
    return jwt.sign({ data }, process.env.NODE_SERCET, { expiresIn: time })
}

// hàm lấy data từ axios
exports.getDataAxios = async(url, condition, timeout = undefined) => {
    return await axios({
        timeout: timeout,
        method: 'post',
        url: url,
        data: condition,
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(async(response) => {
        return response.data
    })
}

// hàm lấy dữ liệu ngành nghề
exports.getDataCareer = async() => {
    return [
        'An toàn lao động',
        'Báo chí - Truyền hình',
        'Bảo hiểm',
        'Bảo trì',
        'Bảo vệ',
        'Biên - Phiên dịch',
        'Bưu chính viễn thông',
        'Chăm sóc khách hàng',
        'Chăn nuôi - Thú y',
        'Cơ khí - Chế tạo',
        'Công chức - Viên chức',
        'Công nghệ cao',
        'Công nghệ thực phẩm',
        'copywrite',
        'Dầu khí - Địa chất',
        'Dệt may - Da dày',
        'Dịch vụ',
        'Du lịch',
        'Freelancer',
        'Giáo dục - Đào tạo',
        'Giao thông vận tải -Thủy lợi - Cầu đường',
        'Giúp việc',
        'Hàng hải',
        'Hàng không',
        'Hành chính - Văn phòng',
        'Hóa học - Sinh học',
        'Hoạch định - Dự án',
        'In ấn - Xuất bản',
        'IT phần cứng - mạng',
        'IT phần mềm',
        'KD bất động sản',
        'Kế toán - Kiểm toán',
        'Khánh sạn - Nhà hàng',
        'Khu chế xuất - Khu công nghiệp',
        'Kiến trúc - Tk nội thất',
        'Kỹ thuật',
        'Kỹ thuật ứng dụng',
        'Làm đẹp - Thể lực - Spa',
        'Lao động phổ thông',
        'Lễ tan - PG - PB',
        'Logistic',
        'Luật - Pháp lý',
        'Lương cao',
        'Marketing - PR',
        'Môi trường - Xử lý chất thải',
        'Mỹ phẩm - Thời trang - Trang sức',
        'Ngân hàng - chứng khoán - Đầu tư',
        'Nghệ thuật - Điện ảnh',
        'Nhân sự',
        'Kinh doanh',
        'Nhập liệu',
        'Nông - Lâm - Ngư - Nghiệp',
        'Ô tô - Xe máy',
        'Pha chế - Bar',
        'Phát triển thị trường',
        'Phục vụ - Tạp vụ',
        'Quan hệ đối ngoại',
        'Quản lý điều hành',
        'Quản lý đơn hàng',
        'Quản trị kinh doanh',
        'Sản xuất - Vận hành sản xuất',
        'Sinh viên làm thêm',
        'StarUp',
        'Tài chính',
        'Telesales',
        'Thẩm định - Giảm thẩm định - Quản lý chất lượng',
        'Thể dục - Thể thao',
        'Thiết kế - Mỹ thuật',
        'Thiết kế web',
        'Thống kê',
        'Thư ký - Trợ lý',
        'Thu Ngân',
        'Thư viện',
        'Thực phẩm - Đồ uống',
        'Thương Mại điện tử',
        'Thủy Sản',
        'Thị trường - Quảng cáo',
        'Tìm việc làm thêm',
        'Tổ chức sự kiện',
        'Trắc địa',
        'Truyển thông',
        'Tư vấn',
        'Vận chuyển giao nhận',
        'Vận tải - Lái xe',
        'Vật tư - Thiết bị',
        'Việc làm bán hàng',
        'Việc làm Tết',
        'Xây dựng',
        'Xuất - nhập khẩu',
        'Xuất khẩu lao động',
        'Y tế - Dược',
        'Đầu bếp - phụ bếp',
        'Điện - Điện tử',
        'Điện tử viễn thông',
        'ngàng nghề khác',
    ]
}

// hàm lấy dữ liệu hình thức làm việc
exports.getDataWorkingForm = async() => {
    return [
        'Toàn thời gian cố định',
        'Toàn thời gian tạm thời',
        'Bán thời gian',
        'Bán thời gian tạm thời',
        'Hợp đồng',
        'Việc làm từ xa',
        'Khác',
    ]
}

// hàm lấy dữ liệu cấp bậc làm việc
exports.getDataWorkingRank = async() => {
    return [
        'Mới tốt nghiệp',
        'Thực tập sinh',
        'Nhân viên',
        'Trưởng nhóm',
        'Phó tổ trưởng',
        'Tổ trưởng',
        'Phó trưởng phòng',
        'Trưởng phòng',
        'Phó giám đốc',
        'Giám đóc',
        'Phó tổng giám đốc',
        'Tổng giám đốc',
        'Quản lý cấp trung',
        'Quản lý cấp cao',
    ]
}

// hàm lấy dữ liệu kinh nghiệm làm việc
exports.getDataEXP = async() => {
        return [
            'Không yêu cầu',
            'Chưa có kinh nghiệm',
            '0 - 1 năm kinh nghiệm',
            'Hơn 1 năm kinh nghiệm',
            'Hơn 2 năm kinh nghiệm',
            'Hơn 5 năm kinh nghiệm',
            'Hơn 10 năm kinh nghiệm',
        ]
    }
    // hàm lấy dữ liệu bằng cấp làm việc
exports.getDataDegree = async() => {
    return [
        'Không yêu cầu',
        'Đại học trở lên',
        'Cao đẳng trở lên',
        'THPT trở lên',
        'Trung học trở lên',
        'Chứng chỉ',
        'Trung cấp trở lên',
        'Cử nhân trở lên',
        'Thạc sĩ trở lên',
        'Thạc sĩ Nghệ thuật',
        'Thạc sĩ Thương mại',
        'Thạc sĩ Khoa học',
        'Thạc sĩ Kiến trúc',
        'Thạc sĩ QTKD',
        'Thạc sĩ Kỹ thuật ứng dụng',
        'Thạc sĩ Luật',
        'Thạc sĩ Y học',
        'Thạc sĩ Dược phẩm',
        'Tiến sĩ',
        'Khác',
    ]
}

// hàm lấy dữ liệu giới tính làm việc
exports.getDataSex = async() => {
    return ['Nam', 'Nữ', 'Không yêu cầu']
}

exports.pageFind = async(model, condition, sort, skip, limit, select) => {
    return model.find(condition, select).sort(sort).skip(skip).limit(limit).lean()
}

exports.pageFindWithFields = async(
    model,
    condition,
    fields,
    sort,
    skip,
    limit
) => {
    return model.find(condition, fields).sort(sort).skip(skip).limit(limit).lean()
}

// lấy danh sách mẫu CV sắp xếp mới nhất
exports.getDataCVSortById = async(condition) => {
    const data = await CV.find(condition)
        .select(
            '_id image name alias price status view love download lang_id design_id cate_id colors'
        )
        .sort({ _id: -1 })
    if (data.length > 0) {
        return data
    }
    return null
}

// lấy danh sách mẫu CV sắp xếp lượt tải nn
exports.getDataCVSortByDownload = async(condition) => {
    const data = await CV.find(condition)
        .select(
            '_id image name alias price status view love download lang_id design_id cate_id colors'
        )
        .sort({ download: -1 })
    if (data.length > 0) {
        return data
    }
    return null
}

//hàm kiểm tra string có phải number không
exports.checkNumber = async(string) => {
    return !isNaN(string)
}

//hàm phân trang có chọn lọc những trường dc hiển thị
exports.pageFindV2 = async(model, condition, select, sort, skip, limit) => {
    return model.find(condition, select).sort(sort).skip(skip).limit(limit)
}

//hàm check xem có truyền vào token hay không
exports.checkTokenV2 = async(req, res, next) => {
    if (req.headers.authorization) {
        checkTokenV3(req, res, next)
    } else {
        next()
    }
}

// hàm dém count
exports.findCount = async(model, filter) => {
        try {
            const count = await model.countDocuments(filter)
            return count
        } catch (error) {
            console.error(error)
            throw error
        }
    }
    //base64 decrypt image
exports.decrypt = async(req, res, next) => {
    const base64 = req.body.base64
    req.file = Buffer.from(base64, 'base64').toString('utf-8')
    return next()
}
exports.thresholds = [
        { minValue: 1000000, maxValue: 3000000, money: 2 },
        { minValue: 3000000, maxValue: 5000000, money: 3 },
        { minValue: 5000000, maxValue: 7000000, money: 4 },
        { minValue: 7000000, maxValue: 10000000, money: 5 },
        { minValue: 10000000, maxValue: 15000000, money: 6 },
        { minValue: 15000000, maxValue: 20000000, money: 7 },
        { minValue: 20000000, maxValue: 30000000, money: 8 },
        { minValue: 30000000, maxValue: 50000000, money: 9 },
        { minValue: 50000000, maxValue: 100000000, money: 10 },
        { minValue: 100000000, maxValue: Infinity, money: 11 },
    ]
    //hàm tìm kiếm finduser với idtimviec và type = 0 hoặc 2
exports.findUser = async(userId, select, sort, skip, limit) => {
    return Users.find({
            $or: [{
                    idTimViec365: userId,
                    type: 0,
                },
                {
                    idTimViec365: userId,
                    type: 2,
                },
            ],
        }, { select })
        .sort(sort)
        .skip(skip)
        .limit(limit)
}

//hàm tìm kiếm findOneuser với idtimviec và type = 0 hoặc 2
exports.findOneUser = async(userId, select) => {
    return Users.findOne({
            $or: [{
                    idTimViec365: userId,
                    type: 0,
                },
                {
                    idTimViec365: userId,
                    type: 2,
                },
            ],
        },
        select
    ).lean()
}

//hàm tìm kiếm và cập nhật user với id timviec và type =0 hoặc type =2
exports.findOneAndUpdateUser = async(userId, projection) => {
    return Users.findOneAndUpdate({
            $or: [{
                    idTimViec365: userId,
                    type: 0,
                },
                {
                    idTimViec365: userId,
                    type: 2,
                },
            ],
        },
        projection
    )
}

exports.getUrlLogoCompany = (createTime, logo) => {
    try {
        if (logo != null && logo != '') {
            return `${process.env.cdn}/pictures/${this.convertDate(
                createTime,
                true
            )}/${logo}`
        } else {
            return logo
        }
    } catch (error) {
        console.log(error)
    }
}

exports.getTokenUser = async(req, res) => {
    let user = null

    if (req.headers.authorization) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token) {
            jwt.verify(token, process.env.NODE_SERCET, (err, result) => {
                if (!err) {
                    user = result.data
                }
            })
        }
    }
    return user
}

// hàm tạo link file rao nhanh 365
exports.createLinkFileRaonhanh = (folder, id, name) => {
        let link =
            process.env.DOMAIN_RAO_NHANH +
            '/base365/raonhanh365/pictures/' +
            folder +
            '/' +
            id +
            '/' +
            name
        return link
    }
    // hàm kiểm tra đầu vào có phải ngày không
exports.checkDate = (date) => {
    let data = new Date(date)
    return data instanceof Date && !isNaN(data)
}

exports.uploadFileBase64RaoNhanh = async(folder, id, base64String, file) => {
    let path1 = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/`
        // let filePath = `../Storage/base365/raonhanh365/pictures/${folder}/${id}/` + file.name;
    if (!fs.existsSync(path1)) {
        fs.mkdirSync(path1, { recursive: true })
    }
    var matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (matches.length !== 3) {
        return false
    }

    let type = matches[1]
    let data = Buffer.from(matches[2], 'base64')

    const imageName = `${Date.now()}.${type.split('/')[1]}`
    fs.writeFile(path1 + imageName, data, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

// hàm tìm id max Quản Lí Chung
exports.getMaxIDQLC = async(model) => {
        const maxUser =
            (await model.findOne({}, {}, { sort: { idQLC: -1 } }).lean()) || 0
        return maxUser.idQLC
    }
    // hàm tìm idcompany max
exports.getMaxIDcompany = async(model) => {
    const maxIDcompany =
        (await model.findOne({}, {}, { sort: { companyId: -1 } }).lean()) || 0
    return maxIDcompany.companyId
}

//upload image cv,don, thu, syll

exports.uploadAndCheckPathIMG = async(userId, imageFile, category) => {
    try {
        // upload
        const timestamp = Date.now()
        const imagePath = await fsPromises.readFile(imageFile.path)
        const uploadDir = `../Storage/TimViec365/${userId}/${category}`
        const uploadFileName = `${timestamp}_${imageFile.originalFilename}`
        const uploadPath = path.join(uploadDir, uploadFileName)
        await fsPromises.mkdir(uploadDir, { recursive: true })
        await fsPromises.writeFile(uploadPath, imagePath)
            // tìm và chuyển img sang pdf
        await fsPromises.access(uploadPath)
        const pdfPath = path.join(uploadDir, `${uploadFileName.slice(0, -4)}.pdf`)
        const doc = new PDFDocument()
        const stream = fs.createWriteStream(pdfPath)

        doc.pipe(stream)
        doc.image(uploadPath, 0, 0, { fit: [612, 792] })
        doc.end()

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve)
            stream.on('error', reject)
        })

        return {
            status: 'EXIT',
            nameImage: uploadFileName,
            imgPath: uploadPath,
            pdfPath: pdfPath,
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            return 'ENOENT'
        } else {
            return error.message
        }
    }
}

// hàm  xóa  ảnh và video khi upload thất bại
exports.deleteImgVideo = async(avatar = undefined, video = undefined) => {
    if (avatar) {
        avatar.forEach(async(element) => {
            await this.deleteImg(element)
        })
    }
    if (video) {
        video.forEach(async(element) => {
            await this.deleteImg(element)
        })
    }
}

//thay thế các kí tự đặc biệt trong tiêu đề
exports.replaceKeywordSearch = async(lower, keyword) => {
    if (lower === 1) {
        keyword = keyword.toLowerCase()
    }
    const arrRep = [
        "'",
        '"',
        '-',
        '\\+',
        '=',
        '\\*',
        '\\?',
        '\\/',
        '!',
        '~',
        '#',
        '@',
        '%',
        '$',
        '\\^',
        '&',
        '\\(',
        '\\)',
        ';',
        ':',
        '\\\\',
        '\\.',
        ',',
        '\\[',
        '\\]',
        '{',
        '}',
        '‘',
        '’',
        '“',
        '”',
        '<',
        '>',
    ]
    keyword = arrRep.reduce((str, rep) => {
        return str.replace(new RegExp(rep, 'g'), ' ')
    }, keyword)
    keyword = keyword.replace(/ {2,}/g, ' ')
    return keyword
}

exports.replaceMQ = async(text) => {
    text = text.replace(/\\'/g, "'")
    text = text.replace(/'/g, '')
    text = text.replace(/\\/g, '')
    text = text.replace(/"/g, '')
    return text
}

//bỏ những từ khóa trong tiêu đề
exports.removerTinlq = async(string) => {
    var arr_remove = [
        'lương',
        'nhân',
        'trình',
        'viên',
        'chuyên',
        'cao',
        'tuyển',
        'dụng',
        'hấp',
        'dẫn',
        'chi',
        'tiết',
        'công',
        'ty',
        'tnhh',
        'sx',
        'tm',
        'dv',
        'phòng',
        'tại',
        'biết',
        'về',
    ]
    var result = arr_remove.reduce(function(str, remove) {
        return str.replace(new RegExp(remove, 'gi'), '')
    }, string)

    result = result.trim().replace(/\s+/g, ' ') // Loại bỏ khoảng trắng dư thừa

    return result
}

exports.getMaxUserID = async(type = 'user') => {
    let condition = {};
    if (type == 'user') {
        condition = { type: { $ne: 1 } };
    } else {
        condition = { type: 1 };
    }
    // ID Chat
    const maxID = await Users.findOne({}, { _id: 1 })
        .sort({ _id: -1 })
        .limit(1)
        .lean();
    if (maxID) {
        _id = Number(maxID._id) + 1;
    } else _id = 1;

    // ID timviec365
    const maxIDTimviec = await Users.findOne(condition, { idTimViec365: 1 })
        .sort({ idTimViec365: -1 })
        .lean();
    if (maxIDTimviec) {
        _idTV365 = Number(maxIDTimviec.idTimViec365) + 1;
    } else _idTV365 = 1;

    // ID chuyển đổi số
    const maxIdQLC = await Users.findOne(condition, { idQLC: 1 })
        .sort({ idQLC: -1 })
        .lean();
    if (maxIdQLC) {
        _idQLC = Number(maxIdQLC.idQLC) + 1;
    } else _idQLC = 1;

    // ID raonhanh365
    const maxIdRN365 = await Users.findOne(condition, { idRaoNhanh365: 1 })
        .sort({ idRaoNhanh365: -1 })
        .lean();
    if (maxIdRN365) {
        _idRN365 = Number(maxIdRN365.idRaoNhanh365) + 1;
    } else _idRN365 = 1;

    // ID GiaSu
    const maxIdGiaSu = await Users.findOne(condition, { idGiaSu: 1 }).sort({ idGiaSu: -1 }).lean();
    if (maxIdGiaSu) {
        _idGiaSu = Number(maxIdGiaSu.idGiaSu) + 1 || 1;
    } else _idGiaSu = 1;

    return { _id, _idTV365, _idQLC, _idRN365, _idGiaSu }
};

const hostImage = () => {
    return 'https://cdn.timviec365.vn'
}

exports.hostCDN = () => {
    return hostImage()
}

exports.getPictureBlogTv365 = (picture) => {
    return hostImage() + '/pictures/news/' + picture
}

exports.getPictureCv = (picture) => {
    return hostImage() + '/cv365/upload/cv/thumb/' + picture
}

exports.getPictureAppli = (picture) => {
    return hostImage() + '/cv365/upload/donxinviec/thumb/' + picture
}

exports.getPictureLetter = (picture) => {
    return hostImage() + '/cv365/upload/letter/thumb/' + picture
}

exports.getPictureResume = (picture) => {
    return hostImage() + '/cv365/upload/hoso/thumb/' + picture
}

exports.clean_sp = (string) => {
    var arr_str = ['<', '>', '/']
    var string = string.replace(new RegExp(arr_str.join('|'), 'g'), ' ')
    var array = {
        '    ': ' ',
        '   ': ' ',
        '  ': ' ',
    }
    string = string.trim().replace(/ {2,}/g, function(match) {
        return array[match]
    })
    return string
}

exports.processBase64 = async(userId, nameImage, base64String) => {
    const dir = `../storage/base365/timviec365/cv365/upload/ungvien/uv_${userId}`

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    // Đường dẫn tới nơi bạn muốn lưu ảnh
    const outputPath = `${dir}/${nameImage}.jpg`

    // Xóa đầu mục của chuỗi Base64 (ví dụ: "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

    // Giải mã chuỗi Base64 thành dữ liệu nhị phân
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Ghi dữ liệu nhị phân vào tệp ảnh
    fs.writeFile(outputPath, imageBuffer, (error) => {
        if (error) {
            console.error('Lỗi khi ghi tệp ảnh')
            return false
        }
    })
    const checkImage = await this.checkImage(outputPath)

    return checkImage
}

// hàm random
exports.getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

exports.new_money_tv = async(
    nm_id,
    nm_type,
    nm_unit,
    nm_min_value,
    nm_max_value,
    new_money
) => {
    let array_muc_luong = [
        'Chọn mức lương',
        'Thỏa thuận',
        '1 - 3 triệu',
        '3 - 5 triệu',
        '5 - 7 triệu',
        '7 - 10 triệu',
        '10 - 15 triệu',
        '15 - 20 triệu',
        '20 - 30 triệu',
        'Trên 30 triệu',
        'Trên 50 triệu',
        'Trên 100 triệu',
    ]
    let array_tien_te = {
        1: 'VNĐ',
        2: 'USD',
        3: 'EUR',
    }
    if (nm_id !== '') {
        var rd_muc_luong = ''
        switch (nm_type) {
            case 2:
                rd_muc_luong =
                    'Từ ' + formatMoney(nm_min_value) + ' ' + array_tien_te[nm_unit]
                break
            case 3:
                rd_muc_luong =
                    'Đến ' + formatMoney(nm_max_value) + ' ' + array_tien_te[nm_unit]
                break
            case 4:
                rd_muc_luong =
                    'Từ ' +
                    formatMoney(nm_min_value) +
                    ' ' +
                    array_tien_te[nm_unit] +
                    ' Đến ' +
                    formatMoney(nm_max_value) +
                    ' ' +
                    array_tien_te[nm_unit]
                break
            default:
                rd_muc_luong = array_muc_luong[new_money]
                break
        }
    } else {
        rd_muc_luong = array_muc_luong[new_money]
    }
    if (rd_muc_luong === '' || rd_muc_luong === 'Chọn mức lương') {
        rd_muc_luong = 'Thỏa Thuận'
    }
    return rd_muc_luong
}

exports.hostCvUvUpload = async(userid, image) => {
    return `${hostImage()}/upload/ungvien/uv_${userid}/${image}.jpg`
}

exports.siteName = () => {
    return 'https://dev.timviec365.vn'
}

exports.renderCDNImage = (content) => {
    if (content != '') {
        return content.replaceAll('src="', 'src="' + hostImage())
    }
    return content
}

exports.imageCv = (createTime, name_img) => {
    return `${process.env.cdn}/pictures/cv/${this.convertDate(
        createTime,
        true
    )}/${name_img}.png`
}

exports.getTimeNow = () => {
    return Math.floor(Date.now() / 1000)
}

exports.folderUploadImageAvatar = (createTime) => {
    return `../storage/base365/timviec365/pictures/uv/${this.convertDate(
        createTime,
        true
    )}/`
}

exports.cdnImageAvatar = (createTime) => {
    const time = new Date(createTime),
        y = time.getFullYear()
    let d = time.getDate()
    d = d < 10 ? '0' + d : d
    let m = time.getMonth() + 1
    m = m < 10 ? '0' + m : m
    return `${hostImage()}/pictures/uv/${y}/${m}/${d}/`
}

exports.getImageUv = (createTime, logo) => {
    if (logo != '' && logo != null) {
        return `${process.env.cdn}/pictures/uv/${this.convertDate(
            createTime,
            true
        )}/${logo}`
    }
    return ''
}

exports.convertDate = (time = null, revert = false) => {
    let date
    if (time != null) {
        date = new Date(time * 1000)
    } else {
        date = new Date()
    }
    const y = date.getFullYear()
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let m = date.getMonth() + 1
    m = m < 10 ? '0' + m : m
    if (!revert) {
        return `${d}/${m}/${y}`
    } else {
        return `${y}/${m}/${d}`
    }
}

exports.formatMoney = (number, fractional = false) => {
    if (fractional) {
        number = parseFloat(number).toFixed(2)
    }
    while (true) {
        const replaced = number.replace(/(-?\d+)(\d\d\d)/, '$1.$2')
        if (replaced !== number) {
            number = replaced
        } else {
            break
        }
    }
    return number
}

exports.chat365_secret = (id_chat) => {
    return Buffer.from(id_chat.toString()).toString('base64')
}

//lay ra max id dua vao model va truong muon lay
exports.getMaxIdByField = async(model, field) => {
    let maxId = await model
        .findOne({}, {
            [field]: 1,
        })
        .sort({
            [field]: -1,
        })
        .limit(1)
        .lean()
    if (maxId) {
        maxId = Number(maxId[`${field}`]) + 1
    } else maxId = 1
    return maxId
}

//chuyen thoi gian ve dang int
exports.convertTimestamp = (date) => {
    let time = new Date(date)
    return Math.round(time.getTime() / 1000)
}

exports.renderAlias = (text) => {
    return slugify(text, {
        replacement: '-', // Ký tự thay thế khoảng trắng và các ký tự đặc biệt
        lower: true, // Chuyển thành chữ thường
        strict: true, // Loại bỏ các ký tự không hợp lệ
    })
}

exports.fileType = (file) => {
    return file.originalFilename.split('.').pop()
}

exports.uploadLicense = async(userId, file) => {
    try {
        const timestamp = Date.now()
        const data = await fsPromises.readFile(file.path)
        const parentDir = path.resolve(process.cwd(), '..')
        const uploadDir = path.join(
            parentDir,
            `/storage/base365/timviec365/license/${userId}`
        )
        const uploadFileName = `${timestamp}_${file.originalFilename}`
        const uploadPath = path.join(uploadDir, uploadFileName)
        await fsPromises.mkdir(uploadDir, { recursive: true })
        await fsPromises.writeFile(uploadPath, data)

        return uploadFileName
    } catch (error) {
        console.log(error)
        return null
    }
}

exports.getLicenseURL = async(userId, filename) => {
    return `${process.env.cdn}/timviec365/license/${userId}/${filename}`
}

exports.arrayUnique = (arr) => {
    if (!Array.isArray(arr)) {
        throw new Error('Input must be an array')
    }

    const uniqueSet = new Set(arr)
    const uniqueArray = Array.from(uniqueSet)

    return uniqueArray
}

exports.timeElapsedString = (ptime) => {
    const etime = this.getTimeNow() - ptime

    if (etime < 1) {
        return '0 giây'
    }

    const a = {
        31536000: 'năm',
        2592000: 'tháng',
        86400: 'ngày',
        3600: 'giờ',
        60: 'phút',
        1: 'giây',
    }
    const aPlural = {
        năm: 'năm',
        tháng: 'tháng',
        ngày: 'ngày',
        giờ: 'giờ',
        phút: 'phút',
        giây: 'giây',
    }

    for (const secs in a) {
        const d = etime / secs
        if (d >= 1) {
            const r = Math.round(d)
            return `${r} ${r > 1 ? aPlural[a[secs]] : a[secs]} trước`
        }
    }
}

exports.encryptDecrypt = (input, action = 'encrypt') => {
    const encryptMethod = 'aes-256-cbc'
    const secretKey = 'AA74CDDC2BBRT935136EE0B63C27'
    const secretIV = 'Ofgf5HJ6g29'
    const key = crypto.createHash('sha256').update(secretKey).digest('hex')
    const iv = Buffer.from(secretIV, 'utf8').slice(0, 16)

    if (action === 'encrypt') {
        const cipher = crypto.createCipheriv(
            encryptMethod,
            Buffer.from(key, 'hex'),
            iv
        )
        let encrypted = cipher.update(input, 'utf8', 'base64')
        encrypted += cipher.final('base64')
        return encrypted
    } else if (action === 'decrypt') {
        const decipher = crypto.createDecipheriv(
            encryptMethod,
            Buffer.from(key, 'hex'),
            iv
        )
        let decrypted = decipher.update(
            Buffer.from(input, 'base64'),
            'binary',
            'utf8'
        )
        decrypted += decipher.final('utf8')
        return decrypted
    }

    return null
}

exports.getLinkChat365 = (idChat, ctIdChat, secret = '') => {
    if (idChat > 0) {
        if (idChat !== ctIdChat) {
            let linkChat = `https://chat365.timviec365.vn/chat-u${this.encryptDecrypt(
                idChat,
                'encrypt'
            )}-c${this.encryptDecrypt(ctIdChat, 'encrypt')}-timviec365.vn`
            if (secret !== '') {
                linkChat = `https://chat365.timviec365.vn/chat-u${this.encryptDecrypt(
                    idChat,
                    'encrypt'
                )}-c${this.encryptDecrypt(ctIdChat, 'encrypt')}-timviec365.vn-${secret}`
            }
            return linkChat
        } else {
            return 'https://chat365.timviec365.vn'
        }
    } else {
        return ''
    }
}

exports.checkAuthentic = async(req, res, next) => {
    try {
        if (!req.user || !req.user.data || !req.user.data._id)
            return this.setError(res, 'Tài khoản chưa xác thực!', 403)
        let user = await Users.findOne({ _id: req.user.data._id, authentic: 1 })
        if (!user) return this.setError(res, 'Tài khoản chưa xác thực!', 403)
        return next()
    } catch (error) {
        return this.setError(res, 'Đã xảy ra lỗi!', 500)
    }
}

// Render file pdf
exports.renderPdfFromUrl = async(link) => {
    try {
        const browser = await puppeteer.launch({
            headless: 'chrome',
            args: [
                '--no-sandbox',
                '--disabled-setupid-sandbox',
                '--font-render-hinting=none',
                '--force-color-profile=srgb',
                '--disable-web-security',
            ],
        })
        const page = await browser.newPage()
        const session = await page.target().createCDPSession()
        await session.send('DOM.enable')
        await session.send('CSS.enable')
        const website_url = link
            // Open URL in current page
        await page.goto(website_url, { waitUntil: 'networkidle2' }) // 2s, font hiển thị đúng
        await page.emulateMediaType('screen')
        await page.evaluateHandle('document.fonts.ready')
            // Downlaod the PDF
        let pdf = await page
            .pdf({
                margin: { top: '50px', right: '0px', bottom: '0px', left: '0px' },
                printBackground: true,
            })
            .then(function(data) {
                return data
            })
        await browser.close()
        return {
            result: true,
            file: pdf,
        }
    } catch (e) {
        return {
            result: false,
            message: e.message,
        }
    }
}

// Render file ảnh
exports.renderImageFromUrl = async(link) => {
    try {
        const docHeight = () => {
            const body = document.body
            const html = document.documentElement
            return Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            )
        }
        const browser = await puppeteer.launch({
            headless: 'chrome',
            args: [
                '--no-sandbox',
                '--disabled-setupid-sandbox',
                '--font-render-hinting=none',
                '--force-color-profile=srgb',
                '--disable-web-security',
            ],
        })

        const page = await browser.newPage()
        const website_url = link
            // Open URL in current page
        await page.goto(website_url, { waitUntil: 'networkidle2' }) // 2s, font hi?n th? d�ng
        const height = await page.evaluate(docHeight)
            //To reflect CSS used for screens instead of print
        await page.emulateMediaType('screen')
        let image = await page.screenshot({
            height: `${height}px`,
            fullPage: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        })
        await browser.close()
        return {
            result: true,
            file: image,
        }
    } catch (e) {
        return {
            result: false,
            message: e.message,
        }
    }
}

//Gửi OTP nhà mạng
exports.sendOtpFee = async(phoneTK, otp) => {
    return await axios({
        method: 'post',
        url: 'http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/',
        data: `{
            "ApiKey": "B4AC997EA37B66E821AA87556E98A6",
            "Content": "TIMVIEC365 bạn đã lấy lại MK tại https://timviec365.vn/ mã OTP: ${otp}",
            "Phone": "${phoneTK}",
            "SecretKey": "80A7A1845725B74E5766A5BFB0B167",
            "IsUnicode": "1",
            "Brandname": "TIMVIEC365",
            "SmsType": "2"
        }`,
        headers: { 'Content-Type': 'application/json' },
    }).then(async(response) => {
        return response.data
    })
}

exports.get_client_ip = (req) => {
    let forwardedIpsStr = req.header('x-forwarded-for')
    let ip = ''
    if (forwardedIpsStr) {
        ip = forwardedIpsStr.split(',')[0]
    } else {
        ip = req.socket.remoteAddress
    }
    return ip
}

// Giao việc
// DD/MM/YYYY HH:MM
exports.replaceDay = (day) => {
    const pattern = /(\d{2})\-(\d{2})\-(\d{4})/
    const dt = new Date(day.replace(pattern, '$3-$2-$1'))
    return dt
}

exports.fileSize = (path) => {
    try {
        return fs.statSync(path).size
    } catch (err) {
        // console.log(err)
        return null
    }
}

exports.convertDateOtherType = (time = null, revert = false) => {
    let date
    if (time != null) {
        date = new Date(time * 1000)
    } else {
        date = new Date()
    }
    const y = date.getFullYear()
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let m = date.getMonth() + 1
    m = m < 10 ? '0' + m : m
    if (!revert) {
        return `${d}-${m}-${y}`
    } else {
        return `${y}-${m}-${d}`
    }
}

exports.getHourNow = () => {
    let d = new Date()
    let h = d.getHours()
    h = h < 10 ? '0' + h : h
    let m = d.getMinutes()
    m = m < 10 ? '0' + m : m
    return `${h}:${m}`
}

//lay ra max id dua vao model va truong muon lay
exports.getMaxIdByFieldWithDeleted = async(model, field) => {
    let maxId = await model
        .findOneWithDeleted({}, {
            [field]: 1,
        })
        .sort({
            [field]: -1,
        })
        .limit(1)
        .lean()
    if (maxId) {
        maxId = Number(maxId[`${field}`]) + 1
    } else maxId = 1
    return maxId
}

exports.getTimeHours = () => {
    const time = new Date()
    const hour = time.getHours().toString().padStart(2, '0')
    const minute = time.getMinutes().toString().padStart(2, '0')
    const second = time.getSeconds().toString().padStart(2, '0')
        // Kết hợp thành định dạng "h:i:s"
    return `${hour}:${minute}:${second}`
}

exports.isNumeric = (str) => {
    if (typeof str != 'string') return false // we only process strings!
    return (!isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str))
        ) // ...and ensure strings of whitespace fail
}

exports.list_de_xuat = async(comId) => {
    try {
        const list_de_xuat = [{
                id: 1,
                dexuat_id: 1,
                dexuat_name: 'Đơn xin nghỉ phép',
                comId: comId,
            },
            {
                id: 2,
                dexuat_id: 2,
                dexuat_name: 'Đơn xin đổi ca',
                comId: comId,
            },
            {
                id: 3,
                dexuat_id: 3,
                dexuat_name: 'Đơn tạm ứng ',
                comId: comId,
            },
            {
                id: 4,
                dexuat_id: 4,
                dexuat_name: 'Đơn xin cấp phát tài sản',

                comId: comId,
            },
            {
                id: 5,
                dexuat_id: 5,
                dexuat_name: 'Đơn xin thôi việc',

                comId: comId,
            },
            {
                id: 6,
                dexuat_id: 6,
                dexuat_name: 'Đề xuất tăng lương',

                comId: comId,
            },
            {
                id: 7,
                dexuat_id: 7,
                dexuat_name: 'Đề xuất bổ nhiệm',
                comId: comId,
            },
            {
                id: 8,
                dexuat_id: 8,
                dexuat_name: 'Đề xuất luân chuyển công tác',
                comId: comId,
            },
            {
                id: 9,
                dexuat_id: 9,
                dexuat_name: 'Đề xuất tham gia dự án',
                comId: comId,
            },
            {
                id: 10,
                dexuat_id: 10,
                dexuat_name: 'Đề xuất xin tăng ca',
                comId: comId,
            },
            {
                id: 11,
                dexuat_id: 11,
                dexuat_name: 'Đề xuất xin nghỉ chế độ thai sản',
                comId: comId,
            },
            {
                id: 12,
                dexuat_id: 12,
                dexuat_name: 'Đề xuất đăng ký sử dụng phòng họp',
                comId: comId,
            },
            {
                id: 13,
                dexuat_id: 13,
                dexuat_name: 'Đề xuất đăng ký sử dụng xe công',
                comId: comId,
            },
            {
                id: 14,
                dexuat_id: 14,
                dexuat_name: 'Đề xuất sửa chữa tài sản cấp phát',
                comId: comId,
            },
            {
                id: 15,
                dexuat_id: 15,
                dexuat_name: 'Đề xuất thanh toán',
                comId: comId,
            },
            {
                id: 16,
                dexuat_id: 16,
                dexuat_name: 'Đề xuất khiếu nại',
                comId: comId,
            },
            {
                id: 17,
                dexuat_id: 17,
                dexuat_name: 'Đề xuất cộng công',
                comId: comId,
            },
            {
                id: 18,
                dexuat_id: 18,
                dexuat_name: 'Đề xuất lịch làm việc',
                comId: comId,
            },
            {
                id: 19,
                dexuat_id: 19,
                dexuat_name: 'Đề xuất thưởng phạt',
                comId: comId,
            },
            {
                id: 20,
                dexuat_id: 20,
                dexuat_name: 'Đề xuất hoa hồng doanh thu',
                comId: comId,
            },
            {
                id: 21,
                dexuat_id: 21,
                dexuat_name: 'Đề xuất Đi sớm về muộn',
                comId: comId,
            },
            {
                id: 22,
                dexuat_id: 22,
                dexuat_name: 'Đơn xin nghỉ phép ra ngoài',
                comId: comId,
            },
            {
                id: 23,
                dexuat_id: 23,
                dexuat_name: 'Đề xuất nhập ngày nhận lương',
                comId: comId,
            },
            {
                id: 24,
                dexuat_id: 24,
                dexuat_name: 'Đề xuất xin tải tài liệu',
                comId: comId,
            },
        ]
        await SettingPropose.insertMany(list_de_xuat)
        return 1
    } catch (error) {
        console.log(error.message)
        return 1
    }
}

//Lấy ánh Blog
exports.saveImg = (img, name) => {


    let imgName = ''
    if (name) imgName = '-' + name;
    let pathnameSplit
    pathnameSplit = __dirname
        .split('/')
        .filter((item) => item !== '')
        .slice(0, -2)
    if (pathnameSplit && pathnameSplit.length === 0)
        pathnameSplit = __dirname
        .split('\\')
        .filter((item) => item !== '')
        .slice(0, -2)

    let pathname = '/' + pathnameSplit.join('/') + '/storage/base365/timviec365'
    pathname = pathname + '/hh365'
    if (!fs.existsSync(pathname)) {
        fs.mkdirSync(pathname)
    }
    pathname = pathname + '/blogadmin'
    if (!fs.existsSync(pathname)) {
        fs.mkdirSync(pathname)
    }

    // write to file
    const image = Buffer.from(img.split(',')[1], 'base64')
    const time = this.getTimeNow()

    fs.writeFileSync(pathname + '/' + time + imgName + '.png', image)

    return `https://api.timviec365.vn/timviec365/hh365/blogadmin/${time}${imgName}.png`
}

exports.removeVNTones = (str) => {
    {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g, " ");
        str = str.trim();
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        str = str.replace(
            /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'|"|&|#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
            " "
        );

        return str;
    };

}

exports.getPublicIP = async() => {
    try {
        const response = await axios.get('https://geolocation-db.com/json/')

        return response.data.IPv4
    } catch (error) {
        throw new Error('Lỗi lấy địa chỉ ip')
    }
}

exports.inForHHP = () => {
    return {
        company_id: 10013446,
        id_ngo_thi_dung: 10016171,
        id_dang_thi_hang: 10020503
    };
}


exports.sleep = (ms) => {
    try {
        return new Promise(resolve => setTimeout(resolve, ms));
    } catch (e) {
        return false;
    }
};

// hàm kiểm tra lịch sử hoạt động CRM trong ngày hôm nay 
exports.CheckHistoryCRM = async(usc_id) => {
    const today = new Date().toISOString().slice(0, 10);
    const timeStampBegin = convertTimestamp(`${today} 08:00:00`);
    const timeStampEnd = convertTimestamp(`${today} 18:00:00`);
    const history = await HistoryCrm.findOne({
        usc_id,
        time_created: {
            $gte: timeStampBegin,
            $lte: timeStampEnd,
        }
    }).select("id");
    return history;
}