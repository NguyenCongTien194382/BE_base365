const functions = require('../../services/functions')
const Users = require('../../models/Users')
const QRCode = require('../../models/qlc/QRCode')
const SettingTrackingQR = require('../../models/qlc/SettingTrackingQR')
const qrcode = require('qrcode')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const CC365_Cycle = require('../../models/qlc/Cycle')
const TimeSheets = require('../../models/qlc/TimeSheets')
const Shifts = require('../../models/qlc/Shifts')
const Location = require('../../models/qlc/Location')
const EmployeeCycle = require('../../models/qlc/CalendarWorkEmployee')
const SettingWifi = require('../../models/qlc/SettingWifi')
const fs = require('fs')

const formatDate = (d) =>
  [
    d.getFullYear(),
    (d.getMonth() + 1).toString().padStart(2, '0'),
    d.getDate().toString().padStart(2, '0'),
  ].join('-')

// const Jimp = require('jimp');
// const pngjs = require('pngjs')
// const QrCodeReader = require('qrcode-reader');
const axios = require('axios')

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180
}
// tính khoảng cách
const calculateDistanceToCenter = (
  latitude,
  longtitude,
  centerLatitude,
  centerLongtitude
) => {
  // Chuyển đổi vị độ từ độ sang radian

  latitude = toRadians(latitude)
  longtitude = toRadians(longtitude)
  centerLatitude = toRadians(centerLatitude)
  centerLongtitude = toRadians(centerLongtitude)

  // Tính chênh lệch giữa các kinh độ và vĩ độ
  var dlatitude = latitude - centerLatitude
  var dlongtitude = longtitude - centerLongtitude

  // Áp dụng công thức haversine
  var a =
    Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2) +
    Math.cos(latitude) *
    Math.cos(centerLatitude) *
    Math.sin(dlongtitude / 2) *
    Math.sin(dlongtitude / 2)

  // var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var c = 2 * Math.asin(Math.sqrt(a))

  // Bán kính trái đất (đơn vị km)
  var radius = 6371

  // Tính khoảng cách (m)
  var distance = 6378137 * c

  return distance
}
// lưu QR
const saveImg = (img_url, com_id, inputDate) => {
  let pathnameSplit
  pathnameSplit = __dirname
    .split('/')
    .filter((item) => item !== '')
    .slice(0, -3)
  if (pathnameSplit && pathnameSplit.length === 0)
    pathnameSplit = __dirname
      .split('\\')
      .filter((item) => item !== '')
      .slice(0, -3)
  let pathname =
    '/' + pathnameSplit.join('/') + '/storage/base365/timviec365/QRCode'
  if (!fs.existsSync(pathname)) {
    fs.mkdirSync(pathname)
  }
  // pathname = pathnameSplit.join('/') + '/storage/base365/chamcong/QRCode'
  // if (!fs.existsSync(pathname)) {
  //     fs.mkdirSync(pathname)
  // }
  if (!fs.existsSync(pathname + '/' + com_id)) {
    fs.mkdirSync(pathname + '/' + com_id)
  }

  if (!fs.existsSync(pathname + '/' + com_id)) {
    fs.mkdirSync(pathname + '/' + com_id)
  }

  if (!fs.existsSync(pathname + '/' + com_id)) {
    fs.mkdirSync(pathname + '/' + com_id)
  }
  if (!fs.existsSync(pathname + '/' + com_id)) {
    fs.mkdirSync(pathname + '/' + com_id)
  }

  const date = new Date(inputDate)
  const curDay = date.toLocaleDateString('en-US').replaceAll('/', '-')
  if (!fs.existsSync(pathname + '/' + com_id + '/' + curDay)) {
    fs.mkdirSync(pathname + '/' + com_id + '/' + curDay)
  }

  // write to file
  const image = Buffer.from(img_url.split(',')[1], 'base64')
  const time = date.getTime()

  fs.writeFileSync(
    pathname + '/' + com_id + '/' + curDay + '/' + time + '.png',
    image
  )

  return `https://api.timviec365.vn/timviec365/QRCode/${com_id}/${curDay}/${time}.png`
}

const handleWithTimezone = (yourDate) => {
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000)
  return yourDate.toISOString().split('T')[0]
}



