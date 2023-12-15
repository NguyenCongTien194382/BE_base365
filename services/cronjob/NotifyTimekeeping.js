// check ảnh và video

const Users = require('../../models/Users')
const NotifyTimekeeping = require("../../models/qlc/NotifyTimekeeping")
const schedule = require('node-schedule');
const Shifts = require('../../models/qlc/Shifts')
const Cycle = require('../../models/qlc/Cycle')
const EmployeCycle = require('../../models/qlc/CalendarWorkEmployee')
// gửi mail

// tạo biến môi trường
const dotenv = require('dotenv')
// mã hóa mật khẩu
// tạo token
const jwt = require('jsonwebtoken')
const axios = require('axios')



dotenv.config()


exports.get_time_shift = async () => {
    try {
        let run = true

        if (run) {

            run = false
            const list_data = await NotifyTimekeeping.find({
                status: 1
            })
            const list_company_id = []
            list_data.map(e => list_company_id.push(e.com_id))
            const detail_company = await Users.find({
                idQLC: {
                    $in: list_company_id
                },
                type: 1
            },
                {
                    _id: 1
                }
            ).lean
            const list_shift = await Shifts.find(
                {
                    com_id: {
                        $in: list_company_id
                    }
                },
                {
                    shift_id: 1,
                    com_id: 1,
                    shift_name: 1,
                    start_time: 1,
                    start_time_latest: 1,
                    end_time: 1,
                    end_time_earliest: 1
                }
            )



            list_shift.map(async e => {
                let shift_id = e.shift_id
                let com_id = e.com_id
                let start_time = e.start_time_latest || e.start_time
                let end_time = e.end_time || e.end_time_latest
                const notify = list_data.find(item => item.com_id == e.com_id)


                const jobTime_start = { hour: Number(start_time.split(":")[0]), minute: Number(start_time.split(":")[1]) - notify.minute - 2, dayOfWeek: [0, 1, 2, 3, 4, 5, 6] };
                const jobTime_end = { hour: Number(end_time.split(":")[0]), minute: Number(end_time.split(":")[1]) - notify.minute - 2, dayOfWeek: [0, 1, 2, 3, 4, 5, 6] };

                if (jobTime_start.minute < 0) {
                    jobTime_start.hour = jobTime_start.hour - Math.ceil(Math.abs(jobTime_start.minute) / 60)
                    jobTime_start.minute = 60 - (Math.abs(jobTime_start.minute) - Math.floor(Math.abs(jobTime_start.minute) / 60) * 60)
                    if (jobTime_start.hour < 0) {
                        jobTime_start.hour = 24 + jobTime_start.hour
                    }
                }

                if (jobTime_end.minute < 0) {
                    jobTime_end.hour = jobTime_end.hour - Math.ceil(Math.abs(jobTime_end.minute) / 60)
                    jobTime_end.minute = 60 - (Math.abs(jobTime_end.minute) - Math.floor(Math.abs(jobTime_end.minute) / 60) * 60)
                    if (jobTime_end.hour < 0) {
                        jobTime_end.hour = 24 + jobTime_end.hour
                    }
                }

                if (shift_id == 2025370) {
                    console.log("jobTime_start", jobTime_start)
                    console.log("jobTime_end", jobTime_end)
                }
                // 0:vào - 1:ra
                // thông báo vào ca
                schedule.scheduleJob(`${e.shift_id}-0`, jobTime_start, async () => {

                    const date = new Date()

                    let list_cycle = await Cycle.find({

                        com_id: e.com_id

                    }).lean()
                    list_cycle = list_cycle.filter(item =>
                        new Date(item.apply_month).getMonth() == date.getMonth() &&
                        new Date(item.apply_month).getFullYear() == date.getFullYear()
                    )
                    let list_cycle_final = []
                    list_cycle.map(item => {
                        let cy_detail = JSON.parse(item.cy_detail)
                        let find_shift = cy_detail.find(item_cy_detail =>
                            new Date(item_cy_detail.date).getDate() == date.getDate() &&
                            new Date(item_cy_detail.date).getMonth() == date.getMonth() &&
                            new Date(item_cy_detail.date).getFullYear() == date.getFullYear()
                            && item_cy_detail.shift_id.split(",").map(item_shift => Number(item_shift)).includes(shift_id)
                        )
                        if (find_shift) list_cycle_final.push(Number(item.cy_id))
                    })
                    const list_employeCycle = await EmployeCycle.find(
                        {
                            cy_id: {
                                $in: list_cycle_final
                            }
                        },
                        {
                            ep_id: 1
                        }
                    ).lean()
                    const list_ep_id = []
                    list_employeCycle.map(item_ecy => list_ep_id.push(Number(item_ecy.ep_id)))


                    const list_ep_idChat = []
                    const list_user = await Users.find(
                        {
                            idQLC: {
                                $in: list_ep_id
                            }
                        },
                        {
                            _id: 1
                        }
                    )
                    list_user.map(item_user => list_ep_idChat.push(item_user._id))
                    const info_company = await Users.findOne(
                        {
                            idQLC: com_id,
                            type: 1

                        },
                        {
                            _id: 1
                        }

                    )
                    let idChat_company = info_company ? info_company._id : 0

                    await axios.post(
                        'http://210.245.108.202:9000/api/V2/Notification/SendNotiListUser',
                        {
                            list_id_user: list_ep_idChat,
                            message: notify.content || "",
                            sender_id: idChat_company || 10016237

                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                }
                )

                // thông báo ra ca
                schedule.scheduleJob(`${e.shift_id}-1`, jobTime_end, async () => {

                    const date = new Date()


                    let list_cycle = await Cycle.find({

                        com_id: e.com_id

                    }).lean()
                    list_cycle = list_cycle.filter(item =>
                        new Date(item.apply_month).getMonth() == date.getMonth() &&
                        new Date(item.apply_month).getFullYear() == date.getFullYear()
                    )
                    let list_cycle_final = []
                    list_cycle.map(item => {
                        let cy_detail = JSON.parse(item.cy_detail)
                        let find_shift = cy_detail.find(item_cy_detail =>
                            new Date(item_cy_detail.date).getDate() == date.getDate() &&
                            new Date(item_cy_detail.date).getMonth() == date.getMonth() &&
                            new Date(item_cy_detail.date).getFullYear() == date.getFullYear()
                            && item_cy_detail.shift_id.split(",").map(item_shift => Number(item_shift)).includes(shift_id)
                        )
                        if (find_shift) list_cycle_final.push(Number(item.cy_id))
                    })
                    const list_employeCycle = await EmployeCycle.find(
                        {
                            cy_id: {
                                $in: list_cycle_final
                            }
                        },
                        {
                            ep_id: 1
                        }
                    ).lean()
                    const list_ep_id = []
                    list_employeCycle.map(item_ecy => list_ep_id.push(Number(item_ecy.ep_id)))


                    const list_ep_idChat = []
                    const list_user = await Users.find(
                        {
                            idQLC: {
                                $in: list_ep_id
                            },
                            type: 2
                        },
                        {
                            _id: 1
                        }
                    )
                    list_user.map(item_user => list_ep_idChat.push(item_user._id))
                    const info_company = await Users.findOne({
                        idQLC: com_id,
                        type: 1
                    })
                    let idChat_company = info_company ? info_company._id : 0

                    await axios.post(
                        'http://210.245.108.202:9000/api/V2/Notification/SendNotiListUser',
                        {
                            list_id_user: list_ep_idChat,
                            message: notify.content || "",
                            sender_id: idChat_company || 10016237

                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                })

            })

        }

    } catch (error) {
        throw new Error('Lỗi thông báo chấm công')
    }
}
