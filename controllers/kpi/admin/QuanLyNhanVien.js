const functions = require('../../../services/functions');
const functions_kpi = require('../../../services/kpi/functions');
const Users = require('../../../models/Users');
const QLC_OrganizeDetail = require('../../../models/qlc/OrganizeDetail');
const md5 = require('md5');
const service = require('../../../services/qlc/functions');

//Lấy danh sách nhân viên thuộc tổ chức
exports.getListNV = async(req, res) => {
    try {
        const com_id = req.user.data.com_id;
        const { position_id, userName, ep_id, isAdmin, organization_id } = req.body;
        const ep_status = parseInt(req.body.ep_status) || 1;
        const page = Number(req.body.page) || 1;
        const pageSize = Number(req.body.pageSize) || 10;

        if (com_id) {
            const conditions = {
                'inForPerson.employee.com_id': com_id,
            };

            if (organization_id) {
                let organization_info = await QLC_OrganizeDetail.findOne({
                    id: parseInt(organization_id),
                    comId: com_id,
                }).then((data) => data);
                if (organization_info == null) return functions.setError(res, 'Không tồn tại tổ chức', 400);
                else
                    conditions['inForPerson.employee.listOrganizeDetailId'] = {
                        $all: organization_info.listOrganizeDetailId,
                    };
            } else {
                let organization_info = await QLC_OrganizeDetail.find({ level: 1, comId: com_id }).then((data) => data);
                if (organization_info.length == 0)
                    return functions.setError(res, 'Công ty chưa thiết lập tổ chức', 400);
                else {
                    let match = [];
                    for (let i = 0; i < organization_info.length; i++) {
                        let listOrganizeDetailId = organization_info[i].listOrganizeDetailId;
                        match.push({ 'inForPerson.employee.listOrganizeDetailId': { $all: listOrganizeDetailId } });
                    }
                    conditions['$or'] = match;
                }
            }
            if (position_id) conditions['inForPerson.employee.position_id'] = position_id;
            if (userName) conditions['userName'] = { $regex: new RegExp(userName, 'i') };

            if (parseInt(ep_status) == 3) conditions['inForPerson.employee.ep_status'] = 'Deny';
            else if (parseInt(ep_status) == 2) conditions['inForPerson.employee.ep_status'] = 'Pending';
            else conditions['inForPerson.employee.ep_status'] = 'Active';

            if (ep_id) conditions.idQLC = Number(ep_id);
            if (isAdmin) conditions.isAdmin = Number(isAdmin);

            const listUser = await Users.aggregate([{
                    $match: conditions,
                },
                { $skip: (page - 1) * pageSize },
                { $limit: pageSize },

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
                        _id: 1,
                        fromWeb: 1,
                        createdAt: 1,
                        type: 1,
                        ep_id: '$idQLC',
                        userName: 1,
                        phone: 1,
                        avatarUser: 1,
                        organizeDetailName: '$organizeDetail.organizeDetailName',
                        positionName: '$positions.positionName',
                        start_working_time: '$inForPerson.employee.start_working_time',
                        email: 1,
                        emailContact: 1,
                        birthday: '$inForPerson.account.birthday',
                        gender: '$inForPerson.account.gender',
                        address: 1,
                        education: '$inForPerson.account.education',
                        experience: '$inForPerson.account.experience',
                        married: '$inForPerson.account.married',
                    },
                },
            ]);
            const total = await Users.countDocuments(conditions);
            listUser.map((e) => {
                e.positionName = e.positionName.toString();
                e.organizeDetailName = e.organizeDetailName.toString();
                if (e.avatarUser)
                    e.avatarUser = functions_kpi.createLinkFileEmpQLC(
                        e._id,
                        e.type,
                        e.fromWeb,
                        e.createdAt,
                        e.userName,
                        e.avatarUser
                    );
                if (e.married || e.married == 0)
                    e.married = e.married == 1 ? 'Độc thân' : e.married == 2 ? 'Đã lập gia đình' : 'Chưa cập nhật';
                if (e.experience || e.experience == 0)
                    e.experience =
                    e.experience == 1 ?
                    'Chưa có kinh nghiệm' :
                    e.experience == 2 ?
                    'Dưới 1 năm kinh nghiệm' :
                    e.experience == 3 ?
                    '1 năm' :
                    e.experience == 4 ?
                    '2 năm' :
                    e.experience == 5 ?
                    '3 năm' :
                    e.experience == 6 ?
                    '4 năm' :
                    e.experience == 7 ?
                    '5 năm' :
                    e.education == 8 ?
                    'Trên 5 năm' :
                    'Chưa cập nhât';
                if (e.education || e.education == 0)
                    e.education =
                    e.education == 1 ?
                    'Trên Đại học' :
                    e.education == 2 ?
                    'Đại học' :
                    e.education == 3 ?
                    'Cao đẳng' :
                    e.education == 4 ?
                    'Trung cấp' :
                    e.education == 5 ?
                    'Đào tạo nghề' :
                    e.education == 6 ?
                    'Trung học phổ thông' :
                    e.education == 7 ?
                    'Trung học cơ sở' :
                    e.education == 8 ?
                    'Tiểu học' :
                    'Chưa cập nhât';
                if (e.gender || e.gender == 0) e.gender = e.gender == 1 ? 'Nam' : e.gender == 2 ? 'Nữ' : 'Khác';
                delete e._id;
                delete e.fromWeb;
                delete e.createdAt;
                delete e.type;
            });

            return functions.success(res, 'Danh sách nhân viên', { total: total, data: listUser });
        } else return functions.setError(res, 'Thiếu thông tin com_id');
    } catch (error) {
        console.log('error', error);
        return functions.setError(res, error.message);
    }
};

