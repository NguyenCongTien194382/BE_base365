// check ảnh và video
const fs = require('fs');

// upload file
const multer = require('multer')

// gửi mail
const nodemailer = require("nodemailer");
// tạo biến môi trường
const dotenv = require("dotenv");
// mã hóa mật khẩu
const crypto = require('crypto');
// gọi api
const axios = require('axios')

// check video
const path = require('path');
//check ảnh
const { promisify } = require('util');
// xu li alias
const slugify = require('slugify');

// tạo token
const jwt = require('jsonwebtoken');
const Users = require('../../models/Users');

// giới hạn dung lượng video < 100MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
// danh sách các loại video cho phép
const allowedTypes = ['.mp4', '.mov', '.avi', '.wmv', '.flv'];


// giới hạn dung lượng ảnh < 2MB
const MAX_IMG_SIZE = 2 * 1024 * 1024;
// giới hạn dung lượng kho ảnh
exports.MAX_Kho_Anh = 300 * 1024 * 1024;

//gioi han file
const MAX_FILE_SIZE = 20 * 1024 * 1024;

dotenv.config();

const functions = require('../../services/functions');

exports.uploadAva = async(old_file, old_time,Object, file, allowedExtensions, createdAt = null) => {
    //truyền Object nếu là Phụ Huynh thì truyền "PH", nếu gia sư thì truyền "GS"
    // const namefiles = req.files.name
    let date = new Date();
    if (createdAt) {
        date = new Date(createdAt*1000);
    }
    var filename = file.name;
    var arr_filename = filename.split('.');
    var new_filename = `${Object}` +  Math.round(date.getTime() / 1000) + '.' + arr_filename[arr_filename.length - 1];
    // let namefile = 'PH' + Math.round(date.getTime() / 1000) + "_" + file.name;
    let path1 = `../storage/base365/giasu/upload/${Object.toLocaleLowerCase()}/${functions.convertDate(date.getTime()/1000, true)}/`;
    let filePath = `../storage/base365/giasu/upload/${Object.toLocaleLowerCase()}/${functions.convertDate(date.getTime()/1000, true)}/` + new_filename;
    //ktra xem có file cũ không thì xóa
	if(old_file && old_time){
		let date = 0
		if (old_time) {
			date = new Date(old_time * 1000);
		}
    	let filePath1 = `../storage/base365/giasu/upload/${Object.toLocaleLowerCase()}/${functions.convertDate(date.getTime() / 1000, true)}/` + old_file;
			fs.unlink(filePath1, (err) => {
			if (err){ 
				console.log(err)
				return false;
			};
		});
	}
    //check size
	const {size} = await promisify(fs.stat)(file.path);
	if (size > MAX_IMG_SIZE) {
		console.log("Dung lượng file tải lên quá lớn , vui lòng chọn tệp khác")
		return false;
	}
    //check đinh dang ảnh
    let fileCheck = path.extname(filePath);
    if (allowedExtensions.includes(fileCheck.toLocaleLowerCase()) === false) {
        return false
    }
    if (!fs.existsSync(path1)) {
        fs.mkdirSync(path1, { recursive: true });
    }
    fs.readFile(file.path, (err, data) => {
        if (err) {
            console.log(err)
        }
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.log(err)
            }
        });
    });
    return new_filename
}
exports.createLinkFile = (Object, createAt, file) => {
     //truyền Object nếu là Phụ Huynh thì truyền "PH", nếu gia sư thì truyền "GS"
    if (file != null && file != '') {
        return `${process.env.cdn}/upload/${Object.toLocaleLowerCase()}/${functions.convertDate(createAt,true)}/${file}`;
    } else {
        return "";
    }
}
exports.money_str = (ugs_unit_price, ugs_month, ugs_salary, ugs_time) => {
    if (ugs_unit_price == 0) {
        let price_type = ugs_month
        let price_by = price_type == 3 ? "tháng" : "buổi"
        let arr_price = ugs_salary.split('-')
        let price = Number(arr_price[0].trim()).toLocaleString() + ' - ' + Number(arr_price[1].trim()).toLocaleString();
        return price
    } else {
        let price_type = ugs_time
        let price_by = price_type == 3 ? 'Tháng':'Buổi';
        let price = Number(ugs_unit_price.trim()).toLocaleString();
        return price
    }
}
//xu ly alias
exports.renderAlias = (text) => {
	return slugify(text, {
		replacement: '-', // Ký tự thay thế khoảng trắng và các ký tự đặc biệt
		lower: true, // Chuyển thành chữ thường
		strict: true, // Loại bỏ các ký tự không hợp lệ
	});
};