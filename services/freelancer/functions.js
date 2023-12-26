// gửi mail
const nodemailer = require("nodemailer");
// tạo biến môi trường
const dotenv = require("dotenv");
// gọi api
const axios = require('axios');
// check ảnh và video
const fs = require('fs');
//
const path = require('path');
//check ảnh
const { promisify } = require('util');
const https = require('https');
const jwt = require('jsonwebtoken');

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_SIZE = 8400000;
const ExtensionImage = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
const functions = require('../functions');
const Users = require('../../models/Users');
const AdminUser = require('../../models/freelancer/AdminUser');
const Admin = require('../../models/freelancer/Admin');
const RoleModule = require('../../models/freelancer/RoleModule');

dotenv.config();

// hàm cấu hình mail
const transport = nodemailer.createTransport({
    host: process.env.NODE_MAILER_HOST,
    port: Number(process.env.NODE_MAILER_PORT),
    service: process.env.NODE_MAILER_SERVICE,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
});

exports.sendEmailUv = async (ntd, freelancer) => {
    let name = freelancer.userName;
    let email = freelancer.email;
    let name_ntd = ntd.userName;
    let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
            <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
                <tr style="height: 165px;background-image: url(https://timviec365.vn/images/email/bg1.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
                <td style="padding-top: 23px;float: left;">
                    <img src="https://timviec365.vn/images/email/logo2.png">
                </td>
                <td style="text-align: left;float: right;">
                    <ul style="margin-top: 15px;padding-left: 0px;">
                    <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
                    <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Tặng điểm lọc hồ sơ mỗi ngày</span></li>
                    <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>         
                    </ul>       
                </td>
                </tr>
                <tr  style="float: left;padding:10px 30px 30px 30px;">
                <td colspan="2">
                    <p style="font-size:18px;margin:0;line-height:25px;margin-bottom:5px;padding-top:15px">Xin chào <span style="color:#307df1">${name}</span></p>
                    <p style="font-size:18px;margin:0;line-height:25px;margin-bottom:5px">Thông báo nhà tuyển dụng <span style="color:#307df1">${name_ntd} đã xem hồ sơ của bạn</span></p>
                </td>
                </tr>
                <tr style="height: 160px;background-image: url(https://timviec365.vn/images/email/bg2.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;">
                <td style="padding-top: 50px;">
                    <ul>
                    <li style="list-style-type: none;color: #fff;margin-bottom: 5px;">
                        <span style="font-size: 18px;line-height: 18px;">Liên hệ với chúng tôi để được hỗ trợ nhiều hơn:</span>
                    </li>
                    <li style="list-style-type: none;color: #fff;margin-bottom: 5px;">
                        <span style="font-size: 18px;line-height: 18px;">Hotline: <span style="color: #ffa111;">1900633682</span> - ấn phím 1</span>
                    </li>
                    <li style="list-style-type: none;color: #fff;margin-bottom: 5px;">
                        <span style="font-size: 18px;line-height: 18px;color: #ffa111;">Trân trọng !</span>
                    </li>
                    </ul>     
                </td>
            </table>
            </body>`;
    let subject = `Freelancer.vn thông báo nhà tuyển dụng ${name_ntd} đã xem hồ sơ của bạn`;
    let options = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: subject,
        html: body
    }
    transport.sendMail(options, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    })
};

exports.sendEmailNtd = async (ntd, ungVien, viecLam) => {
    let uv_name = ungVien.userName;
    let ntd_name = ntd.userName;
    let vi_tri = viecLam.vi_tri;
    let body = `<body style="width: 100%;background-color: #dad7d7;text-align: justify;padding: 0;margin: 0;font-family: unset;padding-top: 20px;padding-bottom: 20px;">
    <table style="width: 600px;background:#fff; margin:0 auto;border-collapse: collapse;color: #000">
        <tr style="height: 165px;background-image: url(https://timviec365.vn/images/email/bg1.png);background-size:100% 100%;background-repeat: no-repeat;float: left;width: 100%;padding: 0px 30px;box-sizing: border-box;">
        <td style="padding-top: 23px;float: left;">
            <img src="https://timviec365.vn/images/email/logo2.png">
        </td>
        <td style="text-align: left;float: right;">
            <ul style="margin-top: 15px;padding-left: 0px;">
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Đăng tin tuyển dụng miễn phí</span></li>
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Không giới hạn tin đăng tuyển dụng</span></li>
                <li style="list-style-type: none;padding-bottom: 5px;height:25px;margin-left: 0px;"><span style="color: #307df1;font-size: 28px;padding-right: 5px;font-weight:bold;">&#8727;</span><span style="font-size:18px;">Biểu mẫu nhân sự chuyên nghiệp</span></li>
            </ul>          
        </td>
        </tr>
        <tr  style="float: left;padding:10px 30px 30px 30px;min-height: 289px;">
        <td colspan="2">
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;padding-top: 15px;">Xin chào ${ntd_name}</p>
            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Ứng viên <span style="color: #307df1">${uv_name}</span> đã ứng tuyển vào tin đăng <span style="color: #307df1;">${vi_tri}.</span> của quý công ty</p>            
                <p style="margin: 10px 0px 0px 0px; font-size: 18px;padding-left: 70px;"><span>Họ và tên:  </span><span>${uv_name}</span></p>
                <p style="margin: 5px 0px 10px 0px; font-size: 18px;padding-left: 70px;"><span>Địa chỉ:  </span><span>${ungVien.address}</span></p>

            <p style="font-size: 18px;margin: 0;line-height: 25px;margin-bottom: 5px;">Để xem thông tin chi tiết ứng viên và tải CV ứng viên vui lòng nhấn nút:</p>
            <p style="margin: auto;margin-top: 20px;text-align: center;border-radius: 5px;width: 265px;height: 45px;background:#307df1;border-radius: 5px;"><a href="https://vieclamtheogio.timviec365.vn/ung-vien-${ungVien.idTimViec365}.html" style="color: #fff;text-decoration: none;font-size: 18px;line-height: 43px;">Xem chi tiết ứng viên</a></p>
        </td>
        </tr>`;
    let subject = uv_name + " - Timviec365.vn đã ứng tuyển vào vị trí " + vi_tri;
    let options = {
        from: process.env.AUTH_EMAIL,
        to: ntd.email,
        subject: subject,
        html: body
    }
    transport.sendMail(options, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    })
};

//check quyen admin
exports.checkRight = (moduleId, perId) => {
    return async (req, res, next) => {
        try {
            let admin = req.infoAdmin;
            if (!moduleId || !perId) {
                return functions.setError(res, "Missing input moduleId or perId", 505);
            }
            if (admin.adm_isadmin) return next();
            let permission = await RoleModule.findOne({ adm_id: admin.adm_id, module_id: moduleId }, { create: 1, update: 1, delete: 1 });
            if (!permission) {
                return functions.setError(res, "No right", 403);
            }
            if (perId == 1) return next();
            if (perId == 2 && permission.create == 1) return next();
            if (perId == 3 && permission.update == 1) return next();
            if (perId == 4 && permission.delete == 1) return next();
            return functions.setError(res, "No right", 403);
        } catch (error) {
            return functions.setError(res, error.message);
        }

    };
};

// hàm check ảnh
exports.checkImage = async (filePath) => {
    if (typeof (filePath) !== 'string') {
        return false;
    }
    const { size } = await promisify(fs.stat)(filePath);
    if (size > MAX_FILE_SIZE) {
        return false;
    }
    //check dinh dang file
    let fileCheck = path.extname(filePath);
    if (ExtensionImage.includes(fileCheck.toLocaleLowerCase()) === false) {
        return false
    }
    return true;
};

exports.uploadImage = async (time_created, file_img) => {
    let filename = '';
    const date = new Date(time_created * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const timestamp = Math.round(date.getTime() / 1000);

    const dir = `../storage/base365/timviec365/pictures/${year}/${month}/${day}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let fileExtension = file_img.name.split(".").pop();
    filename = `job-${timestamp}_${file_img.name}`;
    const filePath = dir + filename;
    fs.readFile(file_img.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
            }
        });
    });
    return filename;
}

