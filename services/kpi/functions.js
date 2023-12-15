const Users = require('../../models/Users');
const QLC_OrganizeDetail = require('../../models/qlc/OrganizeDetail');
const dotenv = require('dotenv');
const functions = require('../functions');
dotenv.config();
const KPI365_ActivityDiary = require('../../models/kpi/KPI365_ActivityDiary');
const KPI365_Decentralization = require('../../models/kpi/KPI365_Decentralization');
const KPI365_Organization = require('../../models/kpi/KPI365_Organization');
const KPI365_NewGroup = require('../../models/kpi/KPI365_NewGroup');
const KPI365_DeletedData = require('../../models/kpi/KPI365_DeletedData');
const KPI365_TargetUnit = require('../../models/kpi/KPI365_TargetUnit');
const KPI365_Kpi = require('../../models/kpi/KPI365_Kpi');
const KPI365_Notification = require('../../models/kpi/KPI365_Notification');
const KPI365_Result = require('../../models/kpi/KPI365_Result');
const KPI365_ResultHistory = require('../../models/kpi/KPI365_ResultHistory');
const KPI365_ConfigAssess = require('../../models/kpi/KPI365_ConfigAssess');

const axios = require('axios');
const KPI365_Bonus = require('../../models/kpi/KPI365_Bonus');

//Lấy ánh nhân viên
exports.createLinkFileEmpQLC = (_id, type365, fromWeb, createdAt, userName, avatarUser) => {
    if (avatarUser != '' && avatarUser != null) {
        if (fromWeb === 'cc365' || fromWeb === 'quanlychung') {
            const stringTime = `${('0' + new Date(createdAt * 1000).getDate()).slice(-2)}/${(
                '0' +
                (new Date(createdAt * 1000).getMonth() + 1)
            ).slice(-2)}/${new Date(createdAt * 1000).getFullYear()}`;
            if (type365 === 1) {
                // return `https://cdn.timviec365.vn/upload/company/logo/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${stringTime.split('/')[0]}/${avatarUser}`
                return `http://210.245.108.202:9002/qlc/upload/company/logo/${stringTime.split('/')[2]}/${
                    stringTime.split('/')[1]
                }/${stringTime.split('/')[0]}/${avatarUser}`;
            } else {
                // return `https://cdn.timviec365.vn/pictures/uv/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${stringTime.split('/')[0]}/${avatarUser}`
                return `http://210.245.108.202:9002/qlc/upload/employee/${avatarUser}`;
            }
        } else if (fromWeb === 'timviec365' || fromWeb === 'tv365') {
            const stringTime = `${('0' + new Date(createdAt * 1000).getDate()).slice(-2)}/${(
                '0' +
                (new Date(createdAt * 1000).getMonth() + 1)
            ).slice(-2)}/${new Date(createdAt * 1000).getFullYear()}`;
            if (type365 === 1) {
                // return `https://cdn.timviec365.vn/pictures/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${stringTime.split('/')[0]}/${avatarUser}`
                return `https://cdn.timviec365.vn/pictures/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${
                    stringTime.split('/')[0]
                }/${avatarUser}`;
            } else {
                // return `https://cdn.timviec365.vn/pictures/uv/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${stringTime.split('/')[0]}/${avatarUser}`
                return `https://cdn.timviec365.vn/pictures/uv/${stringTime.split('/')[2]}/${stringTime.split('/')[1]}/${
                    stringTime.split('/')[0]
                }/${avatarUser}`;
            }
        } else {
            return avatarUser;
        }
    } else {
        try {
            let name = userName && userName.length ? userName[0] : '';
            return `http://210.245.108.202:9002/avatar/${name}_${Math.floor(Math.random() * 4) + 1}.png`;
        } catch (e) {
            console.log(e);
            return '';
        }
    }
};

//Check quyền admin
exports.checkDec = async(data_login, type, functions) => {
    let result = true;
    let typeCom = data_login.type; //Lấy type
    let user_id = data_login.id; // lấy idcty hoặc nhân viên
    if (typeCom == 0) {
        let checkDec = await KPI365_Decentralization.find({
            user_id: user_id,
            type: type,
            function: functions,
        }).select('id');

        if (checkDec.length == 0) {
            result = false; // rỗng trả về false
        }
    }
    return result;
};

