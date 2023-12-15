// const { checkPhoneNumber } = require("../functions");
// const sharp = require('sharp');
const path = require('path');
// const { log } = require("console");
const fs = require('fs');
const { promisify } = require('util')
const https = require('https');
const Customer = require('../../models/crm/Customer/customer')
const User = require('../../models/Users')
const axios = require('axios');
const { log } = require('console');
const AcountApi = require('../../models/crm/account_api')
const ShareCustomer = require('../../models/crm/tbl_share_customer');
const RoleModel = require("../../models/crm/accept_role");
const EmailSms = require("../../models/crm/EmailSms");
const nodemailer = require('nodemailer'); 
const schedule = require('node-schedule');
const cron = require('node-cron');
const functions = require("../functions");

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

exports.getMaxIDCRM = async (model) => {
    const maxUser = await model.findOne({}, {}, { sort: { cus_id: -1 } }).lean() || 0;
    return maxUser.cus_id;
};

exports.getMaxIDConnectApi = async (model) => {
  const maxUser = await model.findOne({}, {}, { sort: { id: -1 } }).lean() || 0;
  return maxUser.id;
};


// hàm validate phone
exports.checkPhoneNumberCRM = async (phone) => {
  const phoneNumberRegex = /^(?:\+84|0|\+1)?([1-9][0-9]{8,9})$/;
  return phoneNumberRegex.test(phone)
}
// hàm validate email
exports.checkEmailCRM = async (email) => {
  const gmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return gmailRegex.test(email);
}
// hàm validate link
exports.checkLinkCRM= async (link) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(link);
}
// hàm validate thơi gian
exports.checkTimeCRM = async (time) => {
  const currentTime = new Date(); // Lấy thời gian hiện tại
  const inputTime = new Date(time); // Thời gian nhập vào
  if (inputTime < currentTime) {
      return false
  } else {
      return true
  }
}

exports.validateImage = async (logo) => {
  
  const fileExtension = path.extname(logo.name).toLowerCase();
  const validExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.bmp'];

  if (!validExtensions.includes(fileExtension)) {
    return { isValid: false, message: 'Định dạng ảnh không hợp lệ. Chỉ hỗ trợ định dạng JPEG, JPG, PNG, GIF và BMP.' };
    
  }
  return  true ;
};

exports.uploadFileCRM = (cus_id,logo) => {
  console.log(cus_id);
  let path = `../Storage/base365/CRM/Customer/${cus_id}/`;
  let filePath = `../Storage/base365/CRM/Customer/${cus_id}/` + logo.originalFilename;

  if (!fs.existsSync(path)) { // Nếu thư mục chưa tồn tại thì tạo mới
      console.log("chua ton tai")
      fs.mkdirSync(path, { recursive: true });
  }

  fs.readFile(logo.path, (err, data) => {
      if (err) {
          console.log(err)
      }
      fs.writeFile(filePath, data, (err) => {
          if (err) {
              console.log(err)
          } else {
              console.log(" luu thanh cong ");
          }
      });
  });
}

exports.success = async (res, messsage = "", data = []) => {
  return res.status(200).json({ data: { result: true, message: messsage, ...data }, error: null, })
};

exports.getDatafindOneAndUpdate = async (model, condition, projection) => {
  return model.findOneAndUpdate(condition, projection);
};


exports.vavalidateCustomerSearchQuery = ( page, cus_id,status,resoure,user_edit_id,time_s,time_e,group_id) => {
  if (typeof page !== 'number' && isNaN(Number(page))) {
    return { success: false, error: 'page phải là 1 số' };
  }
  else if (typeof cus_id !== 'number' && isNaN(Number(cus_id))) {
    return { success: false, error: 'cus_id phải là 1 số' };
}
  else if (typeof status !== 'number' && isNaN(Number(status))) {
    return { success: false, error: 'status phải là 1 số' };
}
  else if (typeof resoure !== 'number' && isNaN(Number(resoure))) {
    return { success: false, error: 'resoure phải là 1 số' };
}
  else if (typeof user_edit_id !== 'number' && isNaN(Number(user_edit_id))) {
    return { success: false, error: 'user_edit_id người phụ trách phải là 1 số' };
}
  else if (typeof group_id !== 'number' && isNaN(Number(group_id))) {
    return { success: false, error: 'group_id id nhóm phải là 1 số' };
}
  else if (time_s && !isValidDate(time_s)) {
    return { success: false, error: 'thời gian bắt đầu không hợp lệ.' };
}
else if (time_e && !isValidDate(time_e)) {
  return { success: false, error: 'thời gian kết thúc không hợp lệ.' };
}
if (time_s && time_e && isInvalidDateRange(time_s, time_e)) {
  return { success: false, error: 'thời gian bắt đầu không được lớn hơn thời gian kết thúc' };
}
  return true;
};


