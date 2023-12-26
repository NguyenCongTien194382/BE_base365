const Shifts = require('../../models/qlc/Shifts')
const Vanthu_de_xuat = require('../../models/Vanthu/de_xuat')
const functions = require('../../services/functions')
const Cycle = require('../../models/qlc/Cycle')
const Users = require('../../models/Users')
const TimeSheets = require('../../models/qlc/TimeSheets')

//lấy danh sách ca làm việc
exports.getListShifts = async (req, res) => {
    try {
        const com_id = req.query.com_id || req.user.data.com_id
        const list = await Shifts.aggregate([
            { $match: { com_id: Number(com_id) } },
            { $sort: { _id: -1 } },
        ])
        for (let i = 0; i < list.length; i++) {
            const element = list[i]
            element.num_to_calculate = Number(element.num_to_calculate)
        }
        const totalItems = await Shifts.countDocuments({ com_id: com_id })
        return functions.success(res, 'Danh sách ca làm việc của công ty', {
            totalItems,
            items: list,
        })
    } catch (error) {
        return functions.setError(res, error)
    }
}

//lấy danh sách ca làm việc theo id
exports.getShiftById = async (req, res) => {
    try {
        const { shift_id } = req.body
        if (shift_id) {
            const shift = await Shifts.findOne({
                shift_id: shift_id,
            }).lean()
            if (shift) {
                return functions.success(res, 'Lấy thông tin thành công', { shift })
            }
            return functions.setError(res, 'Không tồn tại ca làm việc', 404)
        }
        return functions.setError(res, 'Bạn chưa truyền lên id ca làm việc')
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}


exports.createShift = async (req, res) => {
    try {
        let {
            shift_name,
            start_time,
            end_time,
            start_time_latest,
            end_time_earliest,
            shift_type,
            num_to_calculate,
            num_to_money,
            is_overtime,
            flexible,
            money_per_hour,
            over_night,
            nums_day,
            type_end_date
        } = req.body;

        if (num_to_calculate) {
            num_to_money = 0
            money_per_hour = 0
        }
        if (num_to_money) {
            num_to_calculate = 0
            money_per_hour = 0
        }
        if (money_per_hour) {
            num_to_money = 0
            num_to_calculate = 0
        }

        if (req.user.data.type == 1) {
            const com_id = req.user.data.idQLC;

            const start_time_relax = req.body.start_time_relax
            const end_time_relax = req.body.end_time_relax
            const flex = req.body.flex
            if (over_night) {
                if (Number(nums_day) < 2) return functions.setError(res, "Ca qua ngày bắt buộc phải từ 2 ngày trở lên");
            }
            if (Number(type_end_date) === 1) {
                end_time = null
                end_time_earliest = null
            }
            if (shift_name && start_time && shift_type) {
                const check = await Shifts.findOne({ shift_name: shift_name, com_id: com_id }).lean();
                console.log("check", check)
                if (!check) {
                    console.log("vào đây")
                    const max = await Shifts.findOne({}, {}, { sort: { shift_id: -1 } }).lean() || 0;
                    if (start_time) {
                        const item = new Shifts({
                            shift_id: Number(max.shift_id) + 1 || 1,
                            com_id: com_id,
                            shift_name: shift_name,
                            start_time: start_time,
                            start_time_latest: start_time_latest,
                            end_time: end_time,
                            end_time_earliest: end_time_earliest,
                            shift_type: shift_type,
                            num_to_calculate: num_to_calculate,
                            num_to_money: num_to_money,
                            is_overtime: is_overtime,

                            // tinh lương theo giờ
                            money_per_hour: money_per_hour,

                            //---------------
                            "relaxTime.start_time_relax": start_time_relax,
                            "relaxTime.end_time_relax": end_time_relax,
                            flex: flex,
                            over_night: over_night,
                            nums_day: nums_day || 1,
                            type_end_date: Number(type_end_date) || 0
                        });
                        await item.save();
                        console.log("Đến đây")
                        return functions.success(res, 'tạo ca làm việc thành công', {
                            data: {
                                shift_id: Number(max.shift_id) + 1 || 1,
                                com_id: com_id,
                                shift_name: shift_name,
                                start_time: start_time,
                                start_time_latest: start_time_latest,
                                end_time: end_time,
                                end_time_earliest: end_time_earliest,
                                shift_type: shift_type,
                                num_to_calculate: num_to_calculate,
                                num_to_money: num_to_money,
                                is_overtime: is_overtime,

                                // tinh lương theo giờ
                                money_per_hour: money_per_hour,

                                //---------------
                                "relaxTime.start_time_relax": start_time_relax,
                                "relaxTime.end_time_relax": end_time_relax,
                                flex: flex,
                                type_end_date: Number(type_end_date) || 0
                            }
                        });
                    }
                }
                return functions.setError(res, "Ca làm việc này đã được tạo");
            }
            return functions.setError(res, "Thiếu dữ liệu truyền lên");
        }
        return functions.setError(res, "Tài khoản không thể thực hiện chức năng này");
    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
};

exports.editShift = async (req, res) => {
    try {
        if (req.user.data.type == 1) {
            let {
                shift_id,
                shift_name,
                start_time,
                end_time,
                start_time_latest,
                end_time_earliest,
                shift_type,
                num_to_calculate,
                num_to_money,
                is_overtime,
                money_per_hour,
                over_night,
                nums_day,
                type_end_date
            } = req.body


            const com_id = req.user.data.idQLC

            const start_time_relax = req.body.start_time_multiple
            const end_time_relax = req.body.end_time_multiple
            const flex = req.body.flex

            if (shift_id) {


                if (num_to_calculate) {
                    num_to_money = 0
                    money_per_hour = 0
                }
                if (num_to_money) {
                    num_to_calculate = 0
                    money_per_hour = 0
                }
                if (money_per_hour) {
                    num_to_money = 0
                    num_to_calculate = 0
                }

                const shift = await functions.getDatafindOne(Shifts, {
                    shift_id: shift_id,
                })
                if (Number(type_end_date) === 1) {
                    end_time = null
                    end_time_earliest = null
                }
                if (shift) {
                    await Shifts.updateOne({ shift_id: shift_id, com_id: com_id }, {
                        $set: {
                            shift_name: shift_name,
                            start_time: start_time,
                            end_time: end_time,
                            start_time_latest: start_time_latest,
                            end_time_earliest: end_time_earliest,
                            shift_type: shift_type,
                            num_to_calculate: num_to_calculate,
                            num_to_money: num_to_money,
                            is_overtime: is_overtime,
                            'relaxTime.start_time_relax': start_time_relax,
                            'relaxTime.end_time_relax': end_time_relax,
                            flex: flex,

                            // tinh tien theo gio
                            money_per_hour: money_per_hour,
                            over_night: over_night,
                            nums_day: nums_day,
                            type_end_date: Number(type_end_date) || 0
                            //-------------------------------
                        },
                    })
                    return functions.success(res, 'Cập nhật thành công')
                }
                return functions.setError(res, 'Ca làm việc không tồn tại')
            }
            return functions.setError(res, 'Chưa truyền id ca làm việc')
        }
        return functions.setError(
            res,
            'Tài khoản không thể thực hiện chức năng này'
        )
    } catch (error) {
        console.log(error)
        return functions.setError(res, error)
    }
}

exports.deleteShiftCompany = async (req, res) => {
    try {
        const com_id = req.body.com_id || req.user.data.com_id
        let shift_id = req.body.shift_id
        const shifts = await functions.getDatafind(Shifts, {
            com_id: com_id,
            shift_id: shift_id,
        })
        if (shifts) {
            await Shifts.deleteOne({ com_id: com_id, shift_id: shift_id })
            return functions.success(res, 'xoá thành công')
        }
        return functions.setError(res, 'không tìm thấy ca làm việc của công ty')
    } catch (e) {
        return functions.setError(res, e.message)
    }
}

const getDataInOut = async (id_use, id_com) => {
    const latestTimeSheetData = await TimeSheets.aggregate([{
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

exports.list_shift_user = async (req, res) => {
    try {

        const id_use = Number(req.body.u_id)
        const id_com = Number(req.body.c_id)
        if (id_com && id_use) {
            const date = new Date()
            const y = date.getFullYear()
            let m = date.getMonth() + 1
            m = m < 10 ? '0' + m : m
            const dateNow = functions.convertDate(null, true).replaceAll('/', '-')
            console.log("dateNow", dateNow)

            const user = await Users.aggregate([{
                $match: {
                    idQLC: id_use,
                    type: 2,
                    'inForPerson.employee.com_id': id_com,
                    'inForPerson.employee.ep_status': 'Active',
                },
            },
            {
                $project: {
                    ep_name: '$userName',
                },
            },
            ])
            if (user) {
                const candidate = user[0]
                const db_cycle = await Cycle.aggregate([{
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
                        'employee_cycle.ep_id': id_use,
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

                    detail_cy = detail_cy.sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime()
                    })

                    for (let i = 0; i < detail_cy.length; i++) {
                        const element = detail_cy[i]

                        if (element.date == dateNow) {
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

                        if (!element.over_night) {
                            if (!element.type_end_date) {
                                if (
                                    (element.start_time_latest <= hourNow &&
                                        element.end_time_earliest >= hourNow) ||
                                    (!element.start_time_latest && element.end_time_earliest >= hourNow) ||
                                    (!element.end_time_earliest && element.start_time_latest <= hourNow)
                                ) {

                                    const type = await getDataInOut(id_use, id_com)

                                    arr_shift.push({
                                        ...element,
                                        type: type === 1 ? 'Ca vào' : 'Ca ra',
                                    })
                                }
                            }
                            else {
                                if (
                                    !element.start_time_latest || element.start_time_latest <= hourNow
                                ) {

                                    const type = await getDataInOut(id_use, id_com)

                                    arr_shift.push({
                                        ...element,
                                        type: type === 1 ? 'Ca vào' : 'Ca ra',
                                    })
                                }
                            }


                        } else {
                            if (element.start_time_latest <= hourNow ||
                                element.start_time_latest == null ||
                                element.start_time_latest == ""
                            ) {
                                const type = await getDataInOut(id_use, id_com)

                                arr_shift.push({
                                    ...element,
                                    type: type === 1 ? 'Ca vào' : 'Ca ra',
                                })
                            }
                        }
                    }



                    // xử lý phần ca làm việc có giờ ra không cố định

                    let list_start_time = []
                    arr_shift.map(e_s => {
                        let date_shift = new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            new Date().getDate(),
                            Number(e_s.start_time.split(":")[0]),
                            Number(e_s.start_time.split(":")[1]),
                            0
                        )
                        list_start_time.push({
                            shift_id: e_s.shift_id,
                            start_time: date_shift,
                            type_end_date: e_s.type_end_date || 0
                        })
                    })

                    // xử lý ca liên ngày  
                    const find_data_cy_detail = detail_cy.find((e) => {
                        return (
                            new Date(e.date).getTime() < new Date(dateNow).getTime() &&
                            e.shift_id
                        )
                    })


                    let list_shift_over = []
                    if (find_data_cy_detail) {

                        const date_shift = find_data_cy_detail.date
                        number_date_shift = new Date(date_shift).getDate()
                        number_date_now = new Date(dateNow).getDate()

                        list_shift_over = await Shifts.find({
                            shift_id: { $in: find_data_cy_detail.shift_id.split(',').map(Number) },
                            over_night: 1,
                            nums_day: number_date_now - number_date_shift + 1,
                        }).lean()
                        if (list_shift_over && list_shift_over.length > 0) {
                            for (let j = 0; j < list_shift_over.length; j++) {
                                const element = list_shift_over[j]
                                let end_time = element.end_time_earliest ?
                                    element.end_time_earliest :
                                    element.end_time
                                if (
                                    new Date(date_shift).getFullYear() === date.getFullYear() &&
                                    new Date(date_shift).getMonth() === date.getMonth() &&
                                    new Date(date_shift).getDate() === date.getDate()
                                ) {
                                    if (
                                        element.start_time_latest <= hourNow ||
                                        element.start_time_latest == null ||
                                        element.start_time_latest == ""
                                    ) {

                                        let date_shift = new Date(
                                            new Date(date_shift).getFullYear(),
                                            new Date(date_shift).getMonth(),
                                            new Date(date_shift).getDate(),
                                            Number(element.start_time.split(":")[0]),
                                            Number(element.start_time.split(":")[1]),
                                            0
                                        )
                                        list_start_time.push({
                                            shift_id: element.shift_id,
                                            start_time: date_shift,
                                            type_end_date: element.type_end_date || 0
                                        })

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
                                        if (!element.type_end_date) {
                                            if (end_time >= hourNow || end_time == null) {

                                                let date_shift = new Date(
                                                    new Date(date_shift).getFullYear(),
                                                    new Date(date_shift).getMonth(),
                                                    new Date(date_shift).getDate(),
                                                    Number(element.start_time.split(":")[0]),
                                                    Number(element.start_time.split(":")[1]),
                                                    0
                                                )
                                                list_start_time.push({
                                                    shift_id: element.shift_id,
                                                    start_time: date_shift,
                                                    type_end_date: element.type_end_date || 0
                                                })
                                                const type = await getDataInOut(id_use, id_com)

                                                arr_shift.push({
                                                    ...element,
                                                    type: type === 1 ? 'Ca vào' : 'Ca ra',
                                                })
                                            }
                                        }
                                        else {

                                            let date_shift = new Date(
                                                new Date(date_shift).getFullYear(),
                                                new Date(date_shift).getMonth(),
                                                new Date(date_shift).getDate(),
                                                Number(element.start_time.split(":")[0]),
                                                Number(element.start_time.split(":")[1]),
                                                0
                                            )
                                            list_start_time.push({
                                                shift_id: element.shift_id,
                                                start_time: date_shift,
                                                type_end_date: element.type_end_date || 0
                                            })

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
                                        if (element.type_end_date) {

                                            let date_shift = new Date(
                                                new Date(date_shift).getFullYear(),
                                                new Date(date_shift).getMonth(),
                                                new Date(date_shift).getDate(),
                                                Number(element.start_time.split(":")[0]),
                                                Number(element.start_time.split(":")[1]),
                                                0
                                            )
                                            list_start_time.push({
                                                shift_id: element.shift_id,
                                                start_time: date_shift,
                                                type_end_date: element.type_end_date || 0
                                            })

                                            if (end_time >= hourNow || end_time == null) {

                                                const type = await getDataInOut(id_use, id_com)

                                                arr_shift.push({
                                                    ...element,
                                                    type: type === 1 ? 'Ca vào' : 'Ca ra',
                                                })
                                            }
                                        }
                                        else {
                                            let date_shift = new Date(
                                                new Date(date_shift).getFullYear(),
                                                new Date(date_shift).getMonth(),
                                                new Date(date_shift).getDate(),
                                                Number(element.start_time.split(":")[0]),
                                                Number(element.start_time.split(":")[1]),
                                                0
                                            )
                                            list_start_time.push({
                                                shift_id: element.shift_id,
                                                start_time: date_shift,
                                                type_end_date: element.type_end_date || 0
                                            })

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


                    // check xem nếu time hiện tại có chưa ca làm việc 
                    // mà ca đó có start_time > start_time của ca có giờ kết thúc ko cố định

                    let ca_loai_bo = []
                    list_start_time.map(e_s => {
                        if (e_s.type_end_date) {
                            const find_shift = list_start_time.find(e_fs => e_fs.start_time >= e_s.start_time && e_fs.start_time <= new Date() && e_fs.shift_id !== e_s.shift_id)
                            if (find_shift) ca_loai_bo.push(e_s.shift_id)

                        }
                    })
                    if (ca_loai_bo.length > 0) arr_shift = arr_shift.filter(e_s => !ca_loai_bo.includes(e_s.shift_id))

                    if (arr_shift.length) console.log("=====Có ca làm việc=======")
                    return await functions.success(
                        res,
                        'Thông tin ca làm việc khi chấm công', { ep_name: candidate.ep_name, shift: arr_shift, db_cycle }
                    )
                } else {
                    console.log("!!!!!!!!!!!! Không có ca làm việc !!!!!!!!!!!!!!!")

                    return functions.success(res, 'Thông tin ca làm việc khi chấm công', {
                        ep_name: candidate.ep_name,
                        shift: [],
                    })
                }
            }
            return functions.setError(
                res,
                'Nhân viên không tồn tại hoặc chưa được duyệt'
            )
        }
        return functions.setError(res, 'Thiếu data truyền lên')
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

exports.list_shift_user_new = async (req, res) => {
    try {

        const id_use = Number(req.body.u_id)
        const id_com = Number(req.body.c_id)
        if (id_com && id_use) {
            const date = new Date()
            const y = date.getFullYear()
            let m = date.getMonth() + 1
            m = m < 10 ? '0' + m : m
            const dateNow = functions.convertDate(null, true).replaceAll('/', '-')


            const user = await Users.aggregate([{
                $match: {
                    idQLC: id_use,
                    type: 2,
                    'inForPerson.employee.com_id': id_com,
                    'inForPerson.employee.ep_status': 'Active',
                },
            },
            {
                $project: {
                    ep_name: '$userName',
                },
            },
            ])
            if (user) {
                const candidate = user[0]
                const db_cycle = await Cycle.aggregate([{
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
                        'employee_cycle.ep_id': id_use,
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
                    // {
                    //     $project: {
                    //         _id: 0,
                    //         cy_detail: 1,
                    //         ep_id: "$EmployeCycle.ep_id"
                    //     }
                    // }
                ])

                let arr_shift_id = ''
                let arr_shift = []

                if (db_cycle.length > 0) {
                    const cycle = db_cycle[0]
                    let detail_cy = JSON.parse(cycle.cy_detail)

                    detail_cy = detail_cy.sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime()
                    })

                    for (let i = 0; i < detail_cy.length; i++) {
                        const element = detail_cy[i]

                        if (element.date == dateNow) {
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
                        if (date.getHours() >= 0 && date.getHours() < 14) {

                            if (!element.over_night) {
                                let start_time_latest = ""
                                if (element.start_time_latest) start_time_latest = element.start_time_latest
                                else start_time_latest = element.start_time
                                let start_time_latest_num = Number(start_time_latest.split(":")[0])
                                if (
                                    (element.start_time_latest <= hourNow &&
                                        element.end_time_earliest >= hourNow) ||
                                    element.start_time_latest == null ||
                                    element.end_time_earliest == null ||
                                    element.start_time_latest == '00:00:00' ||
                                    element.start_time_latest == '00:00:00' ||
                                    (
                                        (start_time_latest_num >= 0) && (start_time_latest_num < 14)
                                    )
                                ) {

                                    const type = await getDataInOut(id_use, id_com)

                                    arr_shift.push({
                                        ...element,
                                        type: type === 1 ? 'Ca vào' : 'Ca ra',
                                    })
                                }
                            } else {
                                if (element.start_time_latest <= hourNow ||
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
                        } else {
                            let start = '14:00:00'
                            let end = '23:59:59'
                            if (!element.over_night) {
                                if (
                                    (
                                        (element.end_time >= start) &&
                                        (element.end_time <= end)
                                    ) ||
                                    (
                                        (element.end_time_earliest >= start) &&
                                        (element.end_time_earliest <= end)
                                    ) ||
                                    (
                                        (element.start_time >= start) &&
                                        (element.start_time <= end)
                                    ) ||
                                    (
                                        (element.start_time_latest >= start) &&
                                        (element.start_time_latest <= end)
                                    ) ||
                                    element.end_time_earliest == null
                                ) {

                                    const type = await getDataInOut(id_use, id_com)

                                    arr_shift.push({
                                        ...element,
                                        type: type === 1 ? 'Ca vào' : 'Ca ra',
                                    })
                                }
                            } else {
                                if (element.start_time_latest >= start ||
                                    element.start_time_latest <= end ||
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




                    }

                    // xử lý ca liên ngày  

                    const find_data_cy_detail = detail_cy.find((e) => {
                        return (
                            new Date(e.date).getTime() < new Date(dateNow).getTime() &&
                            e.shift_id
                        )
                    })


                    let list_shift_over = []
                    if (find_data_cy_detail) {

                        const date_shift = find_data_cy_detail.date
                        number_date_shift = new Date(date_shift).getDate()
                        number_date_now = new Date(dateNow).getDate()

                        list_shift_over = await Shifts.find({
                            shift_id: { $in: find_data_cy_detail.shift_id.split(',').map(Number) },
                            over_night: 1,
                            nums_day: number_date_now - number_date_shift + 1,
                        }).lean()
                        if (list_shift_over && list_shift_over.length > 0) {
                            for (let j = 0; j < list_shift_over.length; j++) {
                                const element = list_shift_over[j]
                                if (date.getHours() >= 0 && date.getHours() < 14) {
                                    let end_time = element.end_time_earliest ?
                                        element.end_time_earliest :
                                        element.end_time
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
                                } else {
                                    let start = '14:00:00'
                                    let end = '23:59:59'

                                    let end_time = element.end_time_earliest ?
                                        element.end_time_earliest :
                                        element.end_time
                                    if (
                                        new Date(date_shift).getFullYear() === date.getFullYear() &&
                                        new Date(date_shift).getMonth() === date.getMonth() &&
                                        new Date(date_shift).getDate() === date.getDate()
                                    ) {
                                        if (
                                            element.start_time_latest >= start ||
                                            element.start_time_latest <= end ||
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

                                            if (end_time >= start || end_time <= end || end_time == null) {

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
                                            if (end_time >= start || end_time <= end || end_time == null) {

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
                    }



                    // check nghỉ phép
                    let de_xuat_nghi = await Vanthu_de_xuat.find({
                        type_dx: 1,
                        type_duyet: 5,
                        id_user: Number(id_use),
                        del_type: { $ne: 2 },
                    })

                    for (let i = 0; i < de_xuat_nghi.length; i++) {
                        let obj = de_xuat_nghi[i]
                        if (
                            obj &&
                            obj.noi_dung &&
                            obj.noi_dung.nghi_phep &&
                            obj.noi_dung.nghi_phep.nd &&
                            obj.noi_dung.nghi_phep.nd.length
                        ) {
                            let array = de_xuat_nghi[i].noi_dung.nghi_phep.nd
                            for (let j = 0; j < array.length; j++) {
                                if (!array[j].ca_nghi) {
                                    if (
                                        new Date() >= new Date(array[j].bd_nghi).setHours(0, 0, 0, 0) &&
                                        new Date() <= new Date(array[j].kt_nghi).setHours(23, 59, 59, 999)
                                    )
                                        arr_shift = []
                                } else {
                                    let ca_loai_bo = arr_shift.find(
                                        (e) =>
                                            new Date() >= new Date(array[j].bd_nghi).setHours(0, 0, 0, 0) &&
                                            new Date() <= new Date(array[j].kt_nghi).setHours(23, 59, 59, 999) &&
                                            Number(e.shift_id) == Number(array[j].ca_nghi)
                                    )
                                    let shift_id = 0
                                    if (ca_loai_bo) shift_id = ca_loai_bo.shift_id

                                    if (shift_id) {
                                        arr_shift = arr_shift.filter(
                                            (e) => e.shift_id != shift_id
                                        )
                                    }
                                }
                            }
                        }
                    }


                    // chấm công muộn 30p-- bỏ
                    let start_date = new Date().setHours(0, 0, 0, 0)
                    let end_date = new Date().setHours(23, 59, 59, 999)
                    let list_timesheet = await TimeSheets.find({
                        ep_id: Number(id_use),
                        at_time: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    })


                    for (let i = 0; i < arr_shift.length; i++) {
                        let data_timesheet = list_timesheet.filter(e_ts => e_ts.shift_id == arr_shift[i].shift_id)

                        data_timesheet = data_timesheet.sort((a, b) => a.at_time - b.at_time)
                        if (data_timesheet && data_timesheet.length > 0) {
                            let start_time_shift_str = arr_shift[i].start_time
                            let start_time = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate(),
                                Number(start_time_shift_str.split(':')[0]) || '0',
                                Number(start_time_shift_str.split(':')[1]) || '0',
                                Number(start_time_shift_str.split(':')[2]) || '0'
                            )
                            if (data_timesheet[0].at_time.getTime() - start_time.getTime() >= 30 * 60 * 1000)
                                arr_shift = arr_shift.filter(e_s => e_s.shift_id != arr_shift[i].shift_id)
                        }


                    }
                    let isExist = false
                    if (arr_shift.length > 0) isExist = true
                    return await functions.success(
                        res,
                        'Thông tin ca làm việc khi chấm công', { isExist: isExist, ep_name: candidate ? candidate.ep_name : "Chưa cập nhật", shift: arr_shift }
                    )
                } else {
                    // list_shift = await Shifts.find({ com_id: id_com }).lean()
                    return functions.success(res, 'Thông tin ca làm việc khi chấm công', {
                        isExist: false,
                        ep_name: candidate ? candidate.ep_name : "Chưa cập nhật",
                        shift: [],
                    })
                }
            }
            return functions.setError(
                res,
                'Nhân viên không tồn tại hoặc chưa được duyệt'
            )
        }
        return functions.setError(res, 'Thiếu data truyền lên')
    } catch (error) {
        console.log("error", error)
        return functions.setError(res, error.message)
    }
}

const renderHMS = (date) => {
    if (date) {
        let hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds()

        hour = hour >= 10 ? hour : `0${hour}`
        minute = minute >= 10 ? minute : `0${minute}`
        second = second >= 10 ? second : `0${second}`
        const hourNow = `${hour}:${minute}:${second}`

        return hourNow
    }
    return ''
}

// update shift id in timesheet
exports.updateTimeSheetShift = async (req, res) => {
    try {
        const type = req.user.data.type
        const com_id = req.user.data.com_id

        if (type == 1) {
            const { shift_id, sheet_id } = req.body

            if (shift_id && sheet_id) {
                const update = await TimeSheets.updateOne({
                    ts_com_id: Number(com_id),
                    sheet_id: Number(sheet_id),
                }, {
                    $set: {
                        shift_id: Number(shift_id),
                    },
                })

                if (update.modifiedCount > 0) {
                    return functions.success(res, 'Cap nhat thanh cong', {})
                }
                return functions.setError(res, 'Cap nhat that bai')
            }

            return functions.setError(res, 'Thieu truong truyen len')
        }

        return functions.setError(res, 'Tai khoan khong phai tai khoan cong ty')
    } catch (error) {
        console.log(error)
        return functions.setError(error.message)
    }
}