//Check quyền user
exports.checkPositionHigh = (data_login) => {
    let check;
    if (![1, 9, 2, 3, 4, 20, 13, 12, 11, 10, 6, 5].includes(data_login.position_id) || data_login.type == 1) {
        check = true;
    } else {
        check = false;
    }
    return check;
};

exports.checkPositionSecond = (data_login, manager = '', followers = '') => {
    let check;
    if (![1, 9, 2, 3].includes(data_login.position_id) ||
        data_login.type == 1 ||
        manager.split(',').includes(data_login.id) ||
        followers.split(',').includes(data_login.id)
    ) {
        check = true;
    } else {
        check = false;
    }
    return check;
};

exports.getInfoCom = async(type, idQLC, com_id) => {
    let data_insert = {};
    if (type == 1) {
        const userInfo = await Users.findOne({ type: 1, idQLC: idQLC });

        data_insert.id = userInfo.idQLC;
        data_insert.com_id = userInfo.idQLC;
        data_insert.name = userInfo.userName;
        data_insert.email = userInfo.email;
        data_insert.phone = userInfo.phone;
        data_insert.user_name = userInfo.userName;
        data_insert.position_id = 0;
        data_insert.type = 1;
    } else if (type == 2) {
        const userInfo = await Users.findOne({ type: 2, idQLC: idQLC });
        const comInfo = await Users.findOne({ type: 1, idQLC: com_id });

        data_insert.id = idQLC;
        data_insert.com_id = com_id;
        data_insert.name = comInfo.userName;
        data_insert.email = userInfo.email;
        data_insert.phone = userInfo.phone;
        data_insert.user_name = userInfo.userName;
        data_insert.position_id = userInfo.inForPerson.employee.position_id;
        data_insert.type = 2;
    }

    return data_insert;
};

exports.getDate = (time = null) => {
    let date_time;
    if (time) date_time = new Date(time);
    else date_time = new Date();
    const dd = String(date_time.getDate()).padStart(2, '0');
    const mm = String(date_time.getMonth() + 1).padStart(2, '0');
    const yyyy = date_time.getFullYear();

    date_time = `${dd}-${mm}-${yyyy}`;
    return date_time;
};

exports.getMaxId = async() => {
    const MaxIdActivityDiary = await KPI365_ActivityDiary.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdDecentralization = await KPI365_Decentralization.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdOrganization = await KPI365_Organization.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdNewGroup = await KPI365_NewGroup.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdDeleteData = await KPI365_DeletedData.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdTargetUnit = await KPI365_TargetUnit.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdKPI = await KPI365_Kpi.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdN = await KPI365_Notification.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdResult = await KPI365_Result.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdResultOkr = await KPI365_ResultHistory.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdConfigAssess = await KPI365_ConfigAssess.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });
    const MaxIdB = await KPI365_Bonus.findOne({})
        .sort({ id: -1 })
        .then((data) => {
            return data.id;
        })
        .catch((err) => {
            return 0;
        });

    return {
        MaxIdActivityDiary,
        MaxIdDecentralization,
        MaxIdOrganization,
        MaxIdNewGroup,
        MaxIdDeleteData,
        MaxIdTargetUnit,
        MaxIdKPI,
        MaxIdN,
        MaxIdResult,
        MaxIdResultOkr,
        MaxIdConfigAssess,
        MaxIdB,
    };
};

exports.convertStrToArr = (str) => {
    let arr = [];
    if (str != '') {
        arr = str.split(',');
    }
    arr = arr.map(function(item) {
        return parseInt(item, 10);
    });
    return arr;
};

exports.detailComKPI = (id) => {
    return `/chi-tiet-kpi-c${id}.html`;
};

exports.detailGroupKPI = (id) => {
    return `/chi-tiet-kpi-g${id}.html`;
};

exports.capNhatComKPI = (id) => {
    return `/cap-nhat-ket-qua-c${id}.html`;
};

exports.capNhatComOkrKPI = (id) => {
    return `/cap-nhat-ket-qua-okr-c${id}.html`;
};

exports.capNhatGroupKPI = (id) => {
    return `/cap-nhat-ket-qua-g${id}.html`;
};

exports.capNhatGroupOkrKPI = (id) => {
    return `/cap-nhat-ket-qua-okr-g${id}.html`;
};