exports.uploadFile = async (time_created, file_img, id_flc) => {
   try {
    let filename = '';
    const date = new Date(time_created * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const timestamp = Math.round(date.getTime() / 1000);

    const dir = `../storage/base365/timviec365/file/${year}/${month}/${day}/${id_flc}`;
    const filePath = `../storage/base365/timviec365/file/${year}/${month}/${day}/${id_flc}/${file_img.name}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.readFile(file_img.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
            }
        });
    });
    return `/file/${year}/${month}/${day}/${id_flc}/${file_img.name}`;
   } catch (error) {
    console.log(error)
   }
}

exports.getLinkFile = (time, fileName) => {
    let date = new Date(time * 1000);
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    let link = process.env.port_picture_qlc + `/thumb/${y}/${m}/${d}/${fileName}`;
    return link;
}

exports.removeAccent = async (title) => {
    var fromChars = "áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ";
    var toChars = "aaaaaaaaaaaaaaaaadeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyy";
    for (var i = 0; i < fromChars.length; i++) {
        title = title.replace(new RegExp(fromChars.charAt(i), "g"), toChars.charAt(i));
    }
    return title;
}


exports.replaceTitle = async (title) => {
    title = await exports.removeAccent(title);
    var arrStr = ["&lt;", "&gt;", "/", "\\", "&apos;", "&quot;", "&amp;", "lt;", "gt;", "apos;", "quot;", "amp;", "&lt", "&gt", "&apos", "&quot", "&amp", "&#34;", "&#39;", "&#38;", "&#60;", "&#62;"];
    title = title.replace(new RegExp(arrStr.join("|"), "g"), " ");
    title = title.replace(/[^0-9a-zA-Z\s]+/g, " ");
    title = title.replace(/ {2,}/g, " ");
    title = title.trim().replace(/ /g, "-");
    title = encodeURIComponent(title);
    var arrayAfter = ["%0D%0A", "%", "&"];
    title = title.replace(new RegExp(arrayAfter.join("|"), "g"), "-");
    title = title.toLowerCase();
    return title;
}

exports.checkTitle = (value) => {
    return /^[a-zA-Z0-9_àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ'.,:'"?;() ]*$/i.test(value);
};

exports.checkCompany = async (req, res, next) => {
    let id_ntd = req.user.data.idTimViec365;
    let ntd = await Users.findOne({ idTimViec365: id_ntd, type: 1 });
    if (ntd) {
        return next();
    }
    return functions.setError(res, "Not company or company not found!");
}

exports.checkFreelancer = async (req, res, next) => {
    let id_uv = req.user.data.idTimViec365;
    let uv = await Users.findOne({ idTimViec365: id_uv, type: 0 });
    if (uv) {
        return next();
    }
    return functions.setError(res, "Not freelancer or freelancer not found!");
}

// ham check admin viec lam theo gio
exports.checkAdmin = async (req, res, next) => {
    let user = req.user.data;
    let admin = await functions.getDatafindOne(Admin, { id: user.id });
    if (admin) {
        req.infoAdmin = admin;
        return next();
    }
    return functions.setError(res, "is not admin freelancer!");
}

exports.getLink = (value) => {
    try {
        const str = value.replace('../', '');
        return `https://storage.timviec365.vn/freelancer/${str}`
    } catch (error) {
        return null
    }
}

exports.getLinkAvatar = (time, value) => {
    try {
        if (!value || value == '') return null
        const gio = new Date(time * 1000).toISOString().slice(0, 10).replaceAll('-', '/');
        // return `http://localhost:3013/base365/timviec365/pictures/uv/${gio}/${value}`;
        return `https://storage.timviec365.vn/timviec365/pictures/uv/${gio}/${value}`;
    } catch (error) {
        return null
    }
}

exports.getLinkAvatarCompany = (time, value) => {
    try {
        if (!value || value == '') return null
        const gio = new Date(time * 1000).toISOString().slice(0, 10).replaceAll('-', '/');
        // return `http://localhost:3013/base365/timviec365/pictures/${gio}/${value}`;
        return `https://storage.timviec365.vn/timviec365/pictures/${gio}/${value}`;
    } catch (error) {
        return null
    }
}

exports.getLinkLogoCompany = (value) => {
    try {
        // return `http://localhost:3013/base365/timviec365/pictures/logo_com/${value}`;
        return `https://storage.timviec365.vn/timviec365/pictures/logo_com/${value}`;
    } catch (error) {
        return null
    }
}

exports.getDataAxios = async (url, condition) => {
    return await axios({
        method: "post",
        url: url,
        data: condition,
        headers: { "Content-Type": "multipart/form-data" },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Thêm dòng này để tắt kiểm tra chứng chỉ
    }).then(async (response) => {
        return response.data;
    });
};


exports.uploadLogo = async (file) => {
    const time = Math.round(new Date().getTime() / 1000);
    const path1 = `../storage/base365/timviec365/pictures/logo_com/`;
    const filePath = `../storage/base365/timviec365/pictures/logo_com/${time}_${file.name}`;

    if (!fs.existsSync(path1)) {
        fs.mkdirSync(path1, { recursive: true });
    }
    fs.readFile(file.path, (err, data) => {
        if (err) {
            return false;
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                return false;
            }
        });
    });
    return `${time}_${file.name}`;
}

exports.uploadImageUV = async (time_created, file_img, path) => {
    try {
        let filename = '';
        const date = new Date(time_created * 1000);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const timestamp = Math.round(date.getTime() / 1000);

        const dir = `../storage/base365/timviec365/pictures/${path}/`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        filename = `${timestamp}_${file_img.name}`;
        const filePath = `../storage/base365/timviec365/pictures/${path}/${filename}`;
        fs.readFile(file_img.path, (err, data) => {
            if (err) {
                console.log(err)
            }
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    console.log(err)
                }
            });
        });
        return filename;
    } catch (error) {
        console.log(error)
    }
}

exports.checkTokenUser = async (req, res, next) => {
    try {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            return jwt.decode(token).data.idTimViec365
        } else {
            return null;
        }
    } catch (error) {
        return null
    }

}