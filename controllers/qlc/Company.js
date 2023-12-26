const Users = require('../../models/Users')
const fnc = require('../../services/qlc/functions')
const functions = require('../../services/functions')
const md5 = require('md5')
const axios = require('axios')
const Deparment = require('../../models/qlc/Deparment')
const comErr = require('../../models/qlc/Com_error')
const Customer = require('../../models/crm/Customer/customer')
const Positions = require('../../models/qlc/Positions')
const serviceCrm = require('../../services/qlc/crm')
const QLC_OrganizeDetail = require('../../models/qlc/OrganizeDetail')
const QLC_Positions = require('../../models/qlc/Positions')

//Đăng kí tài khoản công ty
exports.register = async (req, res) => {
  try {

    const { userName, emailContact, phoneTK, password, address, phone } =
      req.body
    const createdAt = new Date()
    if (password && phoneTK) {
      let checkPhone = await functions.checkPhoneNumber(phoneTK)
      if (checkPhone) {
        let finduser = await Users.findOne({ phoneTK: phoneTK, type: 1 }).lean()
        let MaxId = await functions.getMaxUserID('company')
        let _id = MaxId._id
        if (!finduser) {
          const user = new Users({
            _id: _id,
            emailContact: emailContact,
            phoneTK: phoneTK,
            userName: userName,
            alias: functions.renderAlias(userName),
            phone: phone,
            address: address,
            type: 1,
            chat365_secret: Buffer.from(_id.toString()).toString('base64'),
            password: md5(password),
            fromWeb: 'quanlychung',
            role: 1,
            createdAt: functions.getTimeNow(),
            idQLC: MaxId._idQLC,
            idTimViec365: MaxId._idTV365,
            idRaoNhanh365: MaxId._idRN365,
            'inForCompany.cds.com_vip': 0,
            'inForCompany.cds.com_ep_vip': 5,
            'inForCompany.cds.com_vip_time': 0,
            'inForCompany.cds.type_timesheet': 3,
            emotion_active: false,
          })
          await user.save()
          try {
            serviceCrm.send_message(user, 'https://hungha365.com')
          } catch (e) {
            console.log("Lỗi gửi tin nhắn về Hằng khi đăng kí thành công", e)
          }
          // Lưu data vào base crm
          const resoure = 3
          const status = 12
          const group = 437
          const type_crm = 2

          await serviceCrm.addCustomer(
            userName,
            emailContact,
            phoneTK,
            MaxId._idQLC,
            resoure,
            status,
            group,
            type_crm,
            '',
            'HH365'
          )

          const token = await functions.createToken(
            {
              _id: user._id,
              idTimViec365: user.idTimViec365,
              idQLC: user.idQLC,
              idRaoNhanh365: user.idRaoNhanh365,
              email: user.email,
              phoneTK: user.phoneTK,
              createdAt: user.createdAt,
              type: user.type,
              com_id: user.idQLC,
              userName: user.userName,
              type_timesheet: user.inForCompany.cds.type_timesheet || 0
            },
            '1d'
          )
          const refreshToken = await functions.createToken(
            { userId: user._id },
            '1y'
          )
          let data = {
            access_token: token,
            refresh_token: refreshToken,
          }
          //tìm kiếm trong bảng đăng kí lỗi , nếu tồn tại sdt đăng kí thành công thì xóa
          let checkComErr = await comErr.findOne({ com_phone: phoneTK }).lean()
          if (checkComErr) {
            await comErr.deleteOne({ com_phone: phoneTK })
            serviceCrm.deleteCustomer(checkComErr.id, 'cc365err')
          }

          // tự động tạo sẵn 21 chức vụ cho công ty
          try {
            const pos = [
              { level: 21, value: '1', label: 'SINH VIÊN THỰC TẬP' },
              { level: 20, value: '9', label: 'NHÂN VIÊN PART TIME' },
              { level: 19, value: '2', label: 'NHÂN VIÊN THỬ VIỆC' },
              { level: 18, value: '3', label: 'NHÂN VIÊN CHÍNH THỨC' },
              { level: 17, value: '20', label: 'NHÓM PHÓ' },
              { level: 16, value: '4', label: 'TRƯỞNG NHÓM' },
              { level: 15, value: '12', label: 'PHÓ TỔ TRƯỞNG' },
              { level: 14, value: '13', label: 'TỔ TRƯỞNG' },
              { level: 13, value: '10', label: 'PHÓ BAN DỰ ÁN' },
              { level: 12, value: '11', label: 'TRƯỞNG BAN DỰ ÁN' },
              { level: 11, value: '5', label: 'PHÓ TRƯỞNG PHÒNG' },
              { level: 10, value: '6', label: 'TRƯỞNG PHÒNG' },
              { level: 9, value: '7', label: 'PHÓ GIÁM ĐỐC' },
              { level: 8, value: '8', label: 'GIÁM ĐỐC' },
              { level: 7, value: '14', label: 'PHÓ TỔNG GIÁM ĐỐC' },
              { level: 6, value: '16', label: 'TỔNG GIÁM ĐỐC' },
              { level: 5, value: '22', label: 'PHÓ TỔNG GIÁM ĐỐC TẬP ĐOÀN' },
              { level: 4, value: '21', label: 'TỔNG GIÁM ĐỐC TẬP ĐOÀN' },
              { level: 3, value: '17', label: 'THÀNH VIÊN HỘI ĐỒNG QUẢN TRỊ' },
              {
                level: 2,
                value: '18',
                label: 'PHÓ CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ',
              },
              { level: 1, value: '19', label: 'CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ' },
            ]
            const pos_in_com = pos.map((pos) => {
              let isManager = 0
              if (pos.level <= 9) {
                isManager = 1
              }
              if (pos.level > 9 && pos.level <= 17) {
                isManager = 2
              }
              return {
                id: Number(pos.value),
                comId: user.idQLC,
                positionName: pos.label,
                level: pos.level,
                isManager: isManager,
                created_time: Math.round(new Date().getTime() / 1000),
              }
            })
            const update = Positions.insertMany(pos_in_com)
          } catch (e) {
            console.log('Lỗi thêm tự động 21 chức vụ', e)
          }

          // Call api tạo tài khoản base cũ chat
          await axios({
            method: 'post',
            url: 'http://43.239.223.142:9000/api/users/insertAccount',
            data: {
              _id: _id,
              id365: MaxId._idQLC,
              type365: 1,
              email: phoneTK,
              password: md5(password),
              userName: userName,
              companyId: MaxId._idQLC,
              companyName: userName,
              idTimViec: MaxId._idTV365,
              fromWeb: 'quanlychung',
              secretCode: Buffer.from(_id.toString()).toString('base64'),
            },
            headers: { 'Content-Type': 'multipart/form-data' },
          })

          functions.list_de_xuat(user.idQLC)

          return functions.success(res, 'Đăng ký thành công', {
            data,
            id: user.idQLC,
          })
        }
        return functions.setError(res, 'Tài khoản đã được đăng ký')
      } else {
        //nếu nhập thiếu trường thì lưu lại bảng đăng kí lỗi
        let writeErr = await comErr.findOne({ com_phone: phoneTK }).lean()
        if (!writeErr) {
          const max1 =
            (await comErr
              .findOne({}, { id: 1 })
              .sort({ id: -1 })
              .limit(1)
              .lean()) || 0
          const com = new comErr({
            id: Number(max1.id) + 1 || 1,
            com_email: emailContact,
            com_phone: phoneTK,
            com_name: userName,
            com_address: address,
            com_pass: password,
            com_time_err: functions.getTimeNow(),
          })
          await com.save()
          // Lưu data vào base crm
          const resoure = 3
          const status = 12
          const group = 436
          const type_crm = 2
          await serviceCrm.addCustomer(
            userName,
            emailContact,
            phoneTK,
            user.idQLC,
            resoure,
            status,
            group,
            type_crm,
            '',
            'hh365err'
          )
        }
        return functions.setError(res, 'Định dạng sđt không hợp lệ')
      }
    } else {
      //nếu nhập thiếu trường thì lưu lại bảng đăng kí lỗi
      let writeErr = await comErr.findOne({ com_phone: phoneTK }).lean()
      //nếu không tìm thấy thì tạo mới
      if (!writeErr) {
        const max1 =
          (await comErr
            .findOne({}, { id: 1 })
            .sort({ id: -1 })
            .limit(1)
            .lean()) || 0
        let id = 1
        if (max1) {
          id = Number(max1.id) + 1
        }
        const com = new comErr({
          id: id,
          com_email: emailContact,
          com_phone: phoneTK,
          com_name: userName,
          com_address: address,
          com_pass: password,
          com_time_err: functions.getTimeNow(),
        })
        await com.save()
        // Lưu data vào base crm
        const resoure = 3
        const status = 12
        const group = 436
        const type_crm = 2
        await serviceCrm.addCustomer(
          userName,
          emailContact,
          phoneTK,
          id,
          resoure,
          status,
          group,
          type_crm,
          '',
          'hh365err'
        )
      } else {
        //nếu tìm thấy thì cập nhật
        await comErr.updateOne(
          { com_phone: phoneTK },
          {
            $set: {
              com_email: emailContact,
              com_phone: phoneTK,
              com_name: userName,
              com_address: address,
              com_pass: password,
              com_time_err: functions.getTimeNow(),
            },
          }
        )
        const resoure = 3
        const status = 12
        const group = 436
        await serviceCrm.editCustomer(
          userName,
          emailContact,
          phoneTK,
          group,
          writeErr.id,
          (from = 'hh365err')
        )
      }

      // Xử lý cập nhật crm



      return functions.setError(res, 'Thiếu thông tin truyền lên')
    }
    // }

    // return functions.setError(res, 'Có lỗi xảy ra', 500)
  } catch (e) {
    return functions.setError(res, e.message)
  }
}