exports.detailSingleKPI = (id) => {
    return `/chi-tiet-kpi-s${id}.html`;
};

exports.capNhatSingleKPI = (id) => {
    return `/cap-nhat-ket-qua-s${id}.html`;
};

exports.capNhatSingleOkrKPI = (id) => {
    return `/cap-nhat-ket-qua-okr-o${id}.html`;
};

exports.detailSingleKPIOrganization = (id) => {
    return `/chi-tiet-kpi-o${id}.html`;
};

exports.capNhatSingleKPIOrganization = (id) => {
    return `/cap-nhat-ket-qua-o${id}.html`;
};

exports.capNhatSingleOkrKPIOrganization = (id) => {
    return `/cap-nhat-ket-qua-okr-o${id}.html`;
};

exports.getInfoKPI = async(id, com_id) => {
    try {
        let kpi_info = await KPI365_Kpi.findOne({ id: id }).then((data) => data);
        let data = {};
        if (kpi_info.type == '1') {
            //Lấy danh sách nhân viên toàn công ty
            const listUser = await Users.aggregate([{
                    $match: {
                        'inForPerson.employee.com_id': com_id,
                        'inForPerson.employee.ep_status': 'Active',
                    },
                },
                {
                    $lookup: {
                        from: 'QLC_Positions',
                        localField: 'inForPerson.employee.position_id',
                        foreignField: 'id',
                        let: { comId: '$comId' },
                        pipeline: [{ $match: { comId: com_id } }],
                        as: 'positions',
                    },
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
                    $project: {
                        _id: 0,
                        ep_id: '$idQLC',
                    },
                },
            ]);
            let listEmployee = listUser.map((item) => item.ep_id);

            data = {
                name: kpi_info.name,
                detail_url: this.detailComKPI(id),
                staffs: listEmployee,
                result_update_url: kpi_info.type_unit != 5 ? this.capNhatComKPI(id) : this.capNhatComOkrKPI(id),
                managers: [],
                prefix: '',
                followers: kpi_info.followers.split(','),
            };
        } else if (kpi_info.type == '4') {
            data = {
                name: kpi_info.name,
                detail_url: this.detailGroupKPI(id),
                result_update_url: kpi_info.type_unit != '5' ? this.capNhatGroupKPI(id) : this.capNhatGroupOkrKPI(id),
            };
            if (kpi_info.group_type == 1) {
                let group_info = await KPI365_NewGroup.findOne({ id: kpi_info.group_id, com_id: com_id }).then(
                    (data) => data
                );
                data.staffs = group_info.staff_id.split(',');
                data.managers = group_info.manage_id.split(',');
                data.followers = group_info.followers_id.split(',');
                data.prefix = group_info.group_name + ' - ';
            }
        } else if (kpi_info.type == '5') {
            data = {
                name: kpi_info.name,
                detail_url: this.detailSingleKPI(id),
                result_update_url: kpi_info.type_unit != '5' ? this.capNhatSingleKPI(id) : this.capNhatSingleOkrKPI(id),
                staffs: kpi_info.staff == '0' ? [] : kpi_info.staff.split(','),
                managers: kpi_info.manager == '0' || kpi_info.manager == '' ? [] : kpi_info.manager.split(','),
                followers: kpi_info.followers == '0' || kpi_info.followers == '' ? [] : kpi_info.followers.split(','),
                prefix: '',
            };
        } else if (kpi_info.type == '6') {
            const listOrganizeDetailId = await QLC_OrganizeDetail.findOne({
                id: parseInt(kpi_info.organization_id),
                comId: com_id,
            }).then((data) => data.listOrganizeDetailId);
            let list_staff = await Users.aggregate([{
                    $match: {
                        'inForPerson.employee.listOrganizeDetailId': { $all: listOrganizeDetailId },
                        'inForPerson.employee.ep_status': 'Active',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        ep_id: '$idQLC',
                    },
                },
            ]);
            let arr_list_staff = list_staff.map((item) => item.ep_id.toString());
            data = {
                name: kpi_info.name || '',
                detail_url: this.detailSingleKPIOrganization(id),
                result_update_url: kpi_info.type_unit != '5' ?
                    this.capNhatSingleKPIOrganization(id) :
                    this.capNhatSingleOkrKPIOrganization(id),
                staffs: arr_list_staff.length == 0 ? [] : arr_list_staff,
                managers: kpi_info.manager == '0' || kpi_info.manager == '' ? [] : kpi_info.manager.split(','),
                followers: kpi_info.followers == '0' || kpi_info.followers == '' ? [] : kpi_info.followers.split(','),
                prefix: '',
            };
        } else {
            data = {
                name: 'Không có dữ liệu',
                detail_url: 'Không có dữ liệu',
                result_update_url: 'Không có dữ liệu',
                staffs: 'Không có dữ liệu',
                managers: 'Không có dữ liệu',
                followers: 'Không có dữ liệu',
            };
        }

        return data;
    } catch (error) {
        return (data = {
            name: 'Không có dữ liệu',
            detail_url: 'Không có dữ liệu',
            result_update_url: 'Không có dữ liệu',
            staffs: 'Không có dữ liệu',
            managers: 'Không có dữ liệu',
            followers: 'Không có dữ liệu',
        });
    }
};

