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

// danh sách chấm công (theo ca) trong 1 ngày
exports.listTrackingEmp = async (req, res) => {
    try {

        const com_id = Number(req.user.data.com_id)
        const type = Number(req.user.data.type)
        const idQLC = Number(req.user.data.idQLC)
        const typeUser = Number(req.body.typeUser)
        const date = new Date(req.body.date) // 2023-10-03
        const start_date = new Date(date.setHours(0, 0, 0, 0));
        const end_date = new Date(date.setHours(23, 59, 59, 999));
        const { position_id, listOrganizeDetailId, shift_id } = req.body
        const data_final = []
        const conditions = {
            "ts_com_id": com_id,
            "status_confirm": 1,
            $and: [{
                "at_time": { "$gte": start_date }
            },
            {
                "at_time": { "$lte": end_date }
            }
            ]
        }
        // typeUser :1-của tôi, 2-gửi đến tôi
        if (type === 1) {

        }
        else {
            if (typeUser === 1) {
                conditions.ep_id = idQLC
            }
            else if (typeUser === 2) {
                const listData = await SettingConfirmTimeSheet.find({
                    comId: com_id,
                    users_duyet: idQLC
                }, {
                    ep_id: 1
                })
                const listUsers = []
                listData.map(e => {
                    listUsers.push(Number(e.ep_id))
                })
                conditions.ep_id = { $in: listUsers }
            }
        }
        const conditionsUsers = {
            "inForPerson.employee.ep_status": "Active",
            type: 2,
        }
        if (position_id) conditionsUsers["inForPerson.employee.position_id"] = Number(position_id)
        if (listOrganizeDetailId) conditionsUsers["inForPerson.employee.listOrganizeDetailId"] = { $all: listOrganizeDetailId }
        // dữ liệu chấm công 
        const conditionsShift = {
        }
        if (shift_id) conditionsShift.shift_id = Number(shift_id)
        console.log(conditionsShift)
        let listData = await CC365_TimeSheet.aggregate([{
            $match: conditions
        },
        {
            $lookup: {
                from: 'QLC_Shifts',
                localField: 'shift_id',
                foreignField: 'shift_id',
                pipeline: [
                    {
                        $match: conditionsShift
                    }
                ],
                as: 'shift'
            }
        },
        {
            $lookup: {
                from: 'Users',
                localField: 'ep_id',
                foreignField: 'idQLC',
                pipeline: [
                    {
                        $match: conditionsUsers
                    }
                ],
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $unwind: '$shift'
        },
        {
            $lookup: {
                from: 'QLC_Positions',
                localField: 'user.inForPerson.employee.position_id',
                foreignField: 'id',
                let: { "comId": "$comId" },
                pipeline: [{ $match: { comId: com_id } }],
                as: 'positions'
            }
        },
        {
            $lookup: {
                from: 'QLC_OrganizeDetail',
                localField: 'user.inForPerson.employee.organizeDetailId',
                foreignField: 'id',
                as: 'organizeDetail'
            }
        },
        {
            $group: {
                _id: {
                    ep_id: "$ep_id",
                    shift_id: "$shift_id"
                }, // Nhóm theo trường ep_id
                data: {
                    $push: {
                        sheet_id: "$sheet_id",
                        at_time: "$at_time"
                    }
                },
                shift: { $first: "$shift" },
                userName: { $first: "$user.userName" },
                idQLC: { $first: "$user.idQLC" },
                positionName: { $first: "$positions.positionName" },
                organizeDetailName: { $first: "$organizeDetail.organizeDetailName" },
            }
        },
        {
            $project: {
                _id: 0,
                ep_id: "$_id.ep_id",
                shift_id: "$_id.shift_id",
                userName: 1,
                positionName: 1,
                organizeDetailName: 1,
                idQLC: "$user.idQLC",
                shift: 1,
                data: 1
            }
        }
        ]);
        console.log(listData)
        if (listData && listData.length > 0) {
            listData.map(e => {
                e.data = e.data.sort((a, b) => {
                    return a.at_time - b.at_time;
                });
                if (e.data && e.data.length > 0) {
                    let start_real = (e.data)[0].at_time;
                    const start_time_shift_str = e.shift.start_time
                    const start_time = new Date(
                        start_real.getFullYear(), start_real.getMonth(), start_real.getDate(),
                        Number(start_time_shift_str.split(':')[0]) || 0,
                        Number(start_time_shift_str.split(':')[1]) || 0,
                        Number(start_time_shift_str.split(':')[2]) || 0,
                    )
                    const end_real = (e.data)[(e.data).length - 1].at_time;
                    const end_time_shift_str = e.shift.end_time;
                    const end_time = new Date(
                        end_real.getFullYear(), end_real.getMonth(), end_real.getDate(),
                        Number(end_time_shift_str.split(':')[0]) || '0',
                        Number(end_time_shift_str.split(':')[1]) || '0',
                        Number(end_time_shift_str.split(':')[2]) || '0',
                    );

                    let end_time_max;

                    if (e.shift.end_time_earliest) {
                        let end_max_shift_str = e.shift.end_time_earliest;
                        end_time_max = new Date(
                            end_real.getFullYear(), end_real.getMonth(), end_real.getDate(),
                            Number(end_max_shift_str.split(':')[0]) || '0',
                            Number(end_max_shift_str.split(':')[1]) || '0',
                            Number(end_max_shift_str.split(':')[2]) || '0',
                        );
                    } else {
                        end_time_max = new Date(
                            end_real.getFullYear() + 1, end_real.getMonth(), end_real.getDate()
                        );
                    }

                    let start_time_min;
                    if (e.shift.start_time_latest) {
                        let start_min_shift_str = e.shift.start_time_latest;
                        start_time_min = new Date(
                            start_real.getFullYear(), start_real.getMonth(), start_real.getDate(),
                            Number(start_min_shift_str.split(':')[0]) || '0',
                            Number(start_min_shift_str.split(':')[1]) || '0',
                            Number(start_min_shift_str.split(':')[2]) || '0',
                        );
                    } else {
                        start_time_min = new Date(
                            start_real.getFullYear() - 1, start_real.getMonth(), start_real.getDate()
                        );
                    }

                    let listTimeSheetRealOnShift = (e.data).filter((e) =>
                        (e.at_time < end_time_max) && (e.at_time > start_time_min)
                    );


                    // new 
                    if (listTimeSheetRealOnShift.length > 1) {
                        let late = 0;
                        let early = 0;

                        if (listTimeSheetRealOnShift[0].at_time > start_time) {
                            let tempt2 = Math.round(Math.abs(listTimeSheetRealOnShift[0].at_time - start_time) / 1000);
                            late = late + tempt2;
                        }

                        if (listTimeSheetRealOnShift[listTimeSheetRealOnShift.length - 1].at_time < end_time) {
                            let tempt2 = Math.round(Math.abs(listTimeSheetRealOnShift[listTimeSheetRealOnShift.length - 1].at_time - end_time) / 1000);
                            early = early + tempt2;
                        }
                        if (late || early) {

                            data_final.push({
                                ep_id: e.ep_id,
                                userName: e.userName,
                                positionName: e.positionName[0],
                                organizeDetailName: e.organizeDetailName[0],
                                shift_id: e.shift_id,
                                shift_name: e.shift.shift_name,
                                content: "Ca đi muộn về sớm",
                                type: 3,
                                late: late,
                                early: early,
                                start: listTimeSheetRealOnShift[0].at_time,
                                end: listTimeSheetRealOnShift[listTimeSheetRealOnShift.length - 1].at_time,
                                shift_type: e.shift.shift_type,
                                start_date: start_date,
                                end_date: end_date
                            })
                        } else {

                            data_final.push({
                                ep_id: e.ep_id,
                                userName: e.userName,
                                positionName: e.positionName[0],
                                organizeDetailName: e.organizeDetailName[0],
                                shift_id: e.shift_id,
                                shift_name: e.shift.shift_name,
                                content: "Ca hoàn thành",
                                type: 1,
                                shift_type: e.shift.shift_type,
                                start_date: start_date,
                                end_date: end_date
                            })
                        };

                    } else {
                        // ca chưa hoàn thành 
                        if (listTimeSheetRealOnShift.length == 1) {
                            data_final.push({
                                ep_id: e.ep_id,
                                userName: e.userName,
                                positionName: e.positionName[0],
                                organizeDetailName: e.organizeDetailName[0],
                                shift_id: e.shift_id,
                                shift_name: e.shift.shift_name,
                                content: "Ca chưa hoàn thành",
                                type: 2,
                                shift_type: e.shift.shift_type,
                                start_date: start_date,
                                end_date: end_date

                            })
                        }
                        // ca nghỉ 
                        if (listTimeSheetRealOnShift.length == 0) {
                            data_final.push({
                                ep_id: e.ep_id,
                                userName: e.userName,
                                positionName: e.positionName[0],
                                organizeDetailName: e.organizeDetailName[0],
                                shift_id: e.shift_id,
                                shift_name: e.shift.shift_name,
                                content: "Ca nghỉ",
                                type: 2,
                                shift_type: e.shift.shift_type,
                                start_date: start_date,
                                end_date: end_date
                            })
                        };

                    }
                }

            })
        }

        return functions.success(res, "Danh sách chấm công", { data: data_final })
    } catch (error) {
        console.log(error)
        return res.json(2)
    }
}



