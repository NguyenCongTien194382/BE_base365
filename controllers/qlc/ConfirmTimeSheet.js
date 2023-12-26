const CC365_TimeSheet = require('../../models/qlc/TimeSheets')
const functions = require('../../services/functions')
const Users = require('../../models/Users')
const moment = require('moment-timezone')

const SettingConfirmTimeSheet = require("../../models/qlc/SettingConfirmTimeSheet")
const ChooseConfirmTimeSheet = require("../../models/qlc/ChooseConfirmTimeSheet")


// chọn phê duyệt chấm công hoặc không (choose : 1-không, 2 có)

exports.settingChooseConfirm = async (req, res, next) => {
    try {
        const com_id = req.user.data.com_id
        const type = req.user.data.type
        const isAdmin = req.user.data.isAdmin
        const choose = Number(req.body.choose)
        if (Number(type) === 1 || isAdmin) {
            const foundGateway = await ChooseConfirmTimeSheet.findOne(
                {
                    comId: com_id
                }
            )
            if (foundGateway) await ChooseConfirmTimeSheet.updateOne(
                {
                    comId: com_id
                },
                {
                    $set: {
                        choose: choose
                    }
                }
            )
            else {
                const newData = new ChooseConfirmTimeSheet({
                    comId: com_id,
                    choose: choose,
                    created_time: functions.getTimeNow(),
                    update_time: functions.getTimeNow()
                })
                await newData.save()

            }
            return functions.success(res, "Cài đặt thành công");
        }
        return functions.setError(res, "Tài khoản không phải Công ty");
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}



exports.findChooseConfirm = async (req, res, next) => {
    try {
        const com_id = req.user.data.com_id
        const type = req.user.data.type
        const isAdmin = req.user.data.isAdmin

        if (Number(type) === 1 || isAdmin) {
            const foundGateway = await ChooseConfirmTimeSheet.findOne(
                {
                    comId: com_id
                }
            )
            if (foundGateway) {
                return functions.success(res, {
                    choose: foundGateway.choose
                });
            }
            else {
                return functions.success(res, {
                    choose: 1
                });
            }
            return functions.success(res, "Cài đặt thành công");
        }
        return functions.setError(res, "Tài khoản không phải Công ty");
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}




// cài đặt duyệt : số cấp, hình thức, người duyệt
exports.setting = async (req, res, next) => {
    try {
        const comId = req.user.data.com_id
        const type = req.user.data.type
        const isAdmin = req.user.data.isAdmin
        const listUsers = req.body.listUsers || []
        const users_duyet = req.body.users_duyet || []
        if (Number(type) === 1 || isAdmin) {
            if (comId && listUsers && listUsers.length > 0) {
                await SettingConfirmTimeSheet.updateMany(
                    {
                        ep_id: { $in: listUsers },
                        com_id: comId
                    },
                    {
                        $set: {
                            users_duyet: users_duyet
                        }
                    },
                    {
                        multi: true
                    }
                )

                return functions.success(res, "Cập nhật thành công")
            }
            return functions.setError(res, "Thiếu thông tin");
        }
        return functions.setError(res, "Tài khoản không phải Công ty");
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}


exports.listSetting = async (req, res, next) => {
    try {
        const com_id = req.user.data.com_id
        const type = req.user.data.type
        const isAdmin = req.user.data.isAdmin
        if (Number(type) === 1 || isAdmin) {

            const { listOrganizeDetailId, position_id, ep_id } = req.body
            const conditions = {
                "inForPerson.employee.com_id": com_id
            }
            if (listOrganizeDetailId) conditions["inForPerson.employee.listOrganizeDetailId"] = { $all: listOrganizeDetailId }
            if (position_id) conditions["inForPerson.employee.position_id"] = Number(position_id)
            if (ep_id) conditions.idQLC = Number(ep_id)
            const foundGateway = await SettingConfirmTimeSheet.findOne({ com_id: com_id })
            if (!foundGateway) {
                const listUsers = await Users.find({
                    "inForPerson.employee.com_id": com_id,
                    type: 2
                }, { idQLC: 1 }).lean()
                let list_data = []
                listUsers.map(e => {
                    list_data.push({
                        com_id: com_id,
                        ep_id: e.idQLC,
                        users_duyet: []
                    })
                })
                await SettingConfirmTimeSheet.insertMany(list_data, { ordered: false, rawResult: true })
            }

            const list_result = await SettingConfirmTimeSheet.aggregate([
                {
                    $match: {
                        com_id: com_id
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'ep_id',
                        foreignField: 'idQLC',
                        pipeline: [
                            {
                                $match: conditions
                            }
                        ],
                        as: 'users'
                    }
                },
                {
                    $unwind:
                    {
                        path: "$users"
                    }
                },
                {
                    $lookup: {
                        from: "QLC_OrganizeDetail",
                        localField: "users.inForPerson.employee.organizeDetailId",
                        foreignField: "id",
                        as: "organizeDetail"
                    }
                },
                {
                    $unwind:
                    {
                        path: "$organizeDetail",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'QLC_Positions',
                        localField: 'users.inForPerson.employee.position_id',
                        foreignField: 'id',
                        pipeline: [{ $match: { comId: com_id } }],
                        as: 'positions'
                    }
                },

                {
                    $unwind:
                    {
                        path: "$positions",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'Users',
                        localField: 'users_duyet',
                        foreignField: 'idQLC',
                        pipeline: [
                            {
                                $match: { type: 2 }
                            },
                            {
                                $lookup: {
                                    from: 'QLC_Positions',
                                    localField: 'inForPerson.employee.position_id',
                                    foreignField: 'id',
                                    pipeline: [{ $match: { comId: com_id } }],
                                    as: 'info_positions'
                                }
                            },
                            {
                                $unwind:
                                {
                                    path: "$info_positions",
                                    preserveNullAndEmptyArrays: true
                                }
                            },

                            {
                                $lookup: {
                                    from: "QLC_OrganizeDetail",
                                    localField: "inForPerson.employee.organizeDetailId",
                                    foreignField: "id",
                                    as: "info_organizeDetail"
                                }
                            },
                            {
                                $unwind:
                                {
                                    path: "$info_organizeDetail",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    idQLC: 1,
                                    userName: 1,
                                    organizeDetailName: "$info_organizeDetail.organizeDetailName",
                                    positionName: "$info_positions.positionName"
                                }
                            }
                        ],
                        as: 'list_users_duyet'
                    }
                },

                {
                    $project: {
                        _id: 0,
                        ep_id: "$users.idQLC",
                        userName: "$users.userName",
                        organizeDetailName: "$organizeDetail.organizeDetailName",
                        positionName: "$positions.positionName",
                        list_users_duyet: 1
                    }
                }

            ])
            return functions.success(res, "Danh sách cài đặt", { data: list_result })

        }

        return functions.setError(res, "Tài khoản không phải Công ty");
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}


// danh sách 
exports.listTrackingEmp = async (req, res) => {
    try {

        const com_id = Number(req.user.data.com_id)



        let pageSize = Number(req.body.pageSize) || 10
        let pageNumber = Number(req.body.pageNumber) || 1
        let start_date = new Date(req.body.start_date);
        start_date.setHours(0, 0, 0, 0)
        let end_date = new Date(req.body.end_date);
        end_date.setHours(23, 59, 59, 999)

        const { ep_id, position_id, listOrganizeDetailId, shift_id } = req.body
        const conditions_user = {
            "inForPerson.employee.com_id": com_id
        }
        if (position_id) conditions_user["inForPerson.employee.position_id"] = position_id
        if (listOrganizeDetailId) conditions_user["inForPerson.employee.listOrganizeDetailId"] = { $all: listOrganizeDetailId }
        if (ep_id) conditions_user.idQLC = Number(ep_id)
        const conditions = {
            "ts_com_id": com_id,
            "status_confirm": { $ne: 1 },
            $and: [
                { at_time: { $gte: start_date } },
                { at_time: { $lte: end_date } }
            ]
        }
        if (shift_id) conditions.shift_id = Number(shift_id)

        // const listUsers = await Users.find(conditions_user).skip((pageNumber - 1) * pageSize).limit(pageSize).lean()

        const listUsers = await Users.aggregate([
            {
                $match: conditions_user,
            },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'QLC_Positions',
                    localField: 'inForPerson.employee.position_id',
                    foreignField: 'id',
                    pipeline: [{ $match: { comId: com_id } }],
                    as: 'positions',
                },
            },
            {
                $unwind: {
                    path: '$positions',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: 'QLC_OrganizeDetail',
                    localField: 'inForPerson.employee.organizeDetailId',
                    foreignField: 'id',
                    as: 'organizeDetail',
                },
            },
            {
                $unwind: {
                    path: '$organizeDetail',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $project: {
                    _id: 1,
                    idQLC: '$idQLC',
                    userName: '$userName',
                    phone: 1,
                    phoneTK: 1,
                    avatarUser: 1,
                    organizeDetailName: '$organizeDetail.organizeDetailName',
                    positionName: '$positions.positionName',
                    position_id: '$inForPerson.employee.position_id',
                    organizeDetailId: '$inForPerson.employee.organizeDetailId',
                    listOrganizeDetailId: '$inForPerson.employee.listOrganizeDetailId',
                },
            },
        ])

        const total = await Users.countDocuments(conditions_user)
        let list_user_id = []
        listUsers.map(e => list_user_id.push(Number(e.idQLC)))
        conditions.ep_id = { $in: list_user_id }

        // dữ liệu chấm công

        let listData_TimeSheet = await CC365_TimeSheet.aggregate([
            {
                $match: conditions
            },
            {
                $lookup: {
                    from: 'QLC_Shifts',
                    localField: 'shift_id',
                    foreignField: 'shift_id',
                    as: 'shift',
                },
            },
            {
                $project: {
                    ep_id: 1,
                    sheet_id: 1,
                    shift_id: 1,
                    at_time: 1,
                    'shift.shift_name': 1,
                    'shift.shift_id': 1,
                    'shift.start_time': 1,
                    'shift.end_time': 1,
                    'shift.start_time_latest': 1,
                    'shift.end_time_earliest': 1,
                    'shift.num_to_money': 1,
                    'shift.shift_type': 1,
                    'shift.num_to_calculate': 1,
                    'shift.is_overtime': 1,
                    'shift.over_night': 1,
                    'shift.nums_day': 1,
                },
            },
        ])


        let data_final_total = []


        for (let i = 0; i < listUsers.length; i++) {
            const ep_id = listUsers[i].idQLC
            console.log("ep_id", ep_id)
            let data_final = []
            const listData = listData_TimeSheet.filter(e => e.ep_id === ep_id && e.shift && e.shift[0] && !e.shift[0].over_night)
            const listData_overnight = listData_TimeSheet.filter(e => e.ep_id === ep_id && e.shift && e.shift[0] && e.shift[0].over_night)
            for (let j = start_date.getDate(); j <= end_date.getDate(); j++) {
                let arr_shift = []
                let listTimeSheet = listData.filter(e_ts => e_ts.at_time.getDate() === j)

                let listTimeSheet_overnight = listData.filter(e_ts => e_ts.at_time.getDate() === j)
                listTimeSheet.map(e_ts => {
                    if (e_ts.shift_id && !arr_shift.includes(e_ts.shift_id)) arr_shift.push(e_ts.shift_id)
                })
                listTimeSheet_overnight.map(e_ts => {
                    if (e_ts.shift_id && !arr_shift.includes(e_ts.shift_id)) arr_shift.push(e_ts.shift_id)
                })

                for (let t = 0; t < arr_shift.length; t++) {
                    let listTimeSheetOneShift = listTimeSheet.filter(e_ts => e_ts.shift_id === arr_shift[t])
                    let shift_data = listTimeSheetOneShift[0].shift[0]
                    if (shift_data) {
                        let start_real = listTimeSheetOneShift[0].at_time
                        let start_time_shift_str = shift_data.start_time
                        let start_time = new Date(
                            start_real.getFullYear(),
                            start_real.getMonth(),
                            start_real.getDate(),
                            Number(start_time_shift_str.split(':')[0]) || '0',
                            Number(start_time_shift_str.split(':')[1]) || '0',
                            Number(start_time_shift_str.split(':')[2]) || '0'
                        )

                        let end_real =
                            listTimeSheetOneShift[listTimeSheetOneShift.length - 1].at_time
                        let end_time_shift_str = shift_data.end_time
                        let end_time = new Date(
                            end_real.getFullYear(),
                            end_real.getMonth(),
                            end_real.getDate(),
                            Number(end_time_shift_str.split(':')[0]) || '0',
                            Number(end_time_shift_str.split(':')[1]) || '0',
                            Number(end_time_shift_str.split(':')[2]) || '0'
                        )


                        let end_time_max
                        if (shift_data.end_time_earliest) {
                            let end_max_shift_str = shift_data.end_time_earliest
                            end_time_max = new Date(
                                end_real.getFullYear(),
                                end_real.getMonth(),
                                end_real.getDate(),
                                Number(end_max_shift_str.split(':')[0]) || '0',
                                Number(end_max_shift_str.split(':')[1]) || '0',
                                Number(end_max_shift_str.split(':')[2]) || '0'
                            )
                        } else {
                            end_time_max = new Date(
                                end_real.getFullYear() + 1,
                                end_real.getMonth(),
                                end_real.getDate()
                            )
                        }


                        let start_time_min
                        if (shift_data.start_time_latest) {
                            let start_min_shift_str = shift_data.start_time_latest
                            start_time_min = new Date(
                                start_real.getFullYear(),
                                start_real.getMonth(),
                                start_real.getDate(),
                                Number(start_min_shift_str.split(':')[0]) || '0',
                                Number(start_min_shift_str.split(':')[1]) || '0',
                                Number(start_min_shift_str.split(':')[2]) || '0'
                            )
                        } else {
                            start_time_min = new Date(
                                start_real.getFullYear() - 1,
                                start_real.getMonth(),
                                start_real.getDate()
                            )
                        }

                        let listTimeSheetRealOneShift = listTimeSheetOneShift.filter(
                            (e) => e.at_time < end_time_max && e.at_time > start_time_min
                        )

                        if (listTimeSheetRealOneShift.length > 1) {

                            let late = 0
                            let early = 0

                            if (listTimeSheetRealOneShift[0].at_time > start_time) {
                                let tempt2 = Math.round(
                                    Math.abs(listTimeSheetRealOneShift[0].at_time - start_time) /
                                    1000
                                )
                                late = late + tempt2
                            }

                            if (
                                listTimeSheetRealOneShift[listTimeSheetRealOneShift.length - 1]
                                    .at_time < end_time
                            ) {
                                let tempt2 = Math.round(
                                    Math.abs(
                                        listTimeSheetRealOneShift[
                                            listTimeSheetRealOneShift.length - 1
                                        ].at_time - end_time
                                    ) / 1000
                                )
                                early = early + tempt2
                            }
                            if (late || early) {

                                data_final.push({
                                    ep_id: listUsers[i].idQLC,
                                    userName: listUsers[i].userName,
                                    positionName: listUsers[i].positionName,
                                    organizeDetailName: listUsers[i].organizeDetailName,
                                    date: listTimeSheetRealOneShift[0].at_time,
                                    list_sheet_id: listTimeSheetRealOneShift.map(e_l => Number(e_l.sheet_id)),
                                    shift_id: shift_data.shift_id,
                                    shift_name: shift_data.shift_name,
                                    content: 'Ca đi muộn về sớm',
                                    type: 3,
                                    late: late,
                                    early: early,
                                })
                            } else {
                                data_final.push({
                                    ep_id: listUsers[i].idQLC,
                                    userName: listUsers[i].userName,
                                    positionName: listUsers[i].positionName,
                                    organizeDetailName: listUsers[i].organizeDetailName,
                                    date: listTimeSheetRealOneShift[0].at_time,
                                    list_sheet_id: listTimeSheetRealOneShift.map(e_l => Number(e_l.sheet_id)),
                                    shift_id: shift_data.shift_id,
                                    shift_name: shift_data.shift_name,
                                    content: 'Ca hoàn thành',
                                    type: 1,
                                })
                            }
                        } else {
                            // ca chưa hoàn thành
                            if (listTimeSheetRealOneShift.length == 1) {
                                data_final.push({
                                    ep_id: listUsers[i].idQLC,
                                    userName: listUsers[i].userName,
                                    positionName: listUsers[i].positionName,
                                    organizeDetailName: listUsers[i].organizeDetailName,
                                    date: listTimeSheetRealOneShift[0].at_time,
                                    list_sheet_id: listTimeSheetRealOneShift.map(e_l => Number(e_l.sheet_id)),
                                    shift_id: shift_data.shift_id,
                                    shift_name: shift_data.shift_name,
                                    content: 'Ca chưa hoàn thành',
                                    type: 2,
                                })
                            }

                        }

                    }

                }

            }

            data_final_total.push(...data_final)
        }
        data_final_total = data_final_total.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return functions.success(res, "Danh sách chấm công", { total: total, data: data_final_total })
    } catch (error) {
        console.log(error)
        return functions.setError(res, "Lỗi lấy danh sách")
    }
}


// active time_sheet
exports.active_timesheet = async (req, res) => {
    try {

        const ts_com_id = Number(req.user.data.com_id)
        const type = Number(req.user.data.type)
        const isAdmin = req.user.data.isAdmin
        if (type === 1 || isAdmin) {
            const list_sheet_id = req.body.list_sheet_id
            await CC365_TimeSheet.updateMany(
                {
                    ts_com_id: ts_com_id,
                    sheet_id: { $in: list_sheet_id }
                },
                {
                    $set: {
                        status_confirm: 1
                    }
                },
                { multi: true }
            )
            return functions.success(res, "Duyệt thành công")
        }


    } catch (error) {
        console.log(error)
        return functions.setError(res, "Lỗi duyệt chấm công")
    }
}