exports.addNotification = async(notification_data, com_id, type) => {
    let now = functions.getTimeNow();
    let maxIdN = await this.getMaxId().then((data) => data.MaxIdN);
    let insert_data = new KPI365_Notification({
        id: maxIdN + 1,
        type_title: notification_data.type_title,
        content: notification_data.content,
        user_id: notification_data.user_id,
        login_type: type,
        created_at: now,
        company_id: com_id,
        type: 0,
        url: notification_data.url,
    });
    await insert_data.save();
};

exports.send_mess = async(
    senderId,
    typeSenderId,
    companyId,
    title,
    message,
    listComReceive = [],
    listEpReceive = [],
    link
) => {
    try {
        let type_sender_id = parseInt(typeSenderId);
        let sender_id = await Users.find({ idQLC: parseInt(senderId), type: type_sender_id }).then((data) =>
            data.map((item) => item._id)
        );
        let company_id = parseInt(companyId);
        let arr_id_chat_ep = await Users.find({ idQLC: { $in: listEpReceive }, type: 2 }).then((data) =>
            data.map((item) => item._id)
        );
        let arr_id_chat_com = await Users.find({ idQLC: { $in: listComReceive }, type: 1 }).then((data) =>
            data.map((item) => item._id)
        );
        let count_mes = 0;

        for (let i = 0; i < arr_id_chat_ep.length; i++) {
            let user_id = arr_id_chat_ep[i];
            let sendmes = await axios({
                    method: 'post',
                    url: 'http://210.245.108.202:9009/api/message/SendMessageIdChat',
                    data: {
                        SenderID: sender_id,
                        UserID: user_id,
                        MessageType: 'OfferReceive',
                        Message: message,
                        Link: link,
                    },
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((data) => data.data.data.result)
                .catch((error) => {
                    console.log(error);
                    return false;
                });
            if (sendmes) {
                count_mes = count_mes + 1;
            }
        }

        for (let i = 0; i < arr_id_chat_com.length; i++) {
            let user_id = arr_id_chat_com[i];
            let sendmes = await axios({
                    method: 'post',
                    url: 'http://210.245.108.202:9000/api/message/SendMessageIdChat',
                    data: {
                        SenderID: sender_id,
                        UserID: user_id,
                        MessageType: 'OfferReceive',
                        Message: message,
                        Link: link,
                    },
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((data) => data.data.data.result)
                .catch((error) => {
                    console.log(error);
                    return false;
                });
            if (sendmes) {
                count_mes = count_mes + 1;
            }
        }

        return count_mes;
    } catch (error) {
        console.log('Lỗi khi gửi tin nhắn:' + error);
        return false;
    }
};

exports.json_formula = async(target_id, target_calculate) => {
    //target_id : chuỗi id chỉ tiêu
    //target_calculate: 0. tự nhập 1. công thức
    let arr_target_id = target_id.split(',');
    let arr_target_calculate = target_calculate.split(',');
    let array_formula = [];
    for (let i = 0; i < arr_target_id.length; i++) {
        let item = arr_target_id[i];
        let unit_info = await KPI365_TargetUnit.findOne({ id: parseInt(item) });
        let formula = unit_info.formula;
        if (formula != '' && parseInt(arr_target_calculate[i]) == 1) {
            array_formula.push({ formula: formula });
        } else {
            array_formula.push({});
        }
    }
    return JSON.stringify(array_formula);
};