function isValidDate(dateString) {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  return true;
}

function isInvalidDateRange(time_s, time_e) {
  const start = new Date(time_s);
  const end = new Date(time_e);

  return start.getTime() > end.getTime();
}



exports.validateCustomerInput = (name,comId) => {
    if (!name) {
      throw { code: 400, message: 'Tên khách hàng là bắt buộc.' };
    }
    return true;
  };
  

  exports.createLinkFileCRM = ( id, name) => {
    let link = process.env.DOMAIN_CRM + '/base365/CRM/Customer' + '/' + id + '/' + name;
    return link;
}


exports.upFileCRM = async (folder, id, file,allowedExtensions) => {

  let path1 = `../../Storage/base365/CRM/Customer/${folder}/${id}/`;
  let filePath = `../../Storage/base365/CRM/Customer/${folder}/${id}/` + file.name;
  let fileCheck =  path.extname(filePath);
  if(allowedExtensions.includes(fileCheck.toLocaleLowerCase()) === false)
  {
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
  return true
}

exports.deleteFileCRM = (id, file) => {
  let filePath = `../../Storage/base365/CRM/Customer/${id}/` + file;
  fs.unlink(filePath, (err) => {
  if (err) console.log(err);
  });
  }

  // hàm khi thành công
exports.success = async (res, messsage = "", data = []) => {
  return res.status(200).json({ data: { result: true, message: messsage, ...data }, error: null, })
};

// hàm thực thi khi thất bại
exports.setError = async (res, message, code = 500) => {
  return res.status(code).json({ code, message })
};
// hàm tìm id max
exports.getMaxID = async (model) => {
  const maxUser = await model.findOne({}, {}, { sort: { _id: -1 } }).lean() || 0;
  return maxUser._id;
};


exports.deleteCustomerByIds = async (arrCus) => {
  try {
    await Customer.deleteMany({ cus_id: { $in: arrCus } });
    console.log(`Deleted customers with IDs: ${arrCus.join(', ')}`);
  } catch (error) {
    console.error('Failed to delete customers', error);
    throw error;
  }
};


exports.getEmployeesFromDepartment = async(depId) => {
  try {
    const employees = await User.find({ 'inForPerson.employee.dep_id': depId }).exec(); // Lấy danh sách nhân viên từ database, theo điều kiện dep_id

    return employees;
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving employees from department.'); // Ném lỗi nếu có lỗi xảy ra
  }
}


exports.getToken = async (name, password) => {
  try {
    let data = {
      name: name,
      password: password
    };
    console.log(data);
    const response = await axios.post('https://s02.oncall.vn:8900/api/account/credentials/verify', data, {
    headers: {
    'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Tắt kiểm tra chứng chỉ
    });

    // Xử lý phản hồi từ API ở đây (response.data)
    return response.data; // Trả về dữ liệu từ API (hoặc có thể là phần xử lý dữ liệu nếu cần)
  }  catch (error) {
    if (error.response && error.response.data) {
      console.log('Error:', error.response.data);
      return error.response.data;
    } else {
      console.error('Unknown Error:', error);
      throw error;
    }
  }
};

exports.getCallHistory = async(token)=>{
  try{
    let url = 'https://s02.oncall.vn:8900/api/call_logs/list?page =1&pagesize=1000'
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'access_token': token
  };
  let response = await axios.get(url, { headers,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
  return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log('Error:', error.response.data);
      return error.response.data;
    } else {
      console.error('Unknown Error:', error);
      throw error;
    }
  }
}


exports.getExtensionInfo = async (access_token, id) => {
  try {
    const response = await axios.get(`https://s02.oncall.vn:8900/api/extensions/show?id=${id}`,{
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'access_token': access_token
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Tắt kiểm tra chứng chỉ
    });
    // Xử lý phản hồi từ API ở đây (response.data)
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.log('Error:', error.response.data);
      return error.response.data;
    } else {
      console.error('Unknown Error:', error);
      throw error;
    }
  }
};

exports.list_extension = async(token,page = 1,limit) =>{
  try{
  let url = 'https://s02.oncall.vn:8900/api/extensions/list?pagination=' + page ;
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'access_token': token
  };
  let response = await axios.get(url, { headers,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
  return response.data;
  }catch (error) {
    console.error(error);
    throw new Error('Error retrieving employees from department.'); // Ném lỗi nếu có lỗi xảy ra
  }
}

exports.list_extension_v2 = async (token) => {
  try {
      const response = await axios({
          method: "post",
          url: "https://voip.timviec365.vn/api/getExtension",
          data: {
              token
          },
          headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data.data.data;
  } catch (error) {
      console.error(error);
      throw new Error('Error retrieving employees from department.'); // Ném lỗi nếu có lỗi xảy ra
  }
}

exports.check_connect = async(com_id)=>{
  try{
    let getInforApi = await  AcountApi.findOne({com_id : com_id})
    if(getInforApi){
      let data = {
        check_connect: true,
        account_api: getInforApi.account,
        pass_api: getInforApi.password
      }
      return data
    }else{
      let data = {
        check_connect: false,
        account_api: '',
        pass_api: ''
      }
      return data
    }
  }catch (error) {
    console.error(error);
    throw new Error('Error retrieving employees from department.'); // Ném lỗi nếu có lỗi xảy ra
  }
}

exports.findUserByQLC = async(listUser, idQLC) =>{
  return listUser.find(e => Number(e.idQLC) === Number(idQLC)) || { userName: "" };
}

exports.assignUserInfo= async(element, user, propName)=>{
  element[propName] = user.userName;
}

// hàm check file
exports.checkFile = async (filePath) => {
    if (typeof (filePath) !== 'string') {
        return false;
    }
    const { size } = await promisify(fs.stat)(filePath);
    if (size > MAX_FILE_SIZE) {
        return false;
    }
    //check dinh dang file
    // let fileCheck = path.extname(filePath);
    // if (allowedExtensions.includes(fileCheck.toLocaleLowerCase()) === false) {
    //     return false
    // }
    return true;
};

exports.uploadFile= async (folder, time_created ,file_img) => {
    let filename = '';
    const date = new Date(time_created*1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const timestamp = Math.round(date.getTime() / 1000);

    const dir = `../storage/base365/crm/files/${folder}/${year}/${month}/${day}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // filename = `${timestamp}-file-${file_img.originalFilename}`.replace(/,/g, '');
    filename = `${timestamp}-file-${file_img.originalFilename}`.replace(/,/g, '');
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

exports.getLinkFile = (folder, time, fileName) => {
    let date = new Date(time * 1000);
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    let link = process.env.DOMAIN_CRM + `/base365/crm/files/${folder}/${y}/${m}/${d}/${fileName}`;
    return link;
}

exports.deleteFile = (folder, time, fileName) => {
  let date = new Date(time * 1000);
  const y = date.getFullYear();
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  let filePath = `../storage/base365/crm/files/${folder}/${y}/${m}/${d}/${fileName}`;
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
}

exports.checkTypeRole = (allowedTypes = [1,2]) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.data.type)) {
      return res.status(403).json({ message: "Bạn không có quyền", code: 403 });
    }
    next();
  };
};

// exports.transporter = async (host, port, secure, user, pass) => {
//   let transporter = nodemailer.createTransport({
//     host: host,
//     port: Number(port),
//     secure: secure, // true for 465, false for other ports
//     auth: {
//       user: user, // Địa chỉ email gửi
//       pass: pass// Mật khẩu email
//     }
//   });
//   transporter.verify((error, success) => {
//   if (error) {
//       console.error('Kết nối không thành công:', error);
//     } else {
//       console.log('Kết nối thành công!');
//     }
//   });
//   return transporter;
// }

exports.checkConnectEmail = async (host, port, secure, user, pass) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: host,
      port: Number(port),
      secure: secure, // true for 465, false for other ports
      auth: {
        user: user, // Địa chỉ email gửi
        pass: pass // Mật khẩu email
      }
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error('Kết nối không thành công:', error);
        resolve(false); // Kết nối không thành công
      } else {
        console.log('Kết nối thành công!');
        resolve(true); // Kết nối thành công
      }
    });
  });
};

exports.sendEmail = async (host, port, secure, user, pass, email_receivers, title, content) => {
  let transporter = nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: secure, // true for 465, false for other ports
    auth: {
      user: user, // Địa chỉ email gửi
      pass: pass // Mật khẩu email
    }
  });
  email_receivers.forEach((email_receiver) => {
    let options = {
      from: user,
      to: email_receiver,
      subject: title,
      html: content
    };

    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log(`Error sending email to ${email_receiver}:`, err);
      } else {
        console.log(`Message sent to ${email_receiver}:`, info.response);
      }
    });
  });
};

exports.sendEmailSchedule = async (host, port, secure, user, pass, email_receivers, title, content, sendDate) => {
  let transporter = nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: secure, // true for 465, false for other ports
    auth: {
      user: user, // Địa chỉ email gửi
      pass: pass // Mật khẩu email
    }
  });
  let time = functions.convertTimestamp(Date.now());
  const job = cron.schedule('*/5 * * * *', async()=>{
    const emailSms = await EmailSms.find({send_time: {$lte: time}, status: 0});
    for(let i=0; i<emailSms.length; i++) {
      
    }
  });

  email_receivers.forEach((email_receiver) => {
    const job = schedule.scheduleJob(new Date(sendDate), async () => {
      let options = {
        from: user,
        to: email_receiver,
        subject: title,
        html: content
      };

      try {
        const info = await transporter.sendMail(options);
        console.log(`Message sent to ${email_receiver}: ${info.response}`);
      } catch (error) {
        console.error(`Error sending email to ${email_receiver}:`, error);
      }
    });
  });
};

exports.cronJobSendEmail = (host, port, secure, user, pass) => {
  let transporter = nodemailer.createTransport({
    host: host,
    port: Number(port),
    secure: secure, // true for 465, false for other ports
    auth: {
      user: user, // Địa chỉ email gửi
      pass: pass // Mật khẩu email
    }
  });
  const job = cron.schedule('*/2 * * * *', async()=>{
    let time = functions.convertTimestamp(Date.now());
    console.log("chay cron job...", time)
    const emailSms = await EmailSms.find({send_time: {$lte: time}, status: 0});
    for(let i=0; i<emailSms.length; i++) {
      console.log("tim thay ban ghi...");
      let title = emailSms[i].title;
      let content = emailSms[i].content;
      let list_email_receiver = emailSms[i].list_email_receiver;
      list_email_receiver = list_email_receiver.split(", ");
      list_email_receiver.forEach((email_receiver) => {
        let options = {
          from: user,
          to: email_receiver,
          subject: title,
          html: content
        };

        transporter.sendMail(options, (err, info) => {
          if (err) {
            console.log(`Error sending email to ${email_receiver}:`, err);
          } else {
            console.log(`Message sent to ${email_receiver}:`, info.response);
          }
        });
      });
    }
    await EmailSms.updateMany({send_time: {$lte: time}, status: 0}, {status: 1});
  });
  job.start();
}

exports.createDateWithDateAndTime = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);

  let date = new Date(year, month - 1, day, hour, minute);
  // date.setUTCHours(hour);
  // date.setUTCMinutes(minute);
  return date;
}

exports.deleteSoft = async(model, field, arr_id) => {
  await model.updateMany({[field]: {$in: arr_id}}, {is_delete: 1});
}

exports.restore = async(model, field, arr_id) => {
  await model.updateMany({[field]: {$in: arr_id}}, {is_delete: 0});
}

exports.delete = async(model, field, arr_id) => {
  await model.deleteMany({[field]: {$in: arr_id}});
}

const checkShareCustomer = async(user_type, idQLC, cus_id) => {
  if(user_type==1) {
    return {role: 3, share_related_list: 1};
  }
  let share_customer = await ShareCustomer.findOne({customer_id: cus_id, emp_id: idQLC});
  if(share_customer) {
    return share_customer;
  }else {
    let emp = await User.findOne({idQLC: idQLC}, {"idQLC": "$idQLC", "dep_id": "$inForPerson.employee.dep_id"});
    if(emp && emp.dep_id){
      let share_customer_dep = await ShareCustomer.findOne({customer_id: cus_id, dep_id: emp.dep_id});
      if(share_customer_dep) {
        return share_customer_dep;
      }
      return false;
    }else {
      return false;
    }
  }
}

exports.getListCanAccess = async(user_type, idQLC, list) => {
  let dem=0;
  let createPromise = [];
  for(let i=list.length-1; i>=0; i--) {
    let check = checkShareCustomer(user_type, idQLC, list[i].cus_id);
    createPromise.push(check);
  }
  let res_promise = await Promise.all(createPromise);
  for(let i=list.length-1; i>=0; i--) {
    if(!res_promise[i]) {
      dem++;
      list.splice(i, 1);
    }else {
      list[i].checkShareCustomer = res_promise[i];
    }
  }
  return [dem, list];
}

exports.checkRight = (barId, perId) => {
    return async (req, res, next) => {
        let infoLogin = req.user.data;
        if (infoLogin.type == 1) return next();
        let checkDirector = await User.findOne({
            idQLC: infoLogin.idQLC,
            type: { $ne: 1 },
            'inForPerson.employee.position_id': { $in: [7, 8, 14, 16, 21, 22] }
        });
        if (checkDirector) return next();
        let permission = await RoleModel.findOne({ id_user: infoLogin.idQLC, id_module: barId, [perId]: 1, company_id: infoLogin.com_id});
        if (permission) return next();
        return functions.setError(res, "no right", 403);
    };
};