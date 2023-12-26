const SettingTimesheet = require('../../models/qlc/SettingTimesheet')
const functions = require('../../services/functions')
const Shifts = require('../../models/qlc/Shifts')
const SettingIP = require('../../models/qlc/SettingIP')
const OrganizeDetail = require('../../models/qlc/OrganizeDetail')
const Position = require('../../models/qlc/Positions')
const Location = require('../../models/qlc/Location')
const Wifi = require('../../models/qlc/TrackingWifi')
const SettingWifi = require('../../models/qlc/SettingWifi')
const Users = require('../../models/Users')
const TimeSheets = require('../../models/qlc/TimeSheets')

exports.addSetting = async (req, res) => {
  try {
    const com_id = req.user.data.com_id
    const type = req.user.data.type

    if (type == 1) {
      let {
        list_org,
        list_pos,
        list_emps,
        list_shifts,
        list_wifi,
        list_loc,
        list_ip,
        list_device,
        start_time,
        end_time,
        setting_name,
        type_wifi,
        type_loc
      } = req.body
      if (type_wifi == 2 || type_wifi == 3) list_wifi = []
      if (type_loc == 2 || type_loc == 3) list_loc = []


      // let tempShift = []

      // lay max id
      const latestRecord = await SettingTimesheet.aggregate([
        { $sort: { setting_id: -1 } },
        { $limit: 1 },
      ])
      let maxid = latestRecord.length > 0 ? latestRecord[0].setting_id + 1 : 0

      const newObj = SettingTimesheet({
        setting_id: Number(maxid),
        setting_name: setting_name || '',
        com_id: Number(com_id),
        list_org: list_org || [],
        list_pos: list_pos || [],
        list_emps: list_emps || [],
        list_shifts: list_shifts || [],
        list_wifi: list_wifi || [],
        list_loc: list_loc || [],
        list_ip: list_ip || [],
        list_device: list_device || [],
        type_wifi: Number(type_wifi),
        type_loc: Number(type_loc),
        start_time: start_time ? new Date(start_time) : new Date(),
        end_time: end_time ? new Date(end_time) : new Date(),
      })

      await newObj.save()

      return functions.success(res, 'Tao moi thanh cong', { newObj: newObj })
    }

    return functions.setError(res, 'Khong phai tai khoan cong ty')
  } catch (err) {
    console.log(err)
    return functions.setError(res, err.message)
  }
}

const filterElements = (filterArr, arr, keyItem, keyData, final) => {
  if (arr) {
    const temp = filterArr.filter((item) => arr.includes(item[keyItem]))

    final[keyData] = temp
  }
}

exports.getSetting = async (req, res) => {
  try {
    const com_id = req.user.data.com_id
    const type = req.user.data.type

    if (type == 1) {
      // lay all data de filter
      const promiseData = await Promise.all([
        // phong ban
        OrganizeDetail.aggregate([
          {
            $match: {
              comId: Number(com_id),
            },
          },
        ]),
        //
        Position.aggregate([{ $match: { comId: Number(com_id) } }]),
        Users.aggregate([
          {
            $match: {
              'inForPerson.employee.com_id': Number(com_id),
              type: 2,
              'inForPerson.employee.ep_status': 'Active',
              authentic: 1,
            },
          },
          {
            $project: {
              userName: 1,
              idQLC: 1,
              dep: '$dep',
            },
          },
        ]),
        Shifts.aggregate([{ $match: { com_id: Number(com_id) } }]),
        // SettingIP.aggregate([{ $match: { id_com: Number(com_id) } }]),
        SettingWifi.aggregate([{ $match: { id_com: Number(com_id) } }]),
        Location.aggregate([{ $match: { id_com: Number(com_id) } }]),
        // Wifi.aggregate([{ $match: { com_id: Number(com_id) } }]),
      ])

      const listOrg = promiseData[0] || []
      const listPos = promiseData[1] || []
      const listUsers = promiseData[2] || []
      const listShifts = promiseData[3] || []
      const listWifi = promiseData[4] || []
      const listLoc = promiseData[5] || []
      //   const listWifi = promiseData[6] || []
      // lay max id
      const records = await SettingTimesheet.aggregate([
        {
          $match: { com_id: Number(com_id) },
        },
        {
          $sort: { create_time: -1 }
        },
      ])
      // map data
      let finalData = []

      const listDevices = ['web', 'app', 'qrchat']

      for (let i = 0; i < records.length; i++) {
        let singleData = {}
        const item = records[i]

        // map list org
        filterElements(listOrg, item.list_org, 'id', 'list_org', singleData)
        filterElements(listPos, item.list_pos, 'id', 'list_pos', singleData)
        filterElements(
          listUsers,
          item.list_emps,
          'idQLC',
          'list_emps',
          singleData
        )
        // filterElements(listShifts, item.list_shifts, 'shift_id', 'list_shifts', singleData)
        // filterElements(listIp, item.list_ip, 'id_acc', 'list_ip', singleData)
        filterElements(listLoc, item.list_loc, 'cor_id', 'list_loc', singleData)
        filterElements(listWifi, item.list_wifi, 'id', 'list_wifi', singleData)
        filterElements(
          listDevices,
          item.list_device,
          '',
          'list_device',
          singleData
        )

        // filter shift
        const tempShift = []

        item.list_shifts.forEach((item) => {
          const found = listShifts.find((s) => s.shift_id == item.id)
          tempShift.push({ ...found, type_shift: item.type_shift })
        })
        singleData['list_shifts'] = tempShift

        finalData.push({
          ...singleData,
          detail: { ...item },
        })
      }

      console.log(finalData)

      return functions.success(res, 'lay thanh cong', { data: finalData || [] })
    }

    return functions.setError(res, 'Khong phai tai khoan cong ty')
  } catch (err) {
    console.log(err)
    return functions.setError(res, err.message)
  }
}