//Thêm nhân viên vào tổ chức
exports.addListNV = async(req, res) => {
    try {
        const com_id = req.user.data.com_id;
        const type = req.user.data.type;
        const { listUsers, listOrganizeDetailId, organizeDetailId } = req.body;
        if (Number(type) === 1) {
            await Users.updateMany({
                type: 2,
                'inForPerson.employee.com_id': com_id,
                idQLC: {
                    $in: listUsers,
                },
            }, {
                'inForPerson.employee.listOrganizeDetailId': listOrganizeDetailId,
                'inForPerson.employee.organizeDetailId': organizeDetailId,
            });

            return functions.success(res, 'Thêm nhân viên thành công');
        } else return functions.setError(res, 'Tài khoản không phải công ty');
    } catch (error) {
        console.log('error', error);
        return functions.setError(res, error.message);
    }
};

//Tạo mới nhân viên và thêm vào công ty
exports.addNewNV = async(req, res) => {
    try {
        const type = req.user.data.type;
        const com_id = req.user.data.com_id;
        const {
            userName,
            phone,
            district_id,
            city_id,
            address,
            gender,
            birthday,
            phoneTK,
            listOrganizeDetailId,
            position_id,
            start_working_time,
            education,
            married,
            experience,
            organizeDetailId,
            isAdmin,
            email,
            emailContact,
        } = req.body;
        if (type == 1) {
            if (
                (userName,
                    district_id,
                    city_id,
                    address,
                    phoneTK,
                    emailContact,
                    listOrganizeDetailId,
                    organizeDetailId,
                    position_id)
            ) {
                //Kiểm tra tên nhân viên khác null
                const foundGateway = await functions.getDatafindOne(Users, {
                    phoneTK: phoneTK,
                    type: { $ne: 1 },
                });
                if (!foundGateway) {
                    const password = 'hungha365';
                    //Lấy ID kế tiếp, nếu chưa có giá trị nào thì bằng 0 có giá trị max thì bằng max + 1
                    let maxID = await functions.getMaxUserID();
                    const newUser = new Users({
                        _id: maxID._id,
                        idQLC: maxID._idQLC,
                        idTimViec365: maxID._idTV365,
                        idRaoNhanh365: maxID._idRN365,
                        'inForPerson.employee.com_id': com_id,
                        userName: userName,
                        phone: phone || '',
                        district: district_id || 0,
                        city: city_id || '',
                        address: address || '',
                        phoneTK: phoneTK,
                        emailContact: emailContact,
                        email: email,
                        password: md5(password),
                        role: 2,
                        'inForPerson.account.gender': gender || 0,
                        'inForPerson.account.birthday': Date.parse(birthday) / 1000,
                        'inForPerson.account.education': education || 0,
                        'inForPerson.account.married': married || 0,
                        'inForPerson.account.experience': experience || 0,
                        'inForPerson.employee.start_working_time': Math.floor(Date.parse(start_working_time) / 1000) || 0,
                        'inForPerson.employee.listOrganizeDetailId': listOrganizeDetailId,
                        'inForPerson.employee.organizeDetailId': organizeDetailId,
                        'inForPerson.employee.position_id': position_id,
                        'inForPerson.employee.ep_status': 'Active',
                        fromWeb: 'hungha365',
                        type: 2,
                        isAdmin: isAdmin || 0,
                        createdAt: functions.getTimeNow(),
                        chat365_secret: functions.chat365_secret(maxID._id),
                    });

                    await newUser.save();
                    // ----------------- Cài đặt đề xuất
                    service.settingConfirm(newUser);
                    service.settingIPApp(newUser);
                    return functions.success(res, 'Thêm nhân viên thành công', {
                        idQLC: maxID._idQLC,
                        userName: userName,
                    });
                }
                return functions.setError(res, 'Tài khoản đã tồn tại!');
            }
            return functions.setError(res, 'Cần nhập đủ thông tin');
        }
        return functions.setError(res, 'Tài khoản không phải công ty');
    } catch (e) {
        return functions.setError(res, e.message);
    }
};