const getListShiftEmp = async (id_com, id_use, time) => {
  try {
    const date = new Date(time)
    console.log('date', date)
    const y = date.getFullYear()
    let m = date.getMonth() + 1
    m = m < 10 ? '0' + m : m
    const dateNow = functions.convertDate(null, true).replaceAll('/', '-')
    const user = await Users.aggregate([
      {
        $match: {
          idQLC: Number(id_use),
          type: 2,
          'inForPerson.employee.com_id': Number(id_com),
          'inForPerson.employee.ep_status': 'Active',
        },
      },
      {
        $project: {
          ep_name: '$userName',
        },
      },
    ])
    if (user.length == 1) {
      // console.log("Nhân viên ok", user[0]);
      const candidate = user[0]
      const db_cycle = await CC365_Cycle.aggregate([
        {
          $lookup: {
            from: 'CC365_EmployeCycle',
            localField: 'cy_id',
            foreignField: 'cy_id',
            as: 'employee_cycle',
          },
        },
        { $unwind: '$employee_cycle' },
        {
          $match: {
            'employee_cycle.ep_id': Number(id_use),
            apply_month: {
              $gte: new Date(`${y}-${m}-01 00:00:00`),
              $lte: new Date(`${dateNow} 23:59:59`),
            },
          },
        },
        {
          $sort: { 'employee_cycle.update_time': -1 },
        },
        { $limit: 1 },
      ])

      let arr_shift_id = ''
      let arr_shift = []
      if (db_cycle.length > 0) {
        const cycle = db_cycle[0]
        let detail_cy = JSON.parse(cycle.cy_detail)

        for (let i = 0; i < detail_cy.length; i++) {
          const element = detail_cy[i]
          // tien long - sửa
          const tempdate = handleWithTimezone(new Date(element.date))

          if (tempdate == dateNow) {
            arr_shift_id = element.shift_id
            break
          }
        }

        let list_shift = []
        if (arr_shift_id != '') {
          list_shift = await Shifts.find({
            shift_id: { $in: arr_shift_id.split(',').map(Number) },
          }).lean()
        }
        let hour = date.getHours(),
          minute = date.getMinutes(),
          second = date.getSeconds()
        hour = hour >= 10 ? hour : `0${hour}`
        minute = minute >= 10 ? minute : `0${minute}`
        second = second >= 10 ? second : `0${second}`
        const hourNow = `${hour}:${minute}:${second}`

        for (let j = 0; j < list_shift.length; j++) {
          const element = list_shift[j]

          let end_time =
            element.end_time_earliest == '00:00'
              ? '12:00'
              : element.end_time_earliest

          if (!element.over_night) {
            if (
              (element.start_time_latest <= hourNow && end_time >= hourNow) ||
              element.start_time_latest == null ||
              end_time == null ||
              element.start_time_latest == '00:00' ||
              end_time == '00:00'
            ) {
              const type = await getDataInOut(id_use, id_com)

              arr_shift.push({
                ...element,
                type: type === 1 ? 'Ca vào' : 'Ca ra',
              })
            }
          } else {
            if (
              element.start_time_latest <= hourNow ||
              element.start_time_latest == null ||
              element.start_time_latest == '00:00'
            ) {
              const type = await getDataInOut(id_use, id_com)

              arr_shift.push({
                ...element,
                type: type === 1 ? 'Ca vào' : 'Ca ra',
              })
            }
          }
        }

        // tìm kiếm thêm ca liên ngày
        detail_cy = detail_cy.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

        const find_data_cy_detail = detail_cy.find((e) => {
          return (
            new Date(e.date).getTime() < new Date(dateNow).getTime() &&
            e.shift_id
          )
        })

        let list_shift_over = []
        console.log('find_data_cy_detail', find_data_cy_detail)
        if (find_data_cy_detail) {
          const date_shift = find_data_cy_detail.date
          number_date_shift = new Date(date_shift).getDate()
          number_date_now = new Date(dateNow).getDate()

          list_shift_over = await Shifts.find({
            shift_id: {
              $in: find_data_cy_detail.shift_id.split(',').map(Number),
            },
            over_night: 1,
            nums_day: number_date_now - number_date_shift + 1,
          }).lean()
          if (list_shift_over && list_shift_over.length > 0) {
            for (let j = 0; j < list_shift_over.length; j++) {
              const element = list_shift_over[j]
              let end_time = element.end_time_earliest
                ? element.end_time_earliest
                : element.end_time
              if (
                new Date(date_shift).getFullYear() === date.getFullYear() &&
                new Date(date_shift).getMonth() === date.getMonth() &&
                new Date(date_shift).getDate() === date.getDate()
              ) {
                if (
                  element.start_time_latest <= hourNow ||
                  element.start_time_latest == null ||
                  element.start_time_latest == '00:00'
                ) {
                  const type = await getDataInOut(id_use, id_com)
                  arr_shift.push({
                    ...element,
                    type: type === 1 ? 'Ca vào' : 'Ca ra',
                  })
                }
              } else if (
                new Date(date_shift).getFullYear() === date.getFullYear() &&
                new Date(date_shift).getDate() !== date.getDate()
              ) {
                if (
                  new Date(date_shift).getMonth() === date.getMonth() &&
                  date.getDate() - new Date(date_shift).getDate() ===
                  element.nums_day - 1
                ) {
                  if (end_time >= hourNow || end_time == null) {
                    const type = await getDataInOut(id_use, id_com)

                    arr_shift.push({
                      ...element,
                      type: type === 1 ? 'Ca vào' : 'Ca ra',
                    })
                  }
                } else if (
                  new Date(date_shift).getMonth() !== date.getMonth() &&
                  date.getDate() ===
                  new Date(date_shift).getDate() +
                  element.nums_day -
                  1 -
                  new Date(
                    new Date(date_shift).getFullYear(),
                    new Date(date_shift).getMonth() + 1,
                    0
                  ).getDate()
                ) {
                  if (end_time >= hourNow || end_time == null) {
                    const type = await getDataInOut(id_use, id_com)

                    arr_shift.push({
                      ...element,
                      type: type === 1 ? 'Ca vào' : 'Ca ra',
                    })
                  }
                }
              }
            }
          }
        }

        return {
          success: true,
          ep_name: candidate.ep_name,
          shift: arr_shift,
          cycle: db_cycle,
        }
      } else {
        return { success: true, ep_name: candidate.ep_name, shift: [] }
      }
    }
    return {
      success: false,
      message: 'Nhân viên không tồn tại hoặc chưa được duyệt',
    }
  } catch (error) {
    console.log(error)
    return { success: false, message: error.message }
  }
}
// lưu data chấm công
const insertTimeKeeping = async (
  com_id,
  idQLC,
  time,
  ts_lat,
  ts_long,
  wifi_ip,
  shift_id,
  img_url,
  ts_location_name = '',
  device = 'QR Code'
) => {
  try {
    // tìm data xem ca trước là loại gì - vào/ ra
    const timeSheetLatest = await TimeSheets.aggregate([
      {
        $match: {
          ep_id: Number(idQLC),
          ts_com_id: Number(com_id),
        },
      },
      {
        $sort: {
          at_time: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          type: { $ifNull: ['$type', null] },
          at_time: 1,
          ep_id: 1,
          sheet_id: 1,
          shift_id: 1,
        },
      },
    ])
    let type
    if (timeSheetLatest && timeSheetLatest.length > 0) {
      const ts = timeSheetLatest[0]
      const tempType = ts.type

      if (!tempType) {
        type = 1
      } else {
        type = tempType == 1 ? 2 : 1
      }
      // if (tempType)
    } else {
      type = 1
    }

    // lấy max id
    const max = await TimeSheets.findOne({}, { sheet_id: 1 })
      .sort({ sheet_id: -1 })
      .lean()

    // insert
    const item = new TimeSheets({
      sheet_id: Number(max.sheet_id) + 1,
      ep_id: Number(idQLC),
      at_time: time,
      device: device,
      ts_lat: ts_lat,
      ts_long: ts_long,
      wifi_ip: wifi_ip,
      shift_id: shift_id,
      is_success: 1,
      ts_error: '',
      ts_location_name: ts_location_name,
      note: '',
      ts_com_id: Number(com_id),
      type: type,
    })
    await item.save()

    return {
      success: true,
      message: 'Điểm danh thành công',
      data: { data: item },
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: error.message,
    }
  }
}