exports.delSetting = async (req, res) => {
  try {
    const com_id = req.user.data.com_id
    const type = req.user.data.type

    if (type == 1) {
      const setting_id = Number(req.body.setting_id)

      if (setting_id >= 0) {
        const delData = await SettingTimesheet.deleteOne({
          setting_id: Number(setting_id),
        })

        if (delData.deletedCount > 0) {
          return functions.success(res, 'Xoa thanh cong', {})
        }

        return functions.setError(res, 'Xoa that bai')
      }

      return functions.setError(res, 'Thieu truong setting_id')
    }

    return functions.setError(res, 'Khong phai tai khoan cong ty')
  } catch (err) {
    console.log(err)
    return functions.setError(res, err.message)
  }
}

exports.editSetting = async (req, res) => {
  try {
    const com_id = req.user.data.com_id
    const type = req.user.data.type

    if (type == 1) {
      let {
        setting_id,
        list_org,
        list_pos,
        list_emps,
        list_shifts,
        list_wifi,
        list_loc,
        list_ip,
        list_device,
        start_time,
        end_time,
        setting_name,
        type_wifi,
        type_loc,
        app
      } = req.body

      if (setting_id) {

        // lay data
        const curSetting = await SettingTimesheet.findOne({
          setting_id: Number(setting_id),
        }).lean()

        if (curSetting) {



          if (type_wifi == 2 || type_wifi == 3) list_wifi = []
          if (type_loc == 2 || type_loc == 3) list_loc = []

          if (!app) {
            console.log("vào đây")
            console.log("list_loc", list_loc)
            console.log("list_loc", typeof list_loc)
            if (list_loc == "Tất cả vị trí") {
              list_loc = []
              type_loc = 3
            }
            if (list_loc.length > 0 && list_loc[0] == "Tất cả vị trí") {
              list_loc = []
              type_loc = 3
            }
            if (list_loc == "Tất cả vị trí đã được lưu") {
              list_loc = []
              type_loc = 2
            }
            if (list_loc.length > 0 && list_loc[0] == "Tất cả vị trí đã được lưu") {
              console.log("alolo")
              list_loc = []
              type_loc = 2
            }

            if (list_wifi == "Tất cả wifi") {
              list_wifi = []
              type_wifi = 3
            }
            if (list_wifi.length > 0 && list_wifi[0] == "Tất cả wifi") {
              list_wifi = []
              type_wifi = 3
            }
            if (list_wifi == "Tất cả wifi đã được lưu") {
              list_wifi = []
              type_wifi = 2
            }
            if (list_wifi.length > 0 && list_wifi[0] == "Tất cả wifi đã được lưu") {
              list_wifi = []
              type_wifi = 2
            }
            if (list_emps == "Tất cả nhân viên") {
              list_emps = []
            }
            if (list_pos == "Tất cả chức vụ") {
              list_pos = []
            }
            if (list_device == "Tất cả thiết bị") {
              list_device = []
            }
            if (list_device.length > 0 && list_device[0] == "all") {
              list_device = []
            }
            if (list_shifts == "Tất cả ca làm việc") {
              list_shifts = []
            }
            if (list_shifts.length == 1 && !list_shifts[0].id && !list_shifts[0].type_shift) {
              list_shifts = []
            }
          }
          // check cho bên FE

          const updateRes = await SettingTimesheet.updateOne(
            { setting_id: Number(setting_id) },
            {
              $set: {
                setting_name,
                list_org,
                list_pos,
                list_emps,
                list_shifts,
                list_wifi,
                list_loc: list_loc || [],
                list_ip,
                start_time,
                end_time,
                list_device: list_device,
                type_wifi: type_wifi ? Number(type_wifi) : 0,
                type_loc: type_loc ? Number(type_loc) : 0
              },
            }
          )

          return functions.success(res, 'Sua thanh cong', {})

          // return functions.setError(res, 'Sua that bai')
        }

        return functions.setError(res, 'Khong tim thay ban ghi')
      }

      return functions.setError(res, 'Thieu truong setting_id')
    }

    return functions.setError(res, 'Khong phai tai khoan cong ty')
  } catch (err) {
    console.log(err)
    return functions.setError(res, err.message)
  }
}