//check vip
exports.checkVipCom = async (req, res) => {
  try {
    // if (!req.user.data) return functions.setError(res, 'Token không hợp lệ')

    // const type = req.user.data.type
    const com_id = req.body.com_id

    if (com_id) {
      // tìm record com_id
      const currentCom = await Users.findOne({
        idQLC: Number(com_id),
        type: 1,
      }).lean()
      if (!currentCom) return functions.setError(res, 'Công ty không tồn tại')

      const isVip = currentCom.inForCompany.cds.com_vip
      const com_ep_vip = currentCom.inForCompany.cds.com_ep_vip
      const no_of_emps = await Users.countDocuments({
        'inForPerson.employee.com_id': Number(com_id),
        type: 2,
      })

      if (isVip == 0) {
        if (Number(com_ep_vip) <= Number(no_of_emps)) {
          return functions.success(res, 'Lấy thông tin vip thành công', {
            data: {
              isVip: false,
              can_add_more: false,
              max_emps: Number(com_ep_vip),
              current_emps: Number(no_of_emps),
            },
          })
        } else {
          return functions.success(res, 'Lấy thông tin vip thành công', {
            data: {
              isVip: false,
              can_add_more: true,
              max_emps: Number(com_ep_vip),
              current_emps: Number(no_of_emps),
            },
          })
        }
      } else if (isVip == 1) {
        if (Number(com_ep_vip) <= Number(no_of_emps)) {
          return functions.success(res, 'Lấy thông tin vip thành công', {
            data: {
              isVip: true,
              can_add_more: false,
              max_emps: Number(com_ep_vip),
              current_emps: Number(no_of_emps),
            },
          })
        } else {
          return functions.success(res, 'Lấy thông tin vip thành công', {
            data: {
              isVip: true,
              can_add_more: true,
              max_emps: Number(com_ep_vip),
              current_emps: Number(no_of_emps),
            },
          })
        }
      } else {
        return functions.setError(res, 'Tài khoản công ty không hợp lệ')
      }
    }
    return functions.setError(res, 'Thiếu trường')
  } catch (err) {
    console.log(err)
    return functions.setError(res, err.message)
  }
}