// laasy thong tin ca vao ra
const getDataInOut = async (id_use, id_com) => {
  const latestTimeSheetData = await TimeSheets.aggregate([
    {
      $match: {
        ep_id: id_use,
        ts_com_id: id_com,
      },
    },
    {
      $sort: {
        at_time: -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        type: { $ifNull: ['$type', null] },
      },
    },
  ])

  let type
  if (latestTimeSheetData && latestTimeSheetData.length > 0) {
    const ts = latestTimeSheetData[0]
    const tempType = ts.type

    if (!tempType) {
      type = 1
    } else {
      type = tempType == 1 ? 2 : 1
    }
    // if (tempType)
  } else {
    type = 1
  }

  return type
}

// tạo mới 1 mã QR
exports.create = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      const { QRCodeName } = req.body
      if ((com_id, QRCodeName)) {
        const foundGateway = await QRCode.findOne({
          QRCodeName: QRCodeName,
          comId: com_id,
        })
        if (foundGateway) return functions.setError(res, 'Tên mã QR đã tồn tại')
        const maxId =
          (await QRCode.findOne({}, { id: 1 }, { sort: { id: -1 } }).lean()) ||
          0
        const id = Number(maxId.id) + 1 || 1
        const token = await jwt.sign(
          { com_id, id: id },
          process.env.NODE_SERCET
        )
        const qrCodeUrl = await qrcode.toDataURL(token)
        const imgUrl = saveImg(qrCodeUrl, com_id, new Date())

        const newQrCode = new QRCode({
          id: id,
          comId: com_id,
          QRCodeName: QRCodeName,
          QRCodeUrl: imgUrl,
          QRstatus: 1,
          created_time: functions.getTimeNow(),
          update_time: functions.getTimeNow(),
        })
        await newQrCode.save()
        return functions.success(res, 'Tạo thành công', { data: newQrCode })
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (e) {
    console.log(e)
    return functions.setError(res, e.message)
  }
}
// danh sách mã QR công ty
exports.listAll = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      if (com_id) {
        const QRstatus = Number(req.body.QRstatus)
        const conditions = {
          comId: com_id,
        }
        if (QRstatus) conditions.QRstatus = QRstatus
        const result = await QRCode.find(conditions)
        return functions.success(res, 'Danh sách', { data: result })
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (e) {
    console.log(e)
    return functions.setError(res, e.message)
  }
}

//
// Tắt/mở sử dụng 1 mã QR, đổi tên
exports.update = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      const { id, QRCodeName, QRstatus } = req.body
      if (com_id && id) {
        const foundGateway = await QRCode.findOne({ id: Number(id) })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')
        const checkQRCode = await QRCode.findOne({
          id: { $ne: Number(id) },
          QRCodeName: QRCodeName || foundGateway.QRCodeName,
          QRstatus: QRstatus || foundGateway.QRstatus,
          comId: com_id,
        })
        if (checkQRCode) return functions.setError(res, 'Tên mã QR đã tồn tại')
        await QRCode.updateOne(
          {
            id: Number(id),
          },
          {
            QRCodeName: QRCodeName || foundGateway.QRCodeName,
            QRstatus: QRstatus || foundGateway.QRstatus,
          }
        )
        return functions.success(res, 'Sửa thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (e) {
    console.log(e)
    return functions.setError(res, e.message)
  }
}

// xóa mã QR

exports.delete = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      const { id } = req.body
      if (com_id && id) {
        const foundGateway = await QRCode.findOne({ id: Number(id) })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')
        await QRCode.deleteOne({ id: Number(id) })
        return functions.success(res, 'Xóa thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (e) {
    console.log(e)
    return functions.setError(res, e.message)
  }
}

// tạo cài đặt chấm công bằng QR
exports.SettingTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    const {
      listUsers,
      list_org,
      list_pos,
      list_shifts,
      list_ip,
      list_device,
      QRCode_id,
      list_loc,
      name,
      type_loc,
      type_ip,
    } = req.body
    if (listUsers && !Array.isArray(listUsers)) JSON.parse(listUsers)
    if (list_org && !Array.isArray(list_org)) JSON.parse(list_org)
    if (list_pos && !Array.isArray(list_pos)) JSON.parse(list_pos)
    if (list_shifts && !Array.isArray(list_shifts)) JSON.parse(list_shifts)
    const start_time = new Date(req.body.start_time)
    const end_time = new Date(req.body.end_time)
    if (type === 1 || isAdmin) {
      if ((list_loc, QRCode_id, start_time, end_time, name)) {
        if (start_time.getTime() / 1000 > end_time.getTime() / 1000)
          return functions.setError(
            res,
            'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
          )
        const maxId =
          (await SettingTrackingQR.findOne(
            {},
            { id: 1 },
            { sort: { id: -1 } }
          ).lean()) || 0
        const id = Number(maxId.id) + 1 || 1
        const foundGateway = await SettingTrackingQR.findOne({})
        const newData = new SettingTrackingQR({
          id: id,
          name: name,
          com_id: com_id,
          list_org: list_org,
          list_pos: list_pos,
          list_shifts: list_shifts,
          listUsers: listUsers || [],
          list_ip: list_ip || [],
          list_device: list_device || [],
          QRCode_id: QRCode_id,
          list_loc: list_loc,
          start_time: start_time,
          end_time: end_time,
          type_loc: Number(type_loc),
          type_ip: Number(type_ip),
        })
        await newData.save()
        return functions.success(res, 'Tạo thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.createUserTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    const { listUsers, id } = req.body
    if (listUsers && !Array.isArray(listUsers)) JSON.parse(listUsers)
    if (type === 1 || isAdmin) {
      if (com_id && listUsers && id) {
        const foundGateway = await SettingTrackingQR.findOne({ id: Number(id) })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')
        const dataUsers = foundGateway.listUsers
        listUsers.map((e) => {
          if (!dataUsers.includes(e)) dataUsers.push(e)
        })

        await SettingTrackingQR.updateOne(
          {
            id: Number(id),
          },
          {
            $set: {
              listUsers: dataUsers,
            },
          }
        )
        return functions.success(res, 'Thêm thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

exports.deleteUserTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    const { listUsers, id } = req.body
    if (listUsers && !Array.isArray(listUsers)) JSON.parse(listUsers)
    if (type === 1 || isAdmin) {
      if (com_id && listUsers && id) {
        const foundGateway = await SettingTrackingQR.findOne({ id: Number(id) })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')
        const dataUsers = foundGateway.listUsers
        listUsers.map((e) => {
          if (dataUsers.indexOf(e) !== -1)
            dataUsers.splice(dataUsers.indexOf(e), 1)
        })
        await SettingTrackingQR.updateOne(
          {
            id: Number(id),
          },
          {
            $set: {
              listUsers: dataUsers,
            },
          }
        )
        return functions.success(res, 'Xóa thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

// danh sách cài đặt
exports.listSettingTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    const id = Number(req.body.id)
    const conditions = {
      com_id: com_id,
    }
    if (id) conditions.id = id
    if (type === 1 || isAdmin) {
      if (com_id) {
        const result = await SettingTrackingQR.aggregate([
          {
            $match: conditions,
          },
          {
            $sort: { created_time: -1 }
          },
          {
            $lookup: {
              from: 'QLC_SettingWifi', // Tên của bảng Học sinh
              localField: 'list_ip', // Trường trong bảng Class
              foreignField: 'id', // Trường trong bảng Students là ID của học sinh
              as: 'settingWifi', // Tên của trường kết quả trong mảng mới
            },
          },
          {
            $lookup: {
              from: 'QLC_Location', // Tên của bảng Học sinh
              localField: 'list_loc', // Trường trong bảng Class
              foreignField: 'cor_id', // Trường trong bảng Students là ID của học sinh
              as: 'location', // Tên của trường kết quả trong mảng mới
            },
          },

          // { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },

          {
            $lookup: {
              from: 'QRCode', // Tên của bảng Học sinh
              localField: 'QRCode_id', // Trường trong bảng Class
              foreignField: 'id', // Trường trong bảng Students là ID của học sinh
              as: 'qRCode', // Tên của trường kết quả trong mảng mới
            },
          },
          {
            $lookup: {
              from: 'Users', // Tên của bảng Học sinh
              localField: 'listUsers', // Trường trong bảng Class
              foreignField: 'idQLC', // Trường trong bảng Students là ID của học sinh
              pipeline: [
                {
                  $match: {
                    type: 2,
                  },
                },
              ],
              as: 'users', // Tên của trường kết quả trong mảng mới
            },
          },
          {
            $lookup: {
              from: 'QLC_Positions', // Tên của bảng Học sinh
              localField: 'list_pos', // Trường trong bảng Class
              foreignField: 'id', // Trường trong bảng Students là ID của học sinh
              pipeline: [
                {
                  $match: {
                    comId: com_id,
                  },
                },
              ],
              as: 'positions', // Tên của trường kết quả trong mảng mới
            },
          },

          {
            $lookup: {
              from: 'QLC_OrganizeDetail', // Tên của bảng Học sinh
              localField: 'list_org', // Trường trong bảng Class
              foreignField: 'id', // Trường trong bảng Students là ID của học sinh
              pipeline: [
                {
                  $match: {
                    comId: com_id,
                  },
                },
              ],
              as: 'organizeDetail', // Tên của trường kết quả trong mảng mới
            },
          },

          {
            $lookup: {
              from: 'QLC_Shifts', // Tên của bảng Học sinh
              localField: 'list_shifts.id', // Trường trong bảng Class
              foreignField: 'shift_id', // Trường trong bảng Students là ID của học sinh
              pipeline: [
                {
                  $match: {
                    com_id: com_id,
                  },
                },
              ],
              as: 'shifts', // Tên của trường kết quả trong mảng mới
            },
          },
          {
            $sort: {
              created_time: -1,
            },
          },
          // { $unwind: { path: '$qRCode', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: -1,
              id: 1,
              name: 1,
              com_id: 1,
              listUsers: 1,
              list_org: 1,
              list_pos: 1,
              list_shifts: 1,
              list_device: 1,
              list_loc: '$location',
              type_loc: 1,
              type_ip: 1,

              // location_id: '$location.cor_id',
              // cor_location_name: '$location.cor_location_name',
              // cor_radius: '$location.cor_radius',
              list_ip: 1,
              list_name_wifi: '$settingWifi.name_wifi',
              QRCodeUrl: '$qRCode.QRCodeUrl',
              QRstatus: '$qRCode.QRstatus',
              QRCodeName: '$qRCode.QRCodeName',
              start_time: 1,
              end_time: 1,
              list_userName: '$users.userName',
              list_positionName: '$positions.positionName',
              list_organizeDetailName: '$organizeDetail.organizeDetailName',
              list_shiftName: '$shifts.shift_name',
              QRCode_id: 1,
            },
          },
        ])

        result.map(async (e, index) => {
          e.ep_num = e.listUsers ? e.listUsers.length : null
          e.org_num = e.list_org ? e.list_org.length : null
          e.pos_num = e.list_pos ? e.list_pos.length : null
          e.shift_num = e.list_shifts ? e.list_shifts.length : null
          if (Number(e.type_shift) === 1) {
          }
        })
        return functions.success(res, 'Danh sách cài đặt', { data: result })
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

// sửa cài đặt
exports.updateSettingTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      let {
        id,
        listUsers,
        list_org,
        list_pos,
        list_shifts,
        list_ip,
        QRCode_id,
        list_loc,
        start_time,
        end_time,
        name,
        type_ip,
        type_loc,
        app,
      } = req.body
      if (id && com_id) {
        const foundGateway = await SettingTrackingQR.findOne({ id: Number(id) })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')

        if (type_ip == 2 || type_ip == 3) list_ip = []
        if (type_loc == 2 || type_loc == 3) list_loc = []

        if (!app) {
          if (list_loc == 'Tất cả vị trí') {
            list_loc = []
            type_loc = 3
          }
          if (list_loc.length > 0 && list_loc[0] == 'Tất cả vị trí') {
            list_loc = []
            type_loc = 3
          }
          if (list_loc == 'Tất cả vị trí đã được lưu') {
            list_loc = []
            type_loc = 2
          }
          if (
            list_loc.length > 0 &&
            list_loc[0] == 'Tất cả vị trí đã được lưu'
          ) {
            list_loc = []
            type_loc = 2
          }

          if (list_ip == 'Tất cả wifi') {
            list_ip = []
            type_ip = 3
          }
          if (list_ip.length > 0 && list_ip[0] == 'Tất cả wifi') {
            list_ip = []
            type_ip = 3
          }
          if (list_ip == 'Tất cả wifi đã được lưu') {
            list_ip = []
            type_ip = 2
          }
          if (list_ip.length > 0 && list_ip[0] == 'Tất cả wifi đã được lưu') {
            list_ip = []
            type_ip = 2
          }
          if (listUsers == 'Tất cả nhân viên') {
            listUsers = []
          }
          if (list_pos == 'Tất cả chức vụ') {
            list_pos = []
          }
          if (list_shifts == 'Tất cả ca làm việc') {
            list_shifts = []
          }
          if (
            list_shifts.length == 1 &&
            !list_shifts[0].id &&
            !list_shifts[0].type_shift
          ) {
            list_shifts = []
          }
        }
        await SettingTrackingQR.updateOne(
          {
            id: Number(id),
          },
          {
            $set: {
              name: name || foundGateway.name,
              list_org: list_org || foundGateway.list_org,
              list_pos: list_pos || foundGateway.list_pos,
              list_shifts: list_shifts || foundGateway.list_shifts,
              listUsers: listUsers || foundGateway.listUsers,
              list_ip: list_ip || foundGateway.list_ip,
              QRCode_id: QRCode_id || foundGateway.QRCode_id,
              list_loc: list_loc || foundGateway.list_loc,
              start_time:
                new Date(start_time) || new Date(foundGateway.start_time),
              end_time: new Date(end_time) || new Date(foundGateway.end_time),
              type_ip: type_ip || 0,
              type_loc: type_loc || 0,
            },
          }
        )
        return functions.success(res, 'Cập nhật thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (error) {
    console.log('error', error)
    return functions.setError(res, error.message)
  }
}
// xóa cài đặt
exports.deleteSettingTrackingQR = async (req, res) => {
  try {
    const com_id = Number(req.user.data.com_id)
    const type = Number(req.user.data.type)
    const isAdmin = Number(req.user.data.isAdmin)
    if (type === 1 || isAdmin) {
      const id = Number(req.body.id)
      if (com_id && id) {
        const foundGateway = await SettingTrackingQR.findOne({ id })
        if (!foundGateway)
          return functions.setError(res, 'Bản ghi không tồn tại')
        await SettingTrackingQR.deleteOne({ id })
        return functions.success(res, 'Xóa thành công')
      }
      return functions.setError(res, 'Thiếu thông tin')
    }
    return functions.setError(res, 'Tài khoản không có quyền')
  } catch (error) {
    return functions.setError(res, error.message)
  }
}

// chấm công
exports.saveHisForApp = async (req, res) => {
  try {
    // const base64QRImage = req.body.base64QRImage
    const type = Number(req.user.data.type)
    const com_id = Number(req.user.data.com_id)
    const idQLC = Number(req.user.data.idQLC)

    const token = req.body.token
    const img = req.body.img
    const lat = Number(req.body.latitude)
    const long = Number(req.body.longtitude)
    let location_name = req.body.location_name
    const forwardedIpsStr = req.header('x-forwarded-for')
    let ip

    ip = forwardedIpsStr.split(',')[0]
    let shiftId = Number(req.body.shiftId)
    const time = req.body.time
    const now = new Date(time)
    let listFindSettingQR
    if (com_id && token && idQLC && ip && time && lat && long) {
      // kiểm tra mã QR

      const dataToken = await jwt.verify(token, process.env.NODE_SERCET)

      if (dataToken) {
        const QRCode_id = Number(dataToken.id)
        const currentDate = new Date()

        if (Number(dataToken.com_id) !== com_id)
          return functions.setError(res, 'QR Code không chính xác')
        listFindSettingQR = await SettingTrackingQR.find({
          com_id: com_id,
          QRCode_id: QRCode_id,
          start_time: { $lte: currentDate },
          end_time: { $gte: currentDate },
        })

        let checkTracking = false
        const findUser = await Users.findOne(
          { idQLC: idQLC, 'inForPerson.employee.com_id': com_id, type: 2 },
          {
            idQLC: 1,
            position_id: '$inForPerson.employee.position_id',
            listOrganizeDetailId: '$inForPerson.employee.listOrganizeDetailId',
          }
        ).lean()

        if (!findUser) {
          return functions.setError(res, 'Nhân viên không tồn tại')
        }
        let list_shift_timeSheet = []

        if (listFindSettingQR.length > 0) {
          let firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          const llv = await EmployeeCycle.aggregate([
            {
              $match: {
                ep_id: Number(idQLC),
              },
            },
            {
              $lookup: {
                from: 'CC365_Cycle',
                localField: 'cy_id',
                foreignField: 'cy_id',
                pipeline: [
                  {
                    $match: {
                      apply_month: { $lte: lastDay, $gte: firstDay },
                      com_id: Number(com_id),
                    },
                  },
                ],
                as: 'cycle',
              },
            },
            {
              $unwind: '$cycle',
            },
          ])
          const shifts = await Shifts.find({ com_id: Number(com_id) }).lean()
          if (llv.length < 1)
            return functions.setError(
              res,
              'Nhân viên không tồn tại lịch làm việc',
              500
            )

          const cy_detail = llv[0].cycle.cy_detail

          const json = JSON.parse(cy_detail)
          const nowString = formatDate(now)
          const listShiftToday = []
          for (let i = 0; i < json.length; i++) {
            const date = json[i].date

            if (date == nowString) {
              const shiftList = json[i].shift_id.split(',')
              for (j = 0; j < shiftList.length; j++) {
                listShiftToday.push(
                  shifts.find((item) => item.shift_id == shiftList[j])
                )
              }
            }
          }

          // lay shift hien tai
          let temp = await getListShiftEmp(com_id, idQLC, time)
          console.log('------------------------')
          console.log(temp)
          console.log('------------------------')
          if (shiftId)
            temp.shift = temp.shift.filter((e) => e.shift_id === shiftId)

          let data_location = await Location.find({
            id_com: Number(com_id),
          }).lean()

          const wifi = await SettingWifi.find({ id_com: Number(com_id) }).lean()
          for (let i = 0; i < listFindSettingQR.length; i++) {
            console.log('Lần thứ >>>>>>>>>>>>>>>', i + 1)
            let checkAll = true
            let findSettingQR = listFindSettingQR[i]
            const list_loc = findSettingQR.list_loc
            const type_loc = findSettingQR.type_loc
            const list_ip = findSettingQR.list_ip
            const type_ip = findSettingQR.type_ip
            const list_shifts = findSettingQR.list_shifts
            if (true) {
              if (
                findSettingQR.list_pos &&
                findSettingQR.list_pos.length !== 0
              ) {
                if (
                  !findSettingQR.list_pos.includes(Number(findUser.position_id))
                ) {
                  console.log(
                    '===============Chức vụ không được phép==============='
                  )
                  checkAll = false
                  continue
                }
              }

              if (
                findSettingQR.list_org &&
                findSettingQR.list_org.length !== 0
              ) {
                let findOrg = false
                findUser.listOrganizeDetailId.map((e) => {
                  if (
                    findSettingQR.list_org.includes(Number(e.organizeDetailId))
                  )
                    findOrg = true
                })
                if (!findOrg) {
                  console.log(
                    '===============Tổ chức không được phép==============='
                  )
                  checkAll = false
                  continue
                }
              }

              if (
                findSettingQR.listUsers &&
                findSettingQR.listUsers.length !== 0 &&
                !findSettingQR.listUsers.includes(idQLC)
              ) {
                console.log(
                  '===============Nhân viên không được phép==============='
                )
                checkAll = false
                continue
              }
            }

            // kiểm tra vị trí

            // if (true) {
            //   const findLocation = await Location.findOne({
            //     cor_id: findSettingQR.location_id,
            //   })
            //   if (!findLocation) checkAll = false

            //   const distance = calculateDistanceToCenter(
            //     latitude,
            //     longtitude,
            //     findLocation.cor_lat,
            //     findLocation.cor_long
            //   )

            //   if (distance > findLocation.radius) checkAll = false
            // }

            // check vị trí
            console.log('list_loc', list_loc)
            console.log('data_location.length', data_location.length)
            if (data_location && data_location.length > 0) {
              if (list_loc.length > 0) {
                let kt = 0
                let location = data_location.filter((e) =>
                  list_loc.includes(Number(e.cor_id))
                )
                console.log('location', location)
                if (location && location.length > 0) {
                  for (let t = 0; t < location.length; t++) {
                    const distance = calculateDistanceToCenter(
                      lat,
                      long,
                      location[t].cor_lat,
                      location[t].cor_long
                    )

                    if (
                      distance > location[t].cor_radius &&
                      location[t].cor_radius != 0
                    )
                      kt++
                    console.log('==========distance========', distance)
                  }

                  if (kt == location.length) {
                    {
                      console.log('===============Lỗi vị trí===============')
                      checkAll = false
                      continue
                    }
                  }
                } else {
                  console.log('===============Lỗi vị trí===============')
                  checkAll = false
                  continue
                }
              } else {
                if (type_loc == 2) {
                  let kt = 0
                  for (let t = 0; t < data_location.length; t++) {
                    const distance = calculateDistanceToCenter(
                      lat,
                      long,
                      data_location[t].cor_lat,
                      data_location[t].cor_long
                    )
                    if (distance > data_location[t].cor_radius) kt++
                    console.log('==========distance========', distance)
                  }

                  if (kt == data_location.length) {
                    {
                      console.log('===============Lỗi vị trí===============')
                      checkAll = false
                      continue
                    }
                  }
                }
              }
            }
            // kiểm tra ip
            if (wifi.length > 0) {
              if (list_ip.length > 0) {
                const curIpId = wifi.find((item) => item.ip_access == ip)
                let id_acc = curIpId ? curIpId.id : 0

                if (list_ip.length > 0 && !list_ip.includes(Number(id_acc))) {
                  console.log('===============Lỗi địa chỉ IP===============')
                  checkAll = false
                  continue
                }
              } else {
                // 2 : tất cả đã lưu
                // 3 : tất cả
                if (type_ip == 2) {
                  const curIpId = wifi.find((item) => item.ip_access == ip)
                  if (!curIpId) {
                    console.log('===============Lỗi địa chỉ IP===============')
                    checkAll = false
                    continue
                  }
                }
              }
            }

            // check ca
            if (list_shifts.length > 0) {
              const tempShift = list_shifts.map((item) => item.id)

              // for (let j = 0; j < listShiftToday.length; j++) {
              //   const shift = listShiftToday[j]
              let count_shift = 0
              for (let j = 0; j < temp.shift.length; j++) {
                const idShift = temp.shift[j].shift_id

                if (!tempShift.includes(idShift)) {
                  console.log('===============Lỗi ca làm việc ============')

                  count_shift++
                } else {
                  // lay type 1:VAO, 2 RA
                  let type = list_shifts.filter((item) => item.id === idShift)

                  if (type && type.length == 1) {
                    type = type[0].type_shift
                    const detail = temp.shift[j]
                    const startTime = detail.start_time
                    const endTime = detail.end_time
                    const endTimeEar = detail.end_time_earliest || '23:59'
                    const startTimeEar = detail.start_time_latest || '00:00'

                    const start = new Date().setHours(
                      Number(startTime.split(':')[0]),
                      Number(startTime.split(':')[1])
                    )
                    const end = new Date().setHours(
                      Number(endTime.split(':')[0]),
                      Number(endTime.split(':')[1])
                    )
                    const startEar = new Date().setHours(
                      Number(startTimeEar.split(':')[0]),
                      Number(startTimeEar.split(':')[1])
                    )
                    const endLate = new Date().setHours(
                      Number(endTimeEar.split(':')[0]),
                      Number(endTimeEar.split(':')[1])
                    )
                    const timeNow = new Date(time).getTime()
                    if (
                      timeNow >= startEar &&
                      timeNow < end &&
                      Number(type) === 2
                    ) {
                      console.log(
                        'Ca vào không được phép chấm bằng thiết bị này'
                      )

                      count_shift++
                    } else if (
                      timeNow >= end &&
                      timeNow < endLate &&
                      Number(type) === 1
                    ) {
                      console.log(
                        'Ca ra không được phép chấm bằng thiết bị này'
                      )

                      count_shift++
                    } else {
                      list_shift_timeSheet.push(Number(idShift))
                    }
                  } else if (type && type.length != 2) {
                    count_shift++
                  } else {
                    list_shift_timeSheet.push(Number(idShift))
                  }
                }
              }
              console.log(count_shift)
              console.log(temp)
              if (count_shift === temp.shift.length) {
                console.log('ran hêrrrrr')
                checkAll = false
                continue
              }
              // }
            }

            if (checkAll) {
              checkTracking = true
              break
            }
          }
          if (!checkTracking) {
            console.log(
              '--------------------------Chấm công không thành công - Vi phạm cài đặt chấm công bằng QR----------------------------------------'
            )
            return functions.setError(
              res,
              'Chấm công không thành công - Vi phạm cài đặt chấm công bằng QR'
            )
          }
          console.log(
            '<<<<<<<<<<<<<<<<<<<<<<Thỏa mãn điều kiện chấm công>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
          )

          console.log(
            '--------------------------BAT DAU CHAM CONG----------------------------------------'
          )
          // lấy thông tin ca nhân viên
          let shiftInfo = await getListShiftEmp(com_id, idQLC, time)

          if (shiftId)
            shiftInfo.shift = shiftInfo.shift.filter(
              (e) => e.shift_id === shiftId
            )
          if (shiftInfo.success) {
            if (list_shift_timeSheet && list_shift_timeSheet.length > 0)
              shiftInfo.shift = shiftInfo.shift.filter((e) =>
                list_shift_timeSheet.includes(Number(e.shift_id))
              )
            // else shiftInfo.shift = []
            if (!location_name) {
              const findCompany = await Users.findOne(
                {
                  idQLC: com_id,
                  type: 1,
                },
                { address: 1 }
              )

              location_name = findCompany ? findCompany.address : ''
            }
            // nếu không tồn tại ca -> vẫn chấm công
            if (shiftInfo.shift.length == 0) {
              console.log(
                '----------------------Không có ca thỏa mãn------------------------------'
              )
              return functions.setError(res, 'Chấm công thất bại : Không có ca thỏa mãn')
              // const noShift = await insertTimeKeeping(
              //   com_id,
              //   idQLC,
              //   time,
              //   lat,
              //   long,
              //   ip,
              //   0,
              //   img,
              //   location_name,
              //   'QR Code'
              // )
              // return noShift.success
              //   ? functions.success(
              //     res,
              //     'Chấm công thành công ( Ca không tồn tại)',
              //     {}
              //   )
              //   : functions.setError(res, noShift.message, 500)
            }
            // tồn tại 1 ca
            else if (shiftInfo.shift.length == 1) {
              console.log(
                '----------------------1 SHIFT START------------------------------'
              )
              const oneShift = await insertTimeKeeping(
                com_id,
                idQLC,
                time,
                lat,
                long,
                ip,
                shiftInfo.shift[0].shift_id,
                img,
                location_name,
                'QR Code'
              )
              return oneShift.success
                ? functions.success(res, 'Chấm công thành công', {
                  ep_name: oneShift.ep_name,
                  shift: oneShift.shift,
                  image: oneShift.data.image,
                })
                : functions.setError(res, oneShift.message, 500)
            }
            // tồn tại 2 ca 1 luc
            else if (shiftInfo.shift.length > 1) {
              console.log(
                '----------------------2 SHIFT START------------------------------'
              )
              let image = null
              let success = 0

              for (let i = 0; i < shiftInfo.shift.length; i++) {
                const temp_shift_id = shiftInfo.shift[i].shift_id
                const tempShift = await insertTimeKeeping(
                  com_id,
                  idQLC,
                  time,
                  lat,
                  long,
                  ip,
                  temp_shift_id,
                  img,
                  location_name,
                  'QR Code'
                )
                if (!image) image = tempShift.data.image
                if (tempShift.success) success++
              }

              if (success == 2) {
                return functions.success(res, 'Điểm danh thành công', { image })
              }
              console.log('Điểm danh 2 ca lỗi')
              return functions.setError(res, 'Điểm danh 2 ca lỗi', 500)
            }

            console.log('Điểm danh lỗi')
            return functions.setError(res, 'Điểm danh lỗi', 500)
          }

          return functions.setError(res, shiftInfo.message, 500)
        }

        return functions.setError(res, 'QR Code không chính xác')
      } else return functions.setError(res, 'QR Code không chính xác')

      // kiểm tra xem nhân viên có được chấm = QR
    }

    return functions.setError(res, 'Thiếu thông tin')
  } catch (error) {
    console.log(error)
    return functions.setError(res, error.message, 500)
  }
}
