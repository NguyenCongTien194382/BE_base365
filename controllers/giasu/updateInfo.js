const fnc = require('../../services/GiaSu/functions');
const functions = require('../../services/functions');
const Users = require('../../models/Users');
const UserExperience = require('../../models/GiaSu/UserExperience');
const UserTeachInformation = require('../../models/GiaSu/UserTeachInformation');
const TeachingSchedule = require('../../models/GiaSu/TeachingSchedule');
const NotCompleteProfile = require('../../models/GiaSu/NotCompleteProfile');
const AllSubject = require('../../models/GiaSu/AllSubject');
const ClassTeach = require('../../models/GiaSu/ClassTeach');
const TeachType = require('../../models/GiaSu/TeachType');
const GSLevelClass = require('../../models/GiaSu/GSLevelClass');
const md5 = require('md5');
const axios = require('axios');

exports.updateInfoParent = async (req, res, next) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let data = [];
        const { userName, emailContact, address, phone, birthday, gender, ugs_about_us, ugs_city, ugs_county } =
            req.body;
        let password = req.body.password
        let File = req.files || null;
        let avatarUser = null;
        if (!userName) {
            return functions.setError(res, 'userName không được để trống');
        }
        // if(!emailContact) {
        //     return functions.setError(res, "emailContact không được để trống")
        // }
        // if(!phone) {
        //     return functions.setError(res, "phone không được để trống")
        // }
        if (!address) {
            return functions.setError(res, 'address không được để trống');
        }
        if (!birthday) {
            return functions.setError(res, 'birthday không được để trống');
        }
        if (!gender) {
            return functions.setError(res, 'gender không được để trống');
        }
        if (!ugs_city) {
            return functions.setError(res, 'ugs_city không được để trống');
        }
        if (!ugs_county) {
            return functions.setError(res, 'ugs_county không được để trống');
        }
        let findUser = await Users.findOne({ idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 2 });
        if (findUser) {
            if (File && File.avatarUser) {
                let upload = await fnc.uploadAva(
                    findUser.avatarUser ? findUser.avatarUser : null,
                    findUser.updatedAt ? findUser.updatedAt : null,
                    'PH',
                    File.avatarUser, ['.jpeg', '.gif', '.jpg', '.png']
                );
                if (!upload) {
                    return functions.setError(res, 'Định dạng ảnh không hợp lệ');
                }
                avatarUser = upload;
            }
            data = await Users.updateOne({ idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 2 }, {
                $set: {
                    userName: userName,
                    emailContact: emailContact,
                    phone: phone,
                    avatarUser: avatarUser,
                    address: address,
                    updatedAt: functions.getTimeNow(),
                    'inForPerson.account.birthday': birthday ? Date.parse(birthday) / 1000 : undefined,
                    'inForPerson.account.gender': gender,
                    'inforGiaSu.ugs_about_us': ugs_about_us,
                    city: ugs_city,
                    district: ugs_county,
                    password: password ? md5(password) : findUser.password,
                },
            });
            return functions.success(res, 'cập nhật thành công');
        } else {
            return functions.setError(res, 'không tìm thấy Phụ huynh');
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
exports.detailParent = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let user = await Users.aggregate([
            { $match: { idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 2 } },
            {
                $lookup: {
                    from: 'City',
                    localField: 'city',
                    foreignField: '_id',
                    as: 'city',
                },
            },
            { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'District',
                    localField: 'district',
                    foreignField: '_id',
                    as: 'district',
                },
            },
            { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userName: 1,
                    emailContact: 1,
                    phone: 1,
                    avatarUser: 1,
                    address: 1,
                    updatedAt: 1,
                    birthday: '$inForPerson.account.birthday',
                    gender: '$inForPerson.account.gender',
                    ugs_about_us: '$inforGiaSu.ugs_about_us',
                    district: '$district.name',
                    city: '$city.name',
                },
            },
        ]);
        if (user.length > 0) {
            const data = user[0];
            data.avatarUser = await fnc.createLinkFile('PH', data.updatedAt, data.avatarUser);
            data.updatedAt = new Date(data.updatedAt * 1000);
            data.birthday = new Date(data.birthday * 1000);
            return functions.success(res, 'lấy thành công', { data });
        }
        return functions.setError(res, 'không tìm thấy phụ huynh');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.updateInfoTeacher = async (req, res, next) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        let data = [];
        const {
            userName,
            emailContact,
            address,
            phone,
            birthday,
            gender,
            ugs_about_us,
            ugs_city_gs,
            ugs_county_gs,
            married,
            ugs_class_teach,
            ugs_tutor_style,
            ugs_school,
            ugs_graduation_year,
            ugs_specialized,
            ugs_workplace,
            ugs_achievements,
            experience,
            as_id,
            as_detail,
            ugs_unit_price,
            ugs_time,
            ugs_salary,
            ugs_month,
            ugs_formality,
            st2,
            st3,
            st4,
            st5,
            st6,
            st7,
            scn,
            ct2,
            ct3,
            ct4,
            ct5,
            ct6,
            ct7,
            ccn,
            tt2,
            tt3,
            tt4,
            tt5,
            tt6,
            tt7,
            tcn
        } = req.body;
        let password = req.body.password
        let File = req.files || null;
        let avatarUser = null;
        const now = await functions.getTimeNow();
        let findUser = await Users.findOne({ idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 1 });
        let findUserInfor = await UserTeachInformation.findOne({ ugs_id: idGiaSu }).lean();
        if (!findUserInfor) {
            return functions.setError(res, 'Khong tim thay thong tin gia su');
        }
        let checkTeachingSchedule = await TeachingSchedule.findOne({ ugs_id: idGiaSu }).lean();
        if (!checkTeachingSchedule) {
            return functions.setError(res, 'Khong tim thay lich day cua gia su');
        }
        if (findUser) {
            if (File && File.avatarUser) {
                let upload = await fnc.uploadAva(
                    findUser.avatarUser ? findUser.avatarUser : null,
                    findUser.updatedAt ? findUser.updatedAt : null,
                    'GS',
                    File.avatarUser, ['.jpeg', '.gif', '.jpg', '.png']
                );
                if (!upload) {
                    return functions.setError(res, 'Định dạng ảnh không hợp lệ');
                }
                avatarUser = upload;
            }
            //b1 + b2
            data = await Users.updateOne({ idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 1 }, {
                $set: {
                    userName: userName,
                    emailContact: emailContact,
                    phone: phone,
                    avatarUser: avatarUser,
                    address: address,
                    updatedAt: functions.getTimeNow(),
                    'inForPerson.account.birthday': birthday ? Date.parse(birthday) / 1000 : 0,
                    'inForPerson.account.gender': gender,
                    'inForPerson.account.married': married,
                    'inforGiaSu.ugs_about_us': ugs_about_us,
                    city: ugs_city_gs,
                    district: ugs_county_gs,
                    password: password ? md5(password) : findUser.password,
                    'inforGiaSu.ugs_tutor_style': ugs_tutor_style,
                    'inforGiaSu.ugs_class_teach': ugs_class_teach,
                    'inforGiaSu.ugs_school': ugs_school,
                    'inforGiaSu.ugs_graduation_year': ugs_graduation_year,
                    'inforGiaSu.ugs_specialized': ugs_specialized,
                    'inForPerson.account.experience': experience,
                    'inforGiaSu.ugs_workplace': ugs_workplace,
                    'inforGiaSu.ugs_achievements': ugs_achievements,
                    'inforGiaSu.as_id': as_id,
                    'inforGiaSu.as_detail': as_detail,
                },
            });
            await UserTeachInformation.updateOne({ ugs_id: idGiaSu }, {
                $set: {
                    ugs_unit_price: ugs_unit_price, //vnđ
                    ugs_time: ugs_time,
                    ugs_salary: ugs_salary,
                    ugs_month: ugs_month, //Buổi':'Tháng
                    ugs_formality: ugs_formality, // kiểu dạy gặp mặt hay online - 1 là gặp mặt - 2 là onl
                },
            });
            await TeachingSchedule.updateOne({ ugs_id: idGiaSu }, {
                $set: {
                    st2: st2,
                    st3: st3,
                    st4: st4,
                    st5: st5,
                    st6: st6,
                    st7: st7,
                    scn: scn,
                    ct2: ct2,
                    ct3: ct3,
                    ct4: ct4,
                    ct5: ct5,
                    ct6: ct6,
                    ct7: ct7,
                    ccn: ccn,
                    tt2: tt2,
                    tt3: tt3,
                    tt4: tt4,
                    tt5: tt5,
                    tt6: tt6,
                    tt7: tt7,
                    tcn: tcn,
                },
            });
            return functions.success(res, 'cập nhật thành công');
        } else {
            return functions.setError(res, 'không tìm thấy gia su');
        }
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.detailTeach = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let user = await Users.aggregate([
            { $match: { idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 1 } },
            {
                $lookup: {
                    from: 'GS_user_teach_information',
                    localField: 'idGiaSu',
                    foreignField: 'ugs_id',
                    as: 'info',
                },
            },
            { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'GS_teaching_schedule',
                    localField: 'idGiaSu',
                    foreignField: 'ugs_id',
                    as: 'schedule',
                },
            },
            { $unwind: { path: '$schedule', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userName: 1,
                    emailContact: 1,
                    phone: 1,
                    avatarUser: 1,
                    address: 1,
                    updatedAt: 1,
                    birthday: '$inForPerson.account.birthday',
                    gender: '$inForPerson.account.gender',
                    married: '$inForPerson.account.married',
                    experience: '$inForPerson.account.experience',
                    typeGS: '$inforGiaSu.ugs_ft',
                    ugs_about_us: '$inforGiaSu.ugs_about_us',
                    ugs_tutor_style: '$inforGiaSu.ugs_tutor_style',
                    ugs_class_teach: '$inforGiaSu.ugs_class_teach',
                    city: 1,
                    district: 1,
                    ugs_school: '$inforGiaSu.ugs_school',
                    ugs_graduation_year: '$inforGiaSu.ugs_graduation_year',
                    ugs_specialized: '$inforGiaSu.ugs_specialized',
                    ugs_workplace: '$inforGiaSu.ugs_workplace',
                    ugs_achievements: '$inforGiaSu.ugs_achievements',
                    as_id: '$inforGiaSu.as_id',
                    as_detail: '$inforGiaSu.as_detail',
                    //thông tin chi tiết gia sư
                    ugs_unit_price: '$info.ugs_unit_price',
                    ugs_time: '$info.ugs_time',
                    ugs_salary: '$info.ugs_salary',
                    ugs_month: '$info.ugs_month',
                    ugs_formality: '$info.ugs_formality', // kiểu dạy gặp mặt hay online - 1 là gặp mặt - 2 là onl
                    //lịch dạy của gia sư
                    st2: '$schedule.st2',
                    st3: '$schedule.st3',
                    st4: '$schedule.st4',
                    st5: '$schedule.st5',
                    st6: '$schedule.st6',
                    st7: '$schedule.st7',
                    scn: '$schedule.scn',
                    ct2: '$schedule.ct2',
                    ct3: '$schedule.ct3',
                    ct4: '$schedule.ct4',
                    ct5: '$schedule.ct5',
                    ct6: '$schedule.ct6',
                    ct7: '$schedule.ct7',
                    ccn: '$schedule.ccn',
                    tt2: '$schedule.tt2',
                    tt3: '$schedule.tt3',
                    tt4: '$schedule.tt4',
                    tt5: '$schedule.tt5',
                    tt6: '$schedule.tt6',
                    tt7: '$schedule.tt7',
                    tcn: '$schedule.tcn',
                },
            },
        ]);
        if (user.length > 0) {
            const data = user[0];
            data.avatarUser = await fnc.createLinkFile('GS', data.updatedAt, data.avatarUser);
            if (data.updatedAt !== 0) data.updatedAt = new Date(data.updatedAt * 1000);
            data.birthday = new Date(data.birthday * 1000);
            return functions.success(res, 'lấy thành công', { data });
        }
        return functions.setError(res, 'không tìm thấy gia sư');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

//đăng kí tài khoản cá nhân
exports.register = async (req, res) => {
    try {
        const {
            userName,
            password,
            account,
            address,
            phone,
            emailContact,
            typeGiaSu,
            birthday,
            gender,
            ugs_about_us,
            ugs_city_gs,
            ugs_county_gs,
            married,
            ugs_class_teach,
            ugs_tutor_style,
            ugs_school,
            ugs_graduation_year,
            ugs_specialized,
            ugs_workplace,
            ugs_achievements,
            experience,
            as_id,
            as_detail,
            ugs_unit_price,
            ugs_time,
            ugs_salary,
            ugs_month,
            ugs_formality,
            ugs_job_description,
            st2,
            st3,
            st4,
            st5,
            st6,
            st7,
            scn,
            ct2,
            ct3,
            ct4,
            ct5,
            ct6,
            ct7,
            ccn,
            tt2,
            tt3,
            tt4,
            tt5,
            tt6,
            tt7,
            tcn,
        } = req.body;
        let File = req.files || null;
        let avatarUser = null;
        const createdAt = new Date();
        if (account && typeGiaSu) {
            const [user, MaxId, maxInfor, maxSchedule] = await Promise.all([
                Users.findOne({
                    $or: [{ phoneTK: account }, { email: account }],
                    type: 0,
                }).lean(),
                functions.getMaxUserID('user'),
                functions.getMaxIdByField(UserTeachInformation, 'ugs_ti'),
                functions.getMaxIdByField(TeachingSchedule, 'ts_id'),
            ]);
            if (!user) {
                //check chua hoan thien ho so
                if (userName || password || account || address || birthday || gender) {
                    let max = await functions.getMaxIdByField(NotCompleteProfile, 'profile_id');
                    let NotCompleteProfiles = new NotCompleteProfile({
                        profile_id: max,
                        user_name: userName,
                        user_phone: (await functions.checkPhoneNumber(account)) ? account : null,
                        user_email: (await functions.checkEmail(account)) ? account : null,
                        user_address: address,
                        ugs_gender: gender,
                        ugs_brithday: birthday ? Date.parse(birthday) / 1000 : 0,
                        created_at: createdAt.toISOString().slice(0, 10),
                        user_type: typeGiaSu,
                        source: 1,
                    });
                    await NotCompleteProfiles.save();
                }
                let _id = MaxId._id;
                if (File && File.avatarUser) {
                    let upload = await fnc.uploadAva(null, null, 'GS', File.avatarUser, [
                        '.jpeg',
                        '.gif',
                        '.jpg',
                        '.png',
                    ]);
                    if (!upload) {
                        return functions.setError(res, 'Định dạng ảnh không hợp lệ');
                    }
                    avatarUser = upload;
                }
                const Inuser = new Users({
                    _id: _id,
                    userName: userName,
                    phoneTK: (await functions.checkPhoneNumber(account)) ? account : null,
                    phone: (await functions.checkPhoneNumber(account)) ? account : null,
                    emailContact: (await functions.checkEmail(account)) ? account : null,
                    email: (await functions.checkEmail(account)) ? account : null,
                    password: md5(password),
                    address: address,
                    createdAt: Date.parse(createdAt) / 1000,
                    updatedAt: avatarUser ? Date.parse(createdAt) / 1000 : 0, // time update ava
                    type: 0,
                    avatarUser: avatarUser,
                    chat365_secret: Buffer.from(_id.toString()).toString('base64'),
                    fromWeb: 'GiaSu',
                    idQLC: MaxId._idQLC,
                    idTimViec365: MaxId._idTV365,
                    idRaoNhanh365: MaxId._idRN365,
                    idGiaSu: MaxId._idGiaSu,
                    'inForPerson.account.birthday': birthday ? Date.parse(birthday) / 1000 : 0,
                    'inForPerson.account.gender': gender || 0,
                    'inForPerson.account.married': married || 0, //Tình trạng hôn nhân
                    'inForPerson.account.experience': 0, //Năm kinh nghiệm
                    'inForPerson.account.education': 0,
                    //luồng phụ huynh đến đây
                    'inforGiaSu.ugs_ft': Number(typeGiaSu), // 1 là gia sư 2 là phụ huynh
                    //luồng gia sư đến đây
                    'inforGiaSu.ugs_about_us': ugs_about_us, //Giới thiệu bản thân
                    'inforGiaSu.ugs_tutor_style': ugs_tutor_style, //Kiểu gia sư
                    'inforGiaSu.ugs_class_teach': ugs_class_teach, //lớp học sẽ dạy
                    'inforGiaSu.ugs_school': ugs_school,
                    'inforGiaSu.ugs_graduation_year': ugs_graduation_year, //Năm tốt nghiệp
                    'inforGiaSu.ugs_specialized': ugs_specialized,
                    'inforGiaSu.ugs_job_description': ugs_job_description, //Mô tả công việc
                    city: ugs_city_gs,
                    district: ugs_county_gs, //quận/ huyện
                    'inForPerson.account.experience': experience,
                    'inforGiaSu.ugs_workplace': ugs_workplace,
                    'inforGiaSu.ugs_achievements': ugs_achievements,
                    'inforGiaSu.as_id': as_id,
                    'inforGiaSu.as_detail': as_detail,
                    'inforGiaSu.check_date': createdAt.toISOString().slice(0, 10),
                });
                await Inuser.save();
                let infor = {};
                let schedule = {};
                if (typeGiaSu == 1) {
                    // nếu là gia sư thì nhập thêm thông tin
                    infor = new UserTeachInformation({
                        ugs_ti: maxInfor,
                        ugs_id: MaxId._idGiaSu,
                        ugs_unit_price: ugs_unit_price,
                        ugs_time: ugs_time,
                        ugs_salary: ugs_salary,
                        ugs_month: ugs_month, //Buổi':'Tháng
                        ugs_formality: ugs_formality, // kiểu dạy gặp mặt hay online - 1 là gặp mặt - 2 là onl
                    });
                    await infor.save();
                    schedule = new TeachingSchedule({
                        ts_id: maxSchedule,
                        ugs_id: MaxId._idGiaSu,
                        st2: st2,
                        st3: st3,
                        st4: st4,
                        st5: st5,
                        st6: st6,
                        st7: st7,
                        scn: scn,
                        ct2: ct2,
                        ct3: ct3,
                        ct4: ct4,
                        ct5: ct5,
                        ct6: ct6,
                        ct7: ct7,
                        ccn: ccn,
                        tt2: tt2,
                        tt3: tt3,
                        tt4: tt4,
                        tt5: tt5,
                        tt6: tt6,
                        tt7: tt7,
                        tcn: tcn,
                    });
                    await schedule.save();
                }
                const token = await functions.createToken(Inuser, '1y');
                const refreshToken = await functions.createToken({ userId: Inuser._id }, '1y');
                let data = {
                    access_token: token,
                    refresh_token: refreshToken,
                };
                return functions.success(res, 'Tạo tài khoản thành công', { Inuser, data, infor, schedule });
            } else {
                return functions.setError(res, ' Email hoặc sđt đã tồn tại');
            }
        } else {
            return functions.setError(res, 'Thiếu thông tin để đăng kí ');
        }
    } catch (e) {
        return functions.setError(res, e.message);
    }
};

exports.toolCrawDataSubject = async (req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await functions.getDataAxios('https://giasu.timviec365.vn/api/list_all_subject.php', {
                page: page,
                pb: 1,
            });
            let data = listItems.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);

                    const ThongBaos = new AllSubject({
                        as_id: element.as_id,
                        as_name: element.as_name,
                        as_alias: element.as_alias,
                        as_parent: element.as_parent,
                        ls_parent1: element.ls_parent1,
                        ls_parent2: element.ls_parent2,
                        active_class: element.active_class,
                        active_teach: element.active_teach,
                    });
                    await ThongBaos.save();
                }
                page++;
                // console.log(page);
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, 'Thành công');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.toolCrawDataTeachType = async (req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await functions.getDataAxios('https://giasu.timviec365.vn/api/list_all_subject.php', {
                page: page,
                pb: 2,
            });
            let data = listItems.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);

                    const ThongBaos = new TeachType({
                        id: element.id,
                        nametype: element.nametype,
                    });
                    await ThongBaos.save();
                }
                page++;
                // console.log(page);
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, 'Thành công');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
exports.toolCrawDataGSLevelClass = async (req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await functions.getDataAxios('https://giasu.timviec365.vn/api/list_all_subject.php', {
                page: page,
                pb: 3,
            });
            let data = listItems.data;
            // console.log(data)
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);

                    const ThongBaos = new GSLevelClass({
                        level_class_id: element.level_class_id,
                        level_class_name: element.level_class_name,
                        slug_class_name: element.slug_class_name,
                        level_parent_id: element.level_parent_id,
                        is_index_lvclas_teacher: element.is_index_lvclas_teacher,
                        is_index_lvclas_class: element.is_index_lvclas_class,
                        meta_tit: element.meta_tit,
                        meta_des: element.meta_des,
                        meta_key: element.meta_key,
                        content: element.content,
                        title_suggest: element.title_suggest,
                        content_suggest: element.content_suggest,
                    });
                    await ThongBaos.save();
                }
                page++;
                // console.log(page);
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, 'Thành công');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
exports.toolCrawDataClassTeach = async (req, res, next) => {
    try {
        let page = 1;
        let result = true;
        do {
            let listItems = await functions.getDataAxios('https://giasu.timviec365.vn/api/list_all_subject.php', {
                page: page,
                type: 1,
                pb: 4,
            });
            let data = listItems.data;
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    // const html = JSON.stringify(element.html);

                    const ThongBaos = new ClassTeach({
                        ct_id: element.ct_id,
                        ct_name: element.ct_name,
                        ls_parent: element.ls_parent,
                    });
                    await ThongBaos.save();
                }
                page++;
                // console.log(page);
            } else {
                result = false;
            }
        } while (result);
        return functions.success(res, 'Thành công');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

//Hàm đăng nhập gia sư
exports.login = async (req, res, next) => {
    try {
        let request = req.body,
            account = request.account,
            password = request.password,
            pass_type = request.pass_type;
        let type = request.type;
        if (account && password && type) {
            let user;
            if (!pass_type) {
                password = md5(password);
            }

            user = await Users.findOne({
                $or: [{ phoneTK: account }, { email: account }],
                password: password,
                'inforGiaSu.ugs_ft': Number(type),
            }).lean();

            if (user) {
                let com_id = 0;
                const token = await functions.createToken({
                    _id: user._id,
                    idTimViec365: user.idTimViec365,
                    idQLC: user.idQLC,
                    idGiaSu: user.idGiaSu,
                    idRaoNhanh365: user.idRaoNhanh365,
                    email: user.email,
                    phoneTK: user.phoneTK,
                    createdAt: user.createdAt,
                    type: user.type,
                    com_id: com_id,
                    userName: user.userName,
                    organizeDetailId: user.organizeDetailId || 0,
                    isAdmin: user.isAdmin || 0,
                },
                    '1d'
                );
                const refreshToken = await functions.createToken({ userId: user._id }, '1y');
                let data = {};
                // if comp
                if (user.inforGiaSu.ugs_ft === 1) {
                    let userData = await Users.aggregate([
                        { $match: { _id: user._id } },
                        {
                            $lookup: {
                                from: 'GS_user_teach_information',
                                localField: 'idGiaSu',
                                foreignField: 'ugs_id',
                                as: 'info',
                            },
                        },
                        { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'GS_teaching_schedule',
                                localField: 'idGiaSu',
                                foreignField: 'ugs_id',
                                as: 'schedule',
                            },
                        },
                        { $unwind: { path: '$schedule', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                userName: 1,
                                emailContact: 1,
                                phone: 1,
                                avatarUser: 1,
                                address: 1,
                                updatedAt: 1,
                                birthday: '$inForPerson.account.birthday',
                                gender: '$inForPerson.account.gender',
                                married: '$inForPerson.account.married',
                                experience: '$inForPerson.account.experience',
                                typeGS: '$inforGiaSu.ugs_ft',
                                ugs_about_us: '$inforGiaSu.ugs_about_us',
                                ugs_tutor_style: '$inforGiaSu.ugs_tutor_style',
                                ugs_class_teach: '$inforGiaSu.ugs_class_teach',
                                city: 1,
                                district: 1,
                                ugs_school: '$inforGiaSu.ugs_school',
                                ugs_graduation_year: '$inforGiaSu.ugs_graduation_year',
                                ugs_specialized: '$inforGiaSu.ugs_specialized',
                                ugs_workplace: '$inforGiaSu.ugs_workplace',
                                ugs_achievements: '$inforGiaSu.ugs_achievements',
                                as_id: '$inforGiaSu.as_id',
                                as_detail: '$inforGiaSu.as_detail',
                                //thông tin chi tiết gia sư
                                ugs_unit_price: '$info.ugs_unit_price',
                                ugs_time: '$info.ugs_time',
                                ugs_salary: '$info.ugs_salary',
                                ugs_month: '$info.ugs_month',
                                ugs_formality: '$info.ugs_formality', // kiểu dạy gặp mặt hay online - 1 là gặp mặt - 2 là onl
                                //lịch dạy của gia sư
                                st2: '$schedule.st2',
                                st3: '$schedule.st3',
                                st4: '$schedule.st4',
                                st5: '$schedule.st5',
                                st6: '$schedule.st6',
                                st7: '$schedule.st7',
                                scn: '$schedule.scn',
                                ct2: '$schedule.ct2',
                                ct3: '$schedule.ct3',
                                ct4: '$schedule.ct4',
                                ct5: '$schedule.ct5',
                                ct6: '$schedule.ct6',
                                ct7: '$schedule.ct7',
                                ccn: '$schedule.ccn',
                                tt2: '$schedule.tt2',
                                tt3: '$schedule.tt3',
                                tt4: '$schedule.tt4',
                                tt5: '$schedule.tt5',
                                tt6: '$schedule.tt6',
                                tt7: '$schedule.tt7',
                                tcn: '$schedule.tcn',
                            },
                        },
                    ]);
                    data = userData[0];
                    data.avatarUser = fnc.createLinkFile('GS', data.updatedAt, data.avatarUser);
                    if (data.updatedAt !== 0) data.updatedAt = new Date(data.updatedAt * 1000);
                    if (data.birthday !== 0) data.birthday = new Date(data.birthday * 1000);
                    data['access_token'] = token;
                    data['refresh_token'] = refreshToken;
                    // data['user_info'] = {
                    //     ...data['user_info'],
                    // }
                    data.type = user.type;
                } else if (user.inforGiaSu.ugs_ft === 2) {
                    let userData = await Users.aggregate([
                        { $match: { _id: user._id } },
                        {
                            $lookup: {
                                from: 'City',
                                localField: 'city',
                                foreignField: '_id',
                                as: 'city',
                            },
                        },
                        { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'District',
                                localField: 'district',
                                foreignField: '_id',
                                as: 'district',
                            },
                        },
                        { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                userName: 1,
                                emailContact: 1,
                                phone: 1,
                                avatarUser: 1,
                                address: 1,
                                updatedAt: 1,
                                birthday: '$inForPerson.account.birthday',
                                gender: '$inForPerson.account.gender',
                                ugs_about_us: '$inforGiaSu.ugs_about_us',
                                district: '$district.name',
                                city: '$city.name',
                                typeGS: '$inforGiaSu.ugs_ft',
                            },
                        },
                    ]);

                    data = userData[0];
                    data.avatarUser = fnc.createLinkFile('PH', data.updatedAt, data.avatarUser);
                    if (data.updatedAt !== 0) data.updatedAt = new Date(data.updatedAt * 1000);
                    if (data.birthday !== 0) data.birthday = new Date(data.birthday * 1000);
                    data['access_token'] = token;
                    data['refresh_token'] = refreshToken;
                    // data['user_info'] = {
                    //     ...data['user_info'],
                    // }
                    data.type = user.type;
                }

                return functions.success(res, 'Đăng nhập thành công', { data });
            }
            return functions.setError(res, 'Sai tài khoản hoặc mật khẩu');
        }
        return functions.setError(res, 'Chua d? th�ng tin truy?n l�n');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error);
    }
};