//Đăng nhập tài khoản công ty
exports.login = async (req, res, next) => {
  try {
    let phoneTK = req.body.phoneTK
    let email = req.body.email
    password = req.body.password
    type_user = {}
    if (phoneTK && password) {
      let checkPhone = await functions.checkPhoneNumber(phoneTK)
      if (checkPhone) {
        let checkTypeUser = await Users.findOne({ phoneTK: phoneTK }).lean()
        if (checkTypeUser.type == 0) {
          type_user = 0
          functions.success(res, 'tài khoản là tài khoản cá nhân', {
            type_user,
          })
        } else if (checkTypeUser.type == 1) {
          type_user = 1
          let checkPassword = await functions.verifyPassword(
            password,
            checkTypeUser.password
          )
          if (!checkPassword) {
            return functions.setError(res, 'Mật khẩu sai')
          }
          if (checkTypeUser != null) {
            const token = await functions.createToken(checkTypeUser, '1d')
            const refreshToken = await functions.createToken(
              { userId: checkTypeUser._id },
              '1y'
            )
            let data = {
              access_token: token,
              refresh_token: refreshToken,
              com_info: {
                com_id: checkTypeUser._id,
                com_phone_tk: checkTypeUser.phoneTK,
              },
              detail: await Users.findOne(
                { _id: checkTypeUser._id },
                { password: 0 }
              ),
            }
            data.type_user = type_user
            return functions.success(res, 'Đăng nhập thành công bằng SDT', {
              data,
            })
          } else {
            return functions.setError(res, 'sai tai khoan hoac mat khau')
          }
        } else if (checkTypeUser.type == 2) {
          type_user = 2
          functions.success(res, 'tài khoản là tài khoản nhân viên', {
            type_user,
          })
        } else {
          functions.setError(res, 'không tìm thấy tài khoản ')
        }
      } else {
        return functions.setError(res, 'không đúng định dạng SDT')
      }
    } else if (email && password) {
      let checkMail = await functions.checkEmail(email)
      if (checkMail) {
        let checkTypeUser = await Users.findOne({ email: email }).lean()
        if (checkTypeUser.type == 0) {
          type_user = 0
          functions.success(res, 'tài khoản là tài khoản cá nhân', {
            type_user,
          })
        } else if (checkTypeUser.type == 1) {
          type_user = 1
          let checkPassword = await functions.verifyPassword(
            password,
            checkTypeUser.password
          )
          if (!checkPassword) {
            return functions.setError(res, 'Mật khẩu sai')
          }
          if (checkTypeUser != null) {
            const token = await functions.createToken(checkTypeUser, '1d')
            const refreshToken = await functions.createToken(
              { userId: checkTypeUser._id },
              '1y'
            )
            let data = {
              access_token: token,
              refresh_token: refreshToken,
              com_info: {
                com_id: checkTypeUser._id,
                com_email: checkTypeUser.email,
              },
              detail: await Users.findOne(
                { _id: checkTypeUser._id },
                { password: 0 }
              ),
            }
            data.type_user = type_user
            return functions.success(res, 'Đăng nhập thành công bằng email', {
              data,
            })
          } else {
            return functions.setError(res, 'sai tai khoan hoac mat khau')
          }
        } else if (checkTypeUser.type == 2) {
          type_user = 2
          functions.success(res, 'tài khoản là tài khoản nhân viên', {
            type_user,
          })
        } else {
          functions.setError(res, 'không tìm thấy tài khoản ')
        }
      } else {
        return functions.setError(res, 'không đúng định dạng email')
      }
    } else {
      return functions.setError(
        res,
        'thiếu dữ liệu email hoặc sdt hoặc password '
      )
    }
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.verify = async (req, res) => {
  try {
    let otp = req.body.ma_xt || null
    let phoneTK = req.user.data.phoneTK
    let data = []
    if (otp) {
      data = await Users.updateOne(
        { phoneTK: phoneTK, type: 1 },
        {
          $set: {
            otp: otp,
          },
        }
      )
      return functions.success(res, 'lưu OTP thành công', { data })
    } else if (!otp) {
      await Users.updateOne(
        { phoneTK: phoneTK, type: 1 },
        {
          $set: {
            authentic: 1,
          },
        }
      )
      return functions.success(res, 'xác thực thành công')
    } else {
      return functions.setError(res, 'thiếu dữ liệu sdt')
    }
  } catch (e) {
    return functions.setError(res, e.message)
  }
}

exports.verifyAccountById = async (req, res) => {
  try {
    let { email, type_user, passphrase } = req.body
    console.log('verifyAccountById', req.body)
    if (!email || !type_user || passphrase !== 'hungha@@#123988')
      return functions.setError(res, 'Thất bại')
    await Users.updateOne(
      {
        $or: [
          { phoneTK: email, type: type_user },
          { email: email, type: type_user },
          ...(type_user == 2
            ? [
              { phoneTK: email, type: 0 },
              { email: email, type: 0 },
            ]
            : []),
        ],
      },
      {
        $set: {
          authentic: 1,
        },
      }
    )
    return functions.success(res, 'xác thực thành công')
  } catch (e) {
    console.log('verifyAccountById', e)
    return functions.setError(res, e.message)
  }
}

exports.verifyCheckOTP = async (req, res) => {
  try {
    let otp = req.body.ma_xt || null
    let phoneTK = req.user.data.phoneTK

    if (otp) {
      let findUser = await Users.findOne({ phoneTK: phoneTK, type: 1 }).select(
        'otp'
      )
      if (findUser) {
        let data = findUser.otp
        if (data === otp) {
          functions.success(res, 'xác thực thành công')
        } else {
          functions.setError(res, 'xác thực thất bại')
        }
      } else {
        return functions.setError(res, 'tài khoản không tồn tại')
      }
    } else {
      return functions.setError(res, 'vui lòng nhập mã xác thực')
    }
  } catch (e) {
    return functions.setError(res, e.message)
  }
}

exports.CheckUpdatePasswordByInput = async (req, res, next) => {
  try {
    function _getTypeCheck(type) {
      if (!type) return {}
      if (type == 1) return { type: 1 }
      return { type: { $ne: 1 } }
    }
    let input = req.body.input
    let type = req.body.type
    if (input) {
      let user
      if (!(await functions.checkPhoneNumber(input))) {
        user = await Users.findOne({
          email: input,
          ..._getTypeCheck(type),
        }).lean()
      } else {
        user = await Users.findOne({
          phoneTK: input,
          ..._getTypeCheck(type),
        }).lean()
      }
      if (user) {
        return functions.success(res, ' tài khoản tồn tại ', {
          user: { id: user._id },
        })
      }
      return functions.setError(res, ' tài khoản chưa tồn tại ')
    }
    return functions.setError(res, ' nhập thiếu email hoặc sdt ')
  } catch (error) {
    console.log(error)
    return functions.setError(res, error)
  }
}

exports.CheckComName = async (req, res, next) => {
  try {
    let input = req.body.username
    if (input) {
      let user = await Users.findOne({
        userName: input,
      }).lean()
      if (user) {
        return functions.success(res, 'tài khoản tồn tại')
      }
      return functions.setError(res, 'tài khoản chưa tồn tại', 404)
    }
    return functions.setError(res, 'nhập thiếu username', 400)
  } catch (error) {
    return functions.setError(res, error)
  }
}

// hàm đổi mật khẩu
exports.updatePassword = async (req, res, next) => {
  try {
    let idQLC = req.user.data.idQLC
    let old_password = req.body.old_password
    let password = req.body.password
    if (!password) {
      return functions.setError(res, 'điền thiếu thông tin')
    }
    if (password.length < 6) {
      return functions.setError(res, 'Password quá ngắn')
    }
    if (old_password) {
      let checkOldPassword = await Users.findOne({
        idQLC: idQLC,
        password: md5(old_password),
        type: 1,
      })
      if (checkOldPassword) {
        await Users.updateOne(
          { idQLC: idQLC, type: 1 },
          {
            $set: {
              password: md5(password),
            },
          }
        )
        return functions.success(res, 'cập nhập thành công')
      }
      return functions.setError(
        res,
        'Mật khẩu cũ không đúng, vui lòng kiểm tra lại'
      )
    }
  } catch (error) {
    return functions.setError(res, error.message)
  }
}
exports.updatePasswordbyInput = async (req, res, next) => {
  try {
    let phoneTK = req.body.phoneTK
    let email = req.body.email
    let password = req.body.password
    if (phoneTK && password) {
      if (password.length < 6) {
        return functions.setError(res, 'Password quá ngắn')
      }
      let checkPass = await functions.getDatafindOne(Users, {
        phoneTK,
        password: md5(password),
        type: 1,
      })
      if (!checkPass) {
        await Users.updateOne(
          { phoneTK: phoneTK, type: 1 },
          {
            $set: {
              password: md5(password),
            },
          }
        )
        return functions.success(res, 'cập nhập thành công')
      }
      return functions.setError(
        res,
        'mật khẩu đã tồn tại, xin nhập mật khẩu khác '
      )
    } else if (email && password) {
      if (password.length < 6) {
        return functions.setError(res, 'Password quá ngắn')
      }
      let checkPass = await functions.getDatafindOne(Users, {
        email,
        password: md5(password),
        type: 1,
      })
      if (!checkPass) {
        await Users.updateOne(
          { email: email, type: 1 },
          {
            $set: {
              password: md5(password),
            },
          }
        )
        return functions.success(res, 'cập nhập thành công')
      }
      return functions.setError(
        res,
        'mật khẩu đã tồn tại, xin nhập mật khẩu khác '
      )
    } else {
      return functions.setError(res, ' điền thiếu trường ')
    }
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

// // hàm bước 1 của quên mật khẩu
// exports.forgotPassword = async(req, res) => {
//     try {
//         let otp = req.body.ma_xt || null
//         let phoneTK = req.body.phoneTK;
//         let email = req.body.email;
//         let password = req.body.password;
//         let re_password = req.body.re_password;
//         let data = []
//         if ((phoneTK || email) && (!otp)) {
//             let checkMail = await functions.checkEmail(email)
//             let checkPhone = await functions.checkPhoneNumber(phoneTK)
//             if (checkMail || checkPhone) {
//                 let findUser = await Users.findOne({ $or: [{ email: email, type: 1 }, { phoneTK: phoneTK, type: 1 }] })
//                 if (findUser) {
//                     let otp = functions.randomNumber
//                     data = await Users.updateOne({ $or: [{ email: email, type: 1 }, { phoneTK: phoneTK, type: 1 }] }, {
//                         $set: {
//                             otp: otp
//                         }
//                     })
//                     return functions.success(res, "Gửi mã OTP thành công", { data, otp })
//                 } else {
//                     return functions.setError(res, "tài khoản không tồn tại")
//                 }
//             } else {
//                 return functions.setError(res, " email không đúng định dạng ")
//             }

//         } else if (otp && (phoneTK || email)) {
//             let verify = await Users.findOne({ $or: [{ email: email, otp, type: 1 }, { phoneTK: phoneTK, otp, type: 1 }] });
//             if (verify != null) {
//                 await Users.updateOne({ $or: [{ email: email, type: 1 }, { phoneTK: phoneTK, type: 1 }] }, {
//                     $set: {
//                         authentic: 1
//                     }
//                 });
//                 await functions.success(res, "xác thực thành công");
//             } else {
//                 return functions.setError(res, "xác thực thất bại");
//             }
//         } else if (password && re_password) {
//             let checkPassword = await functions.verifyPassword(password)
//             if (!checkPassword) {
//                 return functions.setError(res, "sai dinh dang Mk")
//             }
//             if (!password && !re_password) {
//                 return functions.setError(res, 'Missing data')
//             }
//             if (password.length < 6) {
//                 return functions.setError(res, 'Password quá ngắn')
//             }
//             if (password !== re_password) {
//                 return functions.setError(res, 'Password nhập lại không trùng khớp')
//             }
//             await Users.updateOne({ $or: [{ email: email, authentic: 1, type: 1 }, { phoneTK: phoneTK, authentic: 1, type: 1 }] }, {
//                 $set: {
//                     password: md5(password),
//                 }
//             });
//             return functions.success(res, 'cập nhập MK thành công')

//         } else {
//             return functions.setError(res, "thiếu dữ liệu")
//         }
//     } catch (e) {
//         return functions.setError(res, e.message)
//     }
// }

exports.updateInfoCompany = async (req, res, next) => {
  try {
    let idQLC = req.user.data.idQLC
    let data = []
    const { userName, emailContact, phone, address, description, com_size } =
      req.body
    let updatedAt = new Date()
    let File = req.files || null
    let avatarUser = null
    if (idQLC !== undefined) {
      let findUser = Users.findOne({ idQLC: idQLC, type: 1 })
      if (findUser) {
        if (File && File.avatarUser) {
          let upload = await fnc.uploadAvaComQLC(File.avatarUser, [
            '.jpeg',
            '.jpg',
            '.png',
          ])
          if (!upload) {
            return functions.setError(res, 'Định dạng ảnh không hợp lệ')
          }
          avatarUser = upload
        }
        let set = {
          userName: userName,
          emailContact: emailContact,
          phone: phone,
          avatarUser: avatarUser,
          address: address,
          updatedAt: functions.getTimeNow(),
        }
        if (description) {
          set['inForCompany.description'] = description
        }
        if (com_size) {
          set['inForCompany.com_size'] = com_size
        }
        data = await Users.updateOne(
          { idQLC: idQLC, type: 1 },
          {
            $set: set,
          }
        )
        await functions.success(res, 'update company info success')
      } else {
        return functions.setError(res, 'không tìm thấy user')
      }
    } else {
      return functions.setError(res, 'không tìm thấy token')
    }
  } catch (error) {
    return functions.setError(res, error.message)
  }
}
exports.info = async (req, res) => {
  try {
    const idQLC = req.user.data.idQLC
    const users = await Users.aggregate([
      {
        $match: { idQLC: Number(idQLC), type: 1 },
      },
      {
        $project: {
          com_id: '$idQLC',
          com_parent_id: '$inForCompany.cds.com_parent_id',
          com_name: '$userName',
          com_email: '$email',
          com_phone_tk: '$phoneTK',
          type_timekeeping: '$inForCompany.cds.type_timekeeping',
          id_way_timekeeping: '$inForCompany.cds.id_way_timekeeping',
          com_logo: '$avatarUser',
          com_role_id: '$inForCompany.cds.com_role_id',
          com_size: '$inForCompany.com_size',
          com_description: '$inForCompany.description',
          com_create_time: '$createdAt',
          com_update_time: '$updatedAt',
          com_authentic: '$authentic',
          com_qr_logo: '$inForCompany.cds.com_qr_logo',
          enable_scan_qr: '$inForCompany.cds.enable_scan_qr',
          from_source: '$fromWeb',
          com_qr_logo: '$inForCompany.cds.com_qr_logo',
          com_email_lh: '$emailContact',
          com_phone: '$phone',
          com_address: '$address',
          com_vip: '$inForCompany.cds.com_vip',
        },
      },
    ])

    if (users.length > 0) {
      const data = users[0]
      data.com_logo = await fnc.createLinkFileComQLC(
        data.com_create_time,
        data.com_logo
      )
      data.departmentsNum = await Deparment.countDocuments({ com_id: idQLC })
      data.userNum = await Users.countDocuments({
        'inForPerson.employee.com_id': idQLC,
      })
      return functions.success(res, 'Lấy thành công', { data })
    }
    return functions.setError(res, 'Không có dữ liệu')
  } catch (e) {
    return functions.setError(res, e.message)
  }
}

exports.update_type_timekeeping = async (req, res) => {
  try {
    const user = req.user.data
    if (user.type == 1) {
      const { type_timekeeping } = req.body
      if (type_timekeeping) {
        await Users.updateOne(
          { _id: user._id },
          {
            $set: { 'inForCompany.cds.type_timekeeping': type_timekeeping },
          }
        )
        return functions.success(res, 'Cập nhật thành công')
      }
      return functions.setError(res, 'Chưa truyền lên type_timekeeping')
    }
    return functions.setError(res, 'Tài khoản không phải tài khoản công ty')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.update_way_timekeeping = async (req, res) => {
  try {
    const user = req.user.data
    if (user.type == 1) {
      const { lst_way_id } = req.body
      if (lst_way_id) {
        await Users.updateOne(
          { _id: user._id },
          {
            $set: { 'inForCompany.cds.id_way_timekeeping': lst_way_id },
          }
        )
        return functions.success(res, 'Cập nhật thành công')
      }
      return functions.setError(res, 'Chưa truyền lên lst_way_id')
    }
    return functions.setError(res, 'Tài khoản không phải tài khoản công ty')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.isExists = async (req, res) => {
  try {
    let { com_id } = req.body
    if (!com_id) return functions.setError(res, 'Chưa truyền lên com_id')

    let [user, organizeDetail, positions] = await Promise.all(
      [
        Users.findOne({ idQLC: com_id, type: 1 }),
        QLC_OrganizeDetail.find({ comId: com_id }, { _id: 0, id: 1, organizeDetailName: 1, listOrganizeDetailId: 1 }).lean(),
        QLC_Positions.find({ comId: com_id }, { _id: 0, id: 1, positionName: 1 }).lean()
      ]
    )
    organizeDetail.map(e => {
      e.organizeDetailId = e.id
      delete e.id
    })

    positions.map(e => {
      e.position_id = e.id
      delete e.id
    })

    if (!user) return functions.setError(res, 'Công ty không tồn tại')
    return functions.success(res, 'Công ty tồn tại', {
      detail_company: {
        com_id: com_id,
        com_name: user.userName,
      },
      list_department: [],
      list_organizeDetail: organizeDetail || [],
      list_positions: positions || [],
    })
  } catch (error) {
    return functions.setError(res, 'Công ty không tồn tại')
  }
}
