const fnc = require('../../services/GiaSu/functions');
const functions = require('../../services/functions');
const Users = require('../../models/Users');
const City = require('../../models/City');
const District = require('../../models/District');
const PostFindTutor = require('../../models/GiaSu/PostFindTutor');
const AllSubject = require('../../models/GiaSu/AllSubject');
const TeachingSchedule = require('../../models/GiaSu/TeachingSchedule');
const ClassTeach = require('../../models/GiaSu/ClassTeach');
const Notification = require('../../models/GiaSu/Notification');
const InviteTeach = require('../../models/GiaSu/InviteTeach');
const SaveTeach = require('../../models/GiaSu/SaveTeach');
const SaveCourse = require('../../models/GiaSu/SaveCourse');
const SeeUser = require('../../models/GiaSu/SeeUser');
const GSCommentRate = require('../../models/GiaSu/GSCommentRate');
const UserTeachInformation = require('../../models/GiaSu/UserTeachInformation');
const GSLevelClass = require('../../models/GiaSu/GSLevelClass');

exports.post = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let {
            pft_summary,
            alias,
            as_id,
            as_detail,
            ct_id,
            city_detail,
            pft_form,
            pft_time,
            pft_nb_student,
            pft_nb_lesson,
            pft_gender,
            pft_school_day,
            pft_phone,
            city_id,
            pft_address,
            pft_detail,
            pft_price_type,
            pft_price,
            pft_end,
            pft_month,
            tutor_style,
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

        if ((as_id, as_detail, ct_id, city_detail)) {
            let numPost = await PostFindTutor.count({ ugs_id: idGiaSu });
            let now = new Date();
            let time = new Date(pft_time);
            let d1 = Date.parse(now) / 1000;
            let d2 = d1 + 86400;
            let num_day_post = await PostFindTutor.count({ ugs_id: idGiaSu, day_post: { $gte: d1, $lte: d2 } });
            if (num_day_post < 24) {
                let max = await functions.getMaxIdByField(PostFindTutor, 'pft_id');
                let max1 = await functions.getMaxIdByField(TeachingSchedule, 'ts_id');
                let last_post = await PostFindTutor.findOne({ ugs_id: idGiaSu }).sort({ pft_id: -1 }).lean();
                // let last_post =  await PostFindTutor.findOne({pft_id : Number(max) - 1 })
                // console.log(last_post)
                let time_post = 0;
                if (last_post) {
                    time_post = last_post.day_post;
                } else {
                    time_post = 0;
                }
                if (d1 - time_post >= 600) {
                    // cấm đăng trong vòng 10p
                    // let check_exits = await PostFindTutor.findOne({ugs_id : idGiaSu,as_id: as_id ,as_detail :as_detail, ct_id: ct_id, city_detail: city_detail }).lean()
                    // if(!check_exits){
                    // let title1 = await AllSubject.findOne({
                    //     as_id : as_detail
                    // })
                    // let title2 = await AllSubject.findOne({
                    //     as_id : as_id
                    // })
                    // let
                    // if (as_detail != null && as_detail != '') {
                    //     tittle_as = title2.as_name + ' - ' + title1.as_name
                    // }else{
                    //     tittle_as = title2.as_name
                    // }
                    if (pft_summary) alias = fnc.renderAlias(pft_summary);
                    let price = pft_price;
                    if (pft_price_type != 0 && pft_price_type == 2) {
                        price = `${pft_price},${pft_end}`;
                    }
                    const posts = new PostFindTutor({
                        pft_id: max,
                        ugs_id: idGiaSu,
                        pft_summary: pft_summary,
                        alias: alias,
                        as_id: as_id,
                        ct_id: ct_id,
                        as_detail: as_detail,
                        pft_form: pft_form,
                        day_post: Date.parse(now) / 1000,
                        pft_time: pft_time ? pft_time : 'Chưa cập nhật',
                        pft_nb_student: pft_nb_student,
                        pft_nb_lesson: pft_nb_lesson,
                        pft_gender: pft_gender,
                        tutor_style: tutor_style,
                        pft_school_day: pft_school_day,
                        pft_phone: pft_phone,
                        city_id: city_id,
                        city_detail: city_detail,
                        pft_address: pft_address,
                        pft_detail: pft_detail,
                        pft_price: price,
                        pft_price_type: pft_price_type,
                        pft_month: pft_month,
                        pft_view: '',
                        pft_status: 1,
                        active: 1,
                        trangthai_lop: 0,
                        day_post: d1,
                        day_update: d1,
                    });
                    await posts.save();
                    let insertSchedule = new TeachingSchedule({
                        ts_id: max1,
                        pft_id: max,
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
                    await insertSchedule.save();
                    await Users.updateOne({ idGiaSu: idGiaSu }, {
                        'inforGiaSu.check_index': 1,
                    });
                    return functions.success(res, 'lấy thành công', { posts, insertSchedule });
                    // }
                    // return functions.setError(res , "Tin chưa có môn học, lớp và quận huyện.")
                }
                return functions.setError(res, 'Bạn vừa mới đăng tin, đợi 10 phút sau để đăng tin tiếp.');
            }
            return functions.setError(res, 'Bạn đã đăng 24 tin trong ngày hôm này');
        }
        return functions.setError(res, 'nhập thiếu 1 trong các trường:as_id, as_detail, ct_id , city_detail');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.editPost = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;

        let {
            pft_id,
            pft_summary,
            alias,
            as_id,
            as_detail,
            ct_id,
            city_detail,
            pft_form,
            pft_time,
            pft_nb_student,
            pft_nb_lesson,
            pft_gender,
            pft_school_day,
            pft_phone,
            city_id,
            pft_address,
            pft_detail,
            pft_price_type,
            pft_price,
            pft_end,
            pft_month,
            tutor_style,
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
        if (!pft_id) {
            return functions.setError(res, 'vui long nhap pft_id de cap nhat tin');
        }
        let time = new Date(pft_time);
        let now = new Date();
        let check = await PostFindTutor.findOne({
            pft_id: pft_id,
        });
        if (check) {
            const posts = await PostFindTutor.updateOne({
                pft_id: pft_id,
            }, {
                ugs_id: idGiaSu,
                pft_summary: pft_summary,
                alias: alias,
                as_id: as_id,
                ct_id: ct_id,
                as_detail: as_detail,
                pft_form: pft_form,
                day_update: Date.parse(now) / 1000,
                pft_time: Date.parse(time) / 1000,
                pft_nb_student: pft_nb_student,
                pft_nb_lesson: pft_nb_lesson,
                pft_gender: pft_gender,
                tutor_style: tutor_style,
                pft_school_day: pft_school_day,
                pft_phone: pft_phone,
                city_id: city_id,
                city_detail: city_detail,
                pft_address: pft_address,
                pft_detail: pft_detail,
                pft_price: pft_price,
                pft_price_type: pft_price_type,
                pft_month: pft_month,
            });
            let insertSchedule = await TeachingSchedule.updateOne({
                pft_id: pft_id,
            }, {
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
            return functions.success(res, 'cap nhat thành công', { posts, insertSchedule });
        }
        return functions.setError(res, 'khong tim thay tin dang');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.allowSearchTeacher = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        const type = req.body.type;
        let check = await Users.findOne({
            idGiaSu: idGiaSu,
            'inforGiaSu.ugs_ft': 1,
        });
        if (check) {
            await Users.updateOne({
                idGiaSu: idGiaSu,
                'inforGiaSu.ugs_ft': 1,
            }, {
                'inforGiaSu.is_hide': type,
            });
            return functions.success(res, 'cap nhat thanh cong');
        }
        return functions.setError(res, 'khong tim thay user');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.refreshTeacher = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        let now = new Date();
        let check = await Users.findOne({
            idGiaSu: idGiaSu,
            'inforGiaSu.ugs_ft': 1,
        });
        if (check) {
            await Users.updateOne({
                idGiaSu: idGiaSu,
                'inforGiaSu.ugs_ft': 1,
            }, {
                updatedAt: Date.parse(now) / 1000,
            });
            return functions.success(res, 'cap nhat thanh cong');
        }
        return functions.setError(res, 'khong tim thay user');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.refreshClass = async (req, res) => {
    try {
        const id_lop = req.body.id_lop;
        let now = new Date();
        let check = await PostFindTutor.findOne({
            pft_id: id_lop,
        });
        if (check) {
            await PostFindTutor.updateOne({
                pft_id: id_lop,
            }, {
                day_update: Date.parse(now) / 1000,
            });
            return functions.success(res, 'cap nhat thanh cong');
        }
        return functions.setError(res, 'khong tim thay lớp');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
//Cập nhật trạng thái lớp học
exports.updateStatus = async (req, res) => {
    try {
        const id_lop = req.body.id_lop;
        const trangthai = req.body.trangthai;
        let check = await PostFindTutor.findOne({
            pft_id: id_lop,
        });
        if (check) {
            await PostFindTutor.updateOne({
                pft_id: id_lop,
            }, {
                trangthai_lop: trangthai,
            });
            return functions.success(res, 'cap nhat thanh cong');
        }
        return functions.setError(res, 'khong tim thay lop hoc');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
//Cập nhật trạng thái lớp học
exports.updateStatus = async (req, res) => {
    try {
        const id_lop = req.body.id_lop;
        const trangthai = req.body.trangthai;
        let check = await PostFindTutor.findOne({
            pft_id: id_lop,
        });
        if (check) {
            await PostFindTutor.updateOne({
                pft_id: id_lop,
            }, {
                trangthai_lop: trangthai,
            });
            return functions.success(res, 'cap nhat thanh cong');
        }
        return functions.setError(res, 'khong tim thay lop hoc');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
//Cập nhật trạng thái gia sư
exports.updateStatusTeach = async (req, res) => {
    try {
        const id_md = req.body.id_md;
        const trangthai = req.body.trangthai;
        let check = await InviteTeach.findOne({
            it_id: id_md,
        });
        if (check) {
            await InviteTeach.updateOne({
                it_id: id_md,
            }, {
                it_status: trangthai,
            });
            return functions.success(res, 'Cập nhật trạng thái gia sư dạy lớp thành công');
        }
        return functions.setError(res, 'Cập nhật trạng thái gia sư dạy lớp thất bại');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.saveTeacher = async (req, res) => {
    try {
        const st_pr_id = req.body.st_pr_id;
        const idGiaSu = req.user.data.idGiaSu;
        const st_it_teach = req.body.st_it_teach;
        const today = new Date();
        const max = await functions.getMaxIdByField(SaveTeach, 'st_id');
        let check = await SaveTeach.findOne({
            st_pr_id: st_pr_id ? st_pr_id : idGiaSu, //id phu huynh - idParent
            ugs_teach: st_it_teach,
        });
        if (!check) {
            let saveTeacher = await SaveTeach({
                st_id: max,
                st_pr_id: st_pr_id ? st_pr_id : idGiaSu,
                ugs_teach: st_it_teach,
                st_it_teach: st_it_teach,
                st_date: Date.parse(today) / 1000,
            });
            await saveTeacher.save();
            return functions.success(res, 'Lưu gia sư thành công');
        }
        return functions.setError(res, 'Gia sư này bạn đã lưu');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.unsave_teacher = async (req, res) => {
    try {
        const id = req.body.id;
        let check = await SaveTeach.findOne({
            st_id: id,
        });
        if (check) {
            await SaveTeach.deleteOne({
                st_id: id,
            });
            return functions.success(res, 'Xóa lưu gia sư thành công');
        }
        return functions.setError(res, 'khong tim thay Gia sư ');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.deleteNoti = async (req, res) => {
    try {
        const id = req.body.id;

        let idArray = id.split(',').map(Number);
        for (let i = 0; i < idArray.length; i++) {
            console.log(idArray[i]);
            await Notification.deleteOne({ noti_id: idArray[i] });
        }
        // await Notification.deleteMany({ noti_id: { $in: idArray }});
        return functions.success(res, 'Xoa thanh cong!');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.deleteInvite = async (req, res) => {
    try {
        const id = req.body.id;

        let idArray = id.split(',').map(Number);
        for (let i = 0; i < idArray.length; i++) {
            await InviteTeach.deleteOne({ it_id: idArray[i] });
        }
        // await Notification.deleteMany({ noti_id: { $in: idArray }});
        return functions.success(res, 'Xoa thanh cong!');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
//phụ huynh mời dạy:
exports.ParentInvite = async (req, res) => {
    try {
        const pft_id = req.body.id_lop;
        const idGiaSu = req.user.data.idGiaSu;
        const ugs_teach = req.body.ugs_teach;
        const pft_address = req.body.pft_address;
        const it_status = req.body.it_status;
        const day_invitation_teach = new Date(req.body.day_invitation_teach);
        let today = new Date();
        let check = '';
        let maxInvite = '';
        let idArray = pft_id.split(',').map(Number);
        for (let i = 0; i < idArray.length; i++) {
            let maxTB = await functions.getMaxIdByField(Notification, 'noti_id');
            maxInvite = await functions.getMaxIdByField(InviteTeach, 'it_id');
            // console.log(idArray[i], maxTB ,maxInvite )
            let validateInvie = await InviteTeach.findOne({
                it_class_code: idArray[i],
                $and: [{ it_status: { $ne: 3 } }, { it_status: { $ne: 4 } }],
                hidden: { $ne: 0 },
            });
            let checkClass = await PostFindTutor.findOne({
                ugs_id: idGiaSu,
                pft_id: idArray[i],
                trangthai_lop: 2,
            });
            let getClass = await PostFindTutor.findOne({
                ugs_id: idGiaSu,
                pft_id: idArray[i],
            }).select(' pft_address pft_nb_lesson -_id');
            if (getClass) {
                let address = getClass.pft_address;
                let pft_nb_lesson = getClass.pft_nb_lesson;
                if (validateInvie) {
                    // đã đc được mời dạy hoặc đề nghị
                    if (validateInvie.type_invite_suggest == 0) {
                        // đc mời dạy rồi
                        if (validateInvie.hidden == 0) {
                            let updateInvite = await InviteTeach.updateOne({
                                ugs_parent: idGiaSu,
                                ugs_teach: ugs_teach,
                                it_class_code: idArray[i],
                            }, {
                                it_status: 1,
                                it_address: address,
                                as_id: pft_nb_lesson,
                                day_invitation_teach: Date.parse(today) / 1000,
                                hidden: 1,
                            });
                            let TB = new Notification({
                                noti_id: maxTB,
                                ugs_tutor: ugs_teach,
                                ugs_parent: idGiaSu,
                                pft_id: idArray[i],
                                type: 1,
                                noti_date: Date.parse(today) / 1000,
                            });
                            await TB.save();
                            check = 'Mời dạy thành công.';
                        } else {
                            if (validateInvie.it_status == 1) {
                                // gia sư được mời dạy nhưng chưa phản hồi
                                check = 'Bạn đã mời gia sư với dạy lớp này rồi, hãy đợi phản hồi.';
                            } else if (validateInvie.it_status == 2) {
                                //gia sư đồng ý dạy
                                check = 'Lớp này đang được gia sư này dạy rồi.';
                            } else if (validateInvie.it_status == 3 || validateInvie.it_status == 4) {
                                // gia sư từ chối lời mời dạy or kết thúc
                                let createInvite = new InviteTeach({
                                    it_id: maxInvite,
                                    it_address: address,
                                    ugs_teach: ugs_teach,
                                    ugs_parent: idGiaSu,
                                    it_class_code: idArray[i],
                                    day_invitation_teach: Date.parse(day_invitation_teach) / 1000,
                                    received_date: 0,
                                    it_status: it_status,
                                    received_date: 0,
                                    as_id: pft_nb_lesson,
                                });
                                await createInvite.save();
                                let TB = new Notification({
                                    noti_id: maxTB,
                                    ugs_tutor: ugs_teach,
                                    ugs_parent: idGiaSu,
                                    pft_id: idArray[i],
                                    type: 1,
                                    noti_date: Date.parse(today) / 1000,
                                });
                                await TB.save();
                                check = 'Mời dạy thành công - TH: gia sư từ chối lời mời dạy or kết thúc  ';
                            }
                        }
                    } else if (validateInvie.type_invite_suggest == 1) {
                        //đề nghị rồi
                        if (validateInvie.it_status == 1) {
                            //đề nghị trạng thái đã gửi
                            check = 'Gia sư này đã đề nghị dạy lớp rồi.';
                        } else if (validateInvie.it_status == 2) {
                            //đề nghị trạng thái đã đồng ý
                            check = 'Gia sư này đang dạy lớp rồi.';
                        } else if (validateInvie.it_status == 3 || validateInvie.it_status == 4) {
                            //đề nghị trạng thái từ chối và kết thúc
                            let createInvite = new InviteTeach({
                                it_id: maxInvite,
                                it_address: address,
                                ugs_teach: ugs_teach,
                                ugs_parent: idGiaSu,
                                it_class_code: idArray[i],
                                day_invitation_teach: Date.parse(day_invitation_teach) / 1000,
                                received_date: 0,
                                it_status: it_status,
                                received_date: 0,
                                as_id: pft_nb_lesson,
                            });
                            await createInvite.save();
                            let TB = new Notification({
                                noti_id: maxTB,
                                ugs_tutor: ugs_teach,
                                ugs_parent: idGiaSu,
                                pft_id: idArray[i],
                                type: 1,
                                noti_date: Date.parse(today) / 1000,
                            });
                            await TB.save();
                            check = 'Mời dạy thành công - TH: đề nghị trạng thái từ chối và kết thúc';
                        }
                    }
                } else {
                    // gia sư chưa được mời hoặc đề nghị
                    let createInvite = new InviteTeach({
                        it_id: maxInvite,
                        it_address: address,
                        ugs_teach: ugs_teach,
                        ugs_parent: idGiaSu,
                        it_class_code: idArray[i],
                        day_invitation_teach: Date.parse(day_invitation_teach) / 1000,
                        received_date: 0,
                        it_status: it_status,
                        received_date: 0,
                        type_invite_suggest: 0,
                        as_id: pft_nb_lesson,
                    });
                    await createInvite.save();
                    let TB = new Notification({
                        noti_id: maxTB,
                        ugs_tutor: ugs_teach,
                        ugs_parent: idGiaSu,
                        pft_id: idArray[i],
                        type: 1,
                        noti_date: Date.parse(today) / 1000,
                    });
                    await TB.save();
                    check = 'Mời dạy thành công - TH: gia sư chưa được mời hoặc đề nghị';
                }
            }
        }
        if (check === '') {
            return functions.success(res, 'đã gửi lời mời dạy');
        }
        return functions.success(res, '', { check, it_id: maxInvite });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.checkTittle = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        const title = req.body.title;
        if (title) {
            let checkTitle = await PostFindTutor.count({
                pft_summary: title,
                ugs_id: idGiaSu,
            });
            if (checkTitle == 0) {
                return functions.success(res, '');
            } else {
                return functions.setError(res, 'Title đã tồn tại');
            }
        }
        return functions.setError(res, 'Chưa nhập Title');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.confirmInvite = async (req, res) => {
    try {
        const ot_id = Number(req.body.ot_id);
        const today = new Date();
        let maxTB = await functions.getMaxIdByField(Notification, 'noti_id');
        let check = await InviteTeach.findOne({
            it_id: ot_id,
        });
        if (check) {
            let ugs_id = check.ugs_teach;
            let ugs_parent = check.ugs_parent;
            let pft_id = check.it_class_code;

            let changeOfferTeach = await InviteTeach.updateOne({
                it_id: ot_id,
            }, {
                it_status: 2,
                received_date: Date.parse(today) / 1000,
            });
            //cap nhat lop
            let updateClass = await PostFindTutor.updateOne({
                pft_id: pft_id,
            }, {
                trangthai_lop: 1,
            });
            //add thong bao
            let TB = new Notification({
                noti_id: maxTB,
                ugs_tutor: ugs_id,
                ugs_parent: ugs_parent,
                pft_id: pft_id,
                type: 5,
                noti_date: Date.parse(today) / 1000,
            });
            await TB.save();

            return functions.success(res, 'Bạn đã chấp nhận lời đề nghị của gia sư');
        }

        return functions.setError(res, 'không tìm thấy đề nghị mời dạy');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.refuseOffer = async (req, res) => {
    try {
        const ot_id = Number(req.body.ot_id);
        const today = new Date();
        let maxTB = await functions.getMaxIdByField(Notification, 'noti_id');
        let check = await InviteTeach.findOne({
            it_id: ot_id,
        });
        if (check) {
            let ugs_id = check.ugs_teach;
            let ugs_parent = check.ugs_parent;
            let pft_id = check.it_class_code;

            let changeOfferTeach = await InviteTeach.updateOne({
                it_id: ot_id,
            }, {
                it_status: 3,
                received_date: Date.parse(today) / 1000,
            });
            //add thong bao
            let TB = new Notification({
                noti_id: maxTB,
                ugs_tutor: ugs_id,
                ugs_parent: ugs_parent,
                pft_id: pft_id,
                type: 6,
                noti_date: Date.parse(today) / 1000,
            });
            await TB.save();

            return functions.success(res, 'Bạn đã từ chối lời đề nghị của gia sư');
        }

        return functions.setError(res, 'không tìm thấy đề nghị mời dạy');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.addComment = async (req, res) => {
    try {
        const teach_id = req.body.teach_id;
        const parent_id = req.body.parent_id;
        const comment_content = req.body.comment_content;
        const rate = req.body.rate;
        if (teach_id && parent_id) {
            let check = await GSCommentRate.findOne({
                gs_userteach_id: teach_id,
                gs_userparent_id: parent_id,
            }).select('comment_rate_id -_id');
            let cmt_id = 0;
            if (check) {
                cmt_id = check.comment_rate_id;
                await GSCommentRate.updateOne({
                    comment_rate_id: check.comment_rate_id,
                }, {
                    rate: Number(rate),
                    comment_content: comment_content,
                });
                return functions.success(res, 'cap nhat binh luan thành công', { cmt_id });
            } else {
                let max = (await GSCommentRate.findOne({}, { comment_rate_id: -1 }).lean()) || 0;
                let addcmt = new GSCommentRate({
                    comment_rate_id: Number(max.comment_rate_id) + 1 || 1,
                    gs_userteach_id: Number(teach_id),
                    gs_userparent_id: Number(parent_id),
                    rate: Number(rate),
                    comment_content: comment_content,
                });
                await addcmt.save();
                cmt_id = addcmt.comment_rate_id;
                return functions.success(res, 'binh luan thành công', { cmt_id });
            }
        }
        return functions.setError(res, 'Thiếu trường truyền lên');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.PointParent = async (req, res) => {
    try {
        const email = req.body.email;
        const type = req.body.type;
        const time = new Date();
        let formattedDate = time.toISOString().slice(0, 10); //xử lí chuyển ngày thành string "2023-10-27"
        let newDate = new Date(formattedDate);
        let yesterday = newDate.setDate(newDate.getDate() - 1); // lấy ngày hôm trước ở dạng number
        let NewYesterday = new Date(yesterday).toISOString().slice(0, 10); // xử lý cắt chuỗi lấy ngày
        // let check = await Users.findOne({email : email , "inforGiaSu.ugs_ft": 2 })
        let check = await Users.findOne({
            $or: [{ phoneTK: email }, { email: email }],
            'inforGiaSu.ugs_ft': 2,
        }).lean();
        if (check) {
            let time_present = check.inforGiaSu.time_present || NewYesterday; // nếu đăng kí mới thì cho qua để có time_present để so sánh vào lần đăng nhập sau

            if (formattedDate != time_present && formattedDate > time_present) {
                await Users.updateOne({
                    $or: [{ phoneTK: email }, { email: email }],
                    'inforGiaSu.ugs_ft': 2,
                }, {
                    'inforGiaSu.point_free': 5,
                    'inforGiaSu.time_present': formattedDate,
                });
                return functions.success(res, 'Bạn đã được cộng 5 điểm cho ngày đăng nhập hôm nay.');
            }
            return functions.setError(res, 'Ngày hôm nay bạn đã đăng nhập, bạn không cộng điểm');
        }
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.UpdatePointParent = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        const point_free_ph = req.body.point_free_ph;
        const point_buy_ph = req.body.point_buy_ph;
        const id_teach = Number(req.body.id_teach);
        if (id_teach) {
            const today = functions.getTimeNow();

            const [checkParent, checkTeach, maxTB, maxSeen] = await Promise.all([
                Users.findOne({
                    idGiaSu: idGiaSu,
                    'inforGiaSu.ugs_ft': 2,
                }).lean(),
                Users.findOne({
                    idGiaSu: Number(id_teach),
                    'inforGiaSu.ugs_ft': 1,
                }).lean(),
                functions.getMaxIdByField(Notification, 'noti_id'),
                functions.getMaxIdByField(SeeUser, 'su_id'),
            ]);
            let total = 0;
            if (!checkTeach) {
                return functions.setError(res, 'Nhập user cho chuẩn vào, không tìm thấy :)');
            }
            if (checkParent)
                total = checkParent.inforGiaSu.point_free ?
                    checkParent.inforGiaSu.point_free :
                    0 + checkParent.inforGiaSu.point_buy !== 'null' ?
                        checkParent.inforGiaSu.point_buy :
                        0;
            console.log(total);
            if (total > 0) {
                if (checkParent.inforGiaSu.point_free > 0) {
                    // cap nhat diem tru 1 cho PH
                    const newPoint = checkParent.inforGiaSu.point_free - 1;
                    const newView = checkParent.inforGiaSu.ugs_view + 1;
                    await Promise.all([
                        Users.updateOne({
                            idGiaSu: idGiaSu,
                            'inforGiaSu.ugs_ft': 2,
                        }, {
                            'inforGiaSu.point_free': newPoint,
                        }),
                        Users.updateOne({
                            idGiaSu: Number(id_teach),
                            'inforGiaSu.ugs_ft': 1,
                        }, {
                            'inforGiaSu.ugs_view': newView,
                        }),
                    ]);
                    //ktra bang da xem
                    const check_daxem = await SeeUser.findOne({
                        ugs_parent: idGiaSu,
                        ugs_teach: id_teach,
                    }).lean();
                    if (!check_daxem) {
                        // neu khong có insert
                        let insert = new SeeUser({
                            su_id: maxSeen,
                            ugs_parent: idGiaSu,
                            ugs_teach: id_teach,
                            su_today: today,
                            su_status: 1,
                            type: 1,
                        });
                        await insert.save();
                    } else {
                        // có cập nhật
                        await SeeUser.updateOne({
                            su_id: check_daxem.su_id,
                        }, {
                            su_status: 1,
                            type: 1,
                            su_today: today,
                        });
                    }
                    //add thong bao
                    let TB = new Notification({
                        noti_id: maxTB,
                        ugs_tutor: id_teach,
                        ugs_parent: idGiaSu,
                        pft_id: '',
                        type: 7,
                        noti_date: today,
                    });
                    await TB.save();
                    return functions.success(res, 'Trừ điểm miễn phí thành công');
                } else if (checkParent.inforGiaSu.point_buy > 0) {
                    // cap nhat diem tru 1 cho PH
                    const newPoint = checkParent.inforGiaSu.point_buy - 1;
                    const newView = checkParent.inforGiaSu.ugs_view + 1;
                    await Promise.all([
                        Users.updateOne({
                            idGiaSu: idGiaSu,
                            'inforGiaSu.ugs_ft': 2,
                        }, {
                            'inforGiaSu.point_buy': newPoint,
                        }),
                        Users.updateOne({
                            idGiaSu: Number(id_teach),
                            'inforGiaSu.ugs_ft': 1,
                        }, {
                            'inforGiaSu.ugs_view': newView,
                        }),
                    ]);
                    //ktra bang da xem
                    const check_daxem = await SeeUser.findOne({
                        ugs_parent: idGiaSu,
                        ugs_teach: id_teach,
                    }).lean();
                    if (!check_daxem) {
                        // neu khong có insert
                        let insert = new SeeUser({
                            su_id: maxSeen,
                            ugs_parent: idGiaSu,
                            ugs_teach: id_teach,
                            su_today: today,
                            su_status: 2,
                            type: 1,
                        });
                        await insert.save();
                    } else {
                        // có cập nhật
                        await SeeUser.updateOne({
                            su_id: check_daxem.su_id,
                        }, {
                            su_status: 2,
                            type: 1,
                            su_today: today,
                        });
                    }
                    //add thong bao
                    let TB = new Notification({
                        noti_id: maxTB,
                        ugs_tutor: id_teach,
                        ugs_parent: idGiaSu,
                        pft_id: '',
                        type: 7,
                        noti_date: today,
                    });
                    await TB.save();
                    return functions.success(res, 'Trừ điểm mất phí thành công');
                }
            }
            return functions.setError(res, 'Hết điểm , khỏi xem');
        }
        return functions.setError(res, 'Nhập thiếu trường');
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.listCity = async (req, res) => {
    try {
        const name_city = req.body.name_city;
        const id_city = req.body.id_city;
        let cond = {};
        if (name_city) cond.name = { $regex: name_city, $options: 'i' };
        if (id_city) cond._id = Number(id_city);
        let list = await City.find(cond).select('name _id');
        return functions.success(res, 'lấy thành công', { list });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.listDistrict = async (req, res) => {
    try {
        const name_District = req.body.name_District;
        const id_District = req.body.id_District;
        const id_city = req.body.id_city;
        let cond = {};
        if (name_District) cond.name = { $regex: name_District, $options: 'i' };
        if (id_District) cond._id = Number(id_District);
        if (id_city) cond.parent = Number(id_city);
        let list = await District.find(cond).select('name _id');
        return functions.success(res, 'lấy thành công', { list });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.listClassTeach = async (req, res) => {
    try {
        const nameClass = req.body.nameClass;
        const id_class = req.body.id_class;
        let cond = {};
        if (nameClass) cond.ct_name = { $regex: nameClass, $options: 'i' };
        if (id_class) cond.ct_id = Number(id_class);
        let list = await ClassTeach.find(cond).select('ct_id ct_name ls_parent');
        return functions.success(res, 'lấy thành công', { list });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.listAllSubject = async (req, res) => {
    try {
        const nameSubject = req.body.nameSubject;
        const id_Subject = req.body.id_Subject;
        let cond = {};
        if (nameSubject) cond.as_name = { $regex: nameSubject, $options: 'i' };
        if (id_Subject) cond.as_id = Number(id_Subject);
        let list = await AllSubject.find(cond).select(
            'as_id as_name as_alias as_parent ls_parent1 ls_parent2 active_class active_teach'
        );
        return functions.success(res, 'lấy thành công', { list });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};
exports.listLeverClass = async (req, res) => {
    try {
        const nameleverClass = req.body.nameleverClass;
        const id_lever_class = req.body.id_lever_class;
        let cond = {};
        if (nameleverClass) cond.level_class_name = { $regex: nameleverClass, $options: 'i' };
        if (id_lever_class) cond.level_class_id = Number(id_lever_class);
        let list = await GSLevelClass.find(cond).select(
            'level_class_id level_class_name slug_class_name level_parent_id'
        );
        return functions.success(res, 'lấy thành công', { list });
    } catch (e) {
        console.log(e);
        return functions.setError(res, e.message);
    }
};

exports.detail = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let pft_id = req.body.id_lop;
        let listConditions = {};
        if (!pft_id) {
            return functions.setError(res, 'vui long dien id_lop');
        }
        listConditions.ugs_id = idGiaSu;
        listConditions.pft_id = Number(pft_id);
        let user = await PostFindTutor.aggregate([
            // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
            { $match: listConditions },
            {
                $lookup: {
                    from: 'City',
                    localField: 'city_id',
                    foreignField: '_id',
                    as: 'city',
                },
            },
            { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'District',
                    localField: 'city_detail',
                    foreignField: '_id',
                    as: 'district',
                },
            },
            { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'GS_all_subject',
                    localField: 'as_id',
                    foreignField: 'as_id',
                    as: 'infoSubject',
                },
            },
            { $unwind: { path: '$infoSubject', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'ugs_id',
                    foreignField: 'idGiaSu',
                    as: 'infoUsers',
                },
            },
            { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userName: '$infoUsers.userName',
                    emailContact: '$infoUsers.emailContact',
                    phone: '$infoUsers.phone',
                    avatarUser: '$infoUsers.avatarUser',
                    district: '$district.name',
                    city: '$city.name',
                    ten_mon_hoc: '$infoSubject.as_name',

                    id_lop: '$pft_id',
                    title: '$pft_summary',
                    id_mon_hoc: '$as_id',
                    chi_tiet_mon_hoc: '$as_detail',
                    classTearch_id: '$ct_id',
                    pft_form: '$pft_form',
                    pft_time: '$pft_time',
                    pft_nb_student: '$pft_nb_student',
                    pft_nb_lesson: '$pft_nb_lesson',
                    pft_gender: '$pft_gender',
                    tutor_style: '$tutor_style',
                    phi_nhan_lop: '$pft_price',
                    pft_school_day: '$pft_school_day',
                    pft_phone: '$pft_phone',
                    pft_address: '$pft_address',
                    pft_detail: '$pft_detail',
                    pft_price_type: '$pft_price_type',
                    pft_month: '$pft_month',
                    pft_view: '$pft_view',
                    pft_status: '$pft_status',
                    active: '$active',
                    trangthai_lop: '$trangthai_lop',
                    day_post: '$day_post',
                    day_update: '$day_update',
                },
            },
        ]);
        if (user.length > 0) {
            const data = user[0];
            data.avatarUser = await fnc.createLinkFile('PH', data.updatedAt, data.avatarUser);
            data.pft_time = new Date(data.pft_time * 1000);
            // xử lý trạng thái
            if (data.pft_form == 1) data.Hinhthucday = 'Gặp mặt';
            else data.Hinhthucday = 'Online';
            data.day_post = new Date(data.day_post * 1000);
            data.day_update = new Date(data.day_update * 1000);
            let schedule = await TeachingSchedule.findOne({ pft_id: pft_id });
            return functions.success(res, 'lấy thành công', { data, schedule });
        }
        return functions.setError(res, 'không tìm thấy phụ huynh');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
exports.listClass = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let pft_id = req.body.id_lop;
        let findByName = req.body.findByName;
        let findByIDCity = req.body.findByIDCity;
        let findByIDSubject = req.body.findByIDSubject;
        let sorts = req.body.sorts;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listConditions = {};
        let sort = {};
        let cond2 = {};
        let cond3 = {};
        if (!sorts) {
            sort.day_post = -1;
        } else if (sorts == 1) {
            sort.pft_view = -1;
        } else if (sorts == 2) {
            sort.day_post = -1;
        }
        // listConditions.ugs_id = idGiaSu
        listConditions.active = 1;
        // cond2["PhuHuynh"] = 0
        // cond2["infoSubject.as_parent"] = 0
        listConditions['$or'] = [{ trangthai_lop: 0 }, { trangthai_lop: 1 }];
        //tìm theo id lớp học
        if (pft_id) listConditions.pft_id = Number(pft_id);

        //tìm theo tên lớp học
        if (findByName) listConditions['pft_summary'] = { $regex: findByName, $options: 'i' };

        //tìm theo id thànnh phố
        if (findByIDCity) listConditions['city_id'] = Number(findByIDCity);

        //tìm theo id môn học (all subject)
        if (findByIDSubject) listConditions['as_id'] = Number(findByIDSubject);

        //tìm theo id môn học (all subject)
        if (findByIDSubject) listConditions['as_id'] = Number(findByIDSubject);
        let result = await PostFindTutor.aggregate([
            // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
            { $match: listConditions },
            { $sort: sort },
            {
                $lookup: {
                    from: 'GS_all_subject',
                    localField: 'as_id',
                    foreignField: 'as_id',
                    as: 'infoSubject',
                },
            },
            { $unwind: { path: '$infoSubject', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'City',
                    localField: 'city_id',
                    foreignField: '_id',
                    as: 'city',
                },
            },
            { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'ugs_id',
                    foreignField: 'idGiaSu',
                    as: 'infoUsers',
                },
            },
            { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    ugs_id: 1,
                    id_lop: '$pft_id',
                    title: '$pft_summary',
                    alias: 1,
                    id_mon_hoc: '$as_id',
                    pft_form: '$pft_form',
                    phi_nhan_lop: '$pft_price',
                    pft_price_type: '$pft_price_type',
                    pft_month: '$pft_month',
                    city_id: 1,
                    pft_detail: '$pft_detail',
                    pft_status: '$pft_status',

                    id_mon_hoc: '$infoSubject.as_id',
                    ten_mon_hoc: '$infoSubject.as_name',
                    PhuHuynh: '$infoSubject.as_parent',

                    city: '$city.name',

                    userName: '$infoUsers.userName',
                    idPhuHuynh: '$infoUsers.idGiaSu',
                    avatarUser: '$infoUsers.avatarUser',
                    ngay_tao: '$infoUsers.updatedAt',
                    emailContact: '$infoUsers.emailContact',
                    phone: '$infoUsers.phone',
                },
            },
            // { $match: cond2 },

            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{
                        $count: 'count',
                    },],
                },
            },
        ]);
        let data = {};
        let totalCount = {};
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            totalCount = result[0].totalCount[0].count;
            for (let i = 0; i < data.length; i++) {
                //ghép link avatar
                data[i].avatarUser = await fnc.createLinkFile('PH', data[i].updatedAt, data[i].avatarUser);
                // chuyển đổi dạng date
                data[i].ngay_tao = new Date(data[i].ngay_tao * 1000);
                // xử lý trạng thái
                if (data[i].pft_form == 1) data[i].Hinhthucday = 'Gặp mặt';
                else data[i].Hinhthucday = 'Online';
            }
        }
        return functions.success(res, 'lấy thành công', { data, totalCount });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listInviteTeach = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let type = req.body.type;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listConditions = {};
        listConditions.ugs_parent = idGiaSu;
        if (type == 1) {
            //1 ds gia sư đã mời
            listConditions.type_invite_suggest = 0;
            listConditions.hidden = 1;
        } else if (type == 3) {
            //2 ds gia sư đã đề nghị dạy
            listConditions['$or'] = [{ it_status: 2 }, { it_status: 4 }];
        } else if (type == 2) {
            //3 danh sach gia su dang day
            listConditions.type_invite_suggest = 1;
            listConditions.it_status = 1;
        } else {
            listConditions.type_invite_suggest = 0;
            listConditions.hidden = 1;
        }

        let result = await InviteTeach.aggregate([
            // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
            { $match: listConditions },
            { $sort: { it_id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'GS_post_find_tutor',
                    localField: 'it_class_code',
                    foreignField: 'pft_id',
                    as: 'infoClass',
                },
            },
            { $unwind: { path: '$infoClass', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'ugs_teach',
                    foreignField: 'idGiaSu',
                    as: 'infoUsers',
                },
            },
            { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    it_id: 1,
                    ugs_parent: 1,
                    title: '$infoClass.pft_summary',
                    pft_price: '$infoClass.pft_price',
                    pft_price_type: '$infoClass.pft_price_type',
                    pft_month: '$infoClass.pft_month',
                    trangthai_lop: '$infoClass.trangthai_lop',
                    as_id: '$infoClass.as_id',
                    ugs_teach: 1,
                    it_class_code: 1,
                    it_address: 1,
                    it_status: 1,
                    IdTeach: '$infoUsers.idGiaSu',
                    userNameTeach: '$infoUsers.userName',
                    id_lop: '$infoClass.pft_id',
                    alias: '$infoClass.alias',
                    pft_form: '$infoClass.pft_form',
                    pft_school_day: '$infoClass.pft_school_day',
                    day_invitation_teach: 1,
                    addressTeach: '$infoUsers.address',
                    it_class_code: 1,
                },
            },
            // { $match: cond2 },

            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{
                        $count: 'count',
                    },],
                },
            },
        ]);
        let data = {};
        let totalCount = 0;
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            totalCount = result[0].totalCount[0].count;
            for (let i = 0; i < data.length; i++) {
                // chuyển đổi dạng date
                data[i].day_invitation_teach = new Date(data[i].day_invitation_teach * 1000);
            }
        }
        return functions.success(res, 'lấy thành công', { data, totalCount });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

// exports.listPoint = async(req, res ) =>{
//     try {
//         let idGiaSu = req.user.data.idGiaSu;
//         let page = Number(req.body.page)|| 1;
//         let pageSize = Number(req.body.pageSize)|| 10;
//         const skip = (page - 1) * pageSize;
//         const limit = pageSize;
//         let listConditions = {};
//         listConditions.ugs_parent = idGiaSu
//         listConditions.type = 1

//         let result = await SeeUser.aggregate([
//             // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
//             { $match: listConditions },
//             { $sort: {su_id : -1} },
//             { $skip : skip},
//             { $limit : limit},
//             {$lookup : {
//                 from : "Users",
//                 localField : "ugs_teach",
//                 foreignField : "idGiaSu",
//                 as : "infoUsers"
//             }},
//             {$unwind : {path : "$infoUsers" , preserveNullAndEmptyArrays : true} },
//             {$project : {
//                 su_id : 1,
//                 ugs_parent : 1,
//                 ugs_teach : 1,
//                 su_today : 1,
//                 "IdTeach" : "$infoUsers.idGiaSu" ,
//                 "userNameTeach" : "$infoUsers.userName" ,
//                 "addressTeach" : "$infoUsers.address" ,
//                 su_status : 1,
//             }},
//             {
//                 $facet: {
//                   paginatedResults: [{ $skip: skip }, { $limit: limit }],
//                   totalCount: [
//                     {
//                       $count: 'count'
//                     }
//                   ]
//                 }
//               }

//         ])
//         if(result[0].totalCount.length > 0){
//             const data = result[0].paginatedResults;
//             const totalCount = result[0].totalCount[0].count;
//             for (let i = 0; i < data.length; i++) {;
//                 // chuyển đổi dạng date
//                 data[i].su_today = new Date(data[i].su_today * 1000)
//             }
//             return functions.success(res , "lấy thành công" ,{data, totalCount})
//         }
//         return functions.setError(res, "khong tim thay du lieu")
//     } catch (error) {
//         console.log(error)
//         return functions.setError(res, error.message)
//     }
// }

exports.listPoint = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listConditions = {};
        listConditions.st_pr_id = idGiaSu;
        let result = await SaveTeach.aggregate([
            // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
            { $match: listConditions },
            { $sort: { su_id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'Users',
                    localField: 'ugs_teach',
                    foreignField: 'idGiaSu',
                    as: 'infoUsers',
                },
            },
            { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    su_id: 1,
                    ugs_teach: 1,
                    st_lesson: 1,
                    st_form: 1,
                    IdTeach: '$infoUsers.idGiaSu',
                    userNameTeach: '$infoUsers.userName',
                    ugs_address: '$infoUsers.address',
                    as_id: '$infoUsers.as_id',
                },
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{
                        $count: 'count',
                    },],
                },
            },
        ]);
        let data = {};
        let totalCount = 0;
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            totalCount = result[0].totalCount[0].count;
            for (let i = 0; i < data.length; i++) {
                // chuyển đổi dạng date
                data[i].su_today = new Date(data[i].su_today * 1000);
            }
        }
        return functions.success(res, 'lấy thành công', { data, totalCount });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

exports.listSaved = async (req, res) => {
    try {
        let idGiaSu = req.user.data.idGiaSu;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        let listConditions = {};
        listConditions.st_pr_id = idGiaSu;
        if (idGiaSu) {
            let result = await SaveTeach.aggregate([
                // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
                { $match: listConditions },
                { $sort: { su_id: -1 } },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'ugs_teach',
                        foreignField: 'idGiaSu',
                        as: 'infoUsers',
                    },
                },
                { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        su_id: 1,
                        ugs_teach: 1,
                        st_lesson: 1,
                        st_form: 1,
                        IdTeach: '$infoUsers.idGiaSu',
                        userNameTeach: '$infoUsers.userName',
                        ugs_address: '$infoUsers.address',
                        as_id: '$infoUsers.as_id',
                    },
                },
                {
                    $facet: {
                        paginatedResults: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{
                            $count: 'count',
                        },],
                    },
                },
            ]);
            let data = {};
            let totalCount = 0;
            if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                // for (let i = 0; i < data.length; i++) {;
                //     // chuyển đổi dạng date
                //     data[i].su_today = new Date(data[i].su_today * 1000)
                // }
            }
            return functions.success(res, 'lấy thành công', { data, totalCount });
        }
        return functions.setError(res, 'khong tim thay nguoi dung');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
exports.QLCParent = async (req, res) => {
    try {
        const idGiaSu = req.user.data.idGiaSu;
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        if (idGiaSu) {
            let listConditions = {};
            listConditions.st_pr_id = idGiaSu;
            let [countPost, countSaved, countViews, countInvite, result] = await Promise.all([
                //Tin đã đăng
                PostFindTutor.countDocuments({ ugs_id: idGiaSu }),
                //Gia sư đã lưu
                SaveTeach.countDocuments({ st_pr_id: idGiaSu }),
                //Lượt xem hồ sơ
                Users.findOne({ idGiaSu: idGiaSu, 'inforGiaSu.ugs_ft': 2 }).select('inforGiaSu.ugs_view -_id').lean(),
                //Gia sư mời dạy
                InviteTeach.countDocuments({ ugs_parent: idGiaSu, type_invite_suggest: 0 }),
                InviteTeach.aggregate([
                    { $match: { ugs_parent: idGiaSu, type_invite_suggest: 0, hidden: 1 } },
                    { $sort: { su_id: -1 } },
                    {
                        $lookup: {
                            from: 'Users',
                            localField: 'ugs_teach',
                            foreignField: 'idGiaSu',
                            as: 'infoUsers',
                        },
                    },
                    { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },

                    {
                        $lookup: {
                            from: 'GS_post_find_tutor',
                            localField: 'it_class_code',
                            foreignField: 'pft_id',
                            as: 'post',
                        },
                    },
                    { $unwind: { path: '$post', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            su_id: 1,

                            IdTeach: '$infoUsers.idGiaSu',
                            userNameTeach: '$infoUsers.userName',
                            ugs_teach: 1,
                            pft_summary: '$post.pft_summary',
                            it_class_code: 1,
                            alias: '$post.alias',
                            ugs_address: '$infoUsers.address',
                            pft_form: '$post.pft_form',
                            day_invitation_teach: 1,
                            as_id: '$infoUsers.as_id',
                        },
                    },
                    {
                        $facet: {
                            paginatedResults: [{ $skip: skip }, { $limit: limit }],
                            totalCount: [{
                                $count: 'count',
                            },],
                        },
                    },
                ]),
            ]);
            // let result1 = await SaveTeach.aggregate([
            //     // {$match : {ugs_id : idGiaSu , pft_id: pft_id }},
            //     { $match: listConditions },
            //     { $sort: {su_id : -1} },
            //     {$lookup : {
            //         from : "Users",
            //         localField : "ugs_teach",
            //         foreignField : "idGiaSu",
            //         as : "infoUsers"
            //     }},
            //     {$unwind : {path : "$infoUsers" , preserveNullAndEmptyArrays : true} },
            //     {$project : {
            //         su_id : 1,
            //         ugs_teach : 1,
            //         st_lesson : 1,
            //         st_form : 1,
            //         "IdTeach" : "$infoUsers.idGiaSu" ,
            //         "userNameTeach" : "$infoUsers.userName" ,
            //         "ugs_address" : "$infoUsers.address" ,
            //         "as_id" : "$infoUsers.as_id" ,
            //     }},
            //     {
            //         $facet: {
            //           paginatedResults: [{ $skip: skip }, { $limit: limit }],
            //           totalCount: [
            //             {
            //               $count: 'count'
            //             }
            //           ]
            //         }
            //       }
            // ])
            let data = {};
            let totalCount = 0;
            if (countViews) countViews = countViews.inforGiaSu.ugs_view ? countViews.inforGiaSu.ugs_view : 0;
            if (result[0].totalCount.length > 0) {
                data = result[0].paginatedResults;
                totalCount = result[0].totalCount[0].count;
                for (let i = 0; i < data.length; i++) {
                    // chuyển đổi dạng date
                    data[i].day_invitation_teach = new Date(data[i].day_invitation_teach * 1000);
                }
            }
            return functions.success(res, 'lấy thành công', {
                countPost,
                countSaved,
                countViews,
                countInvite,
                data,
                totalCount,
            });
        }
        return functions.setError(res, 'khong tim thay nguoi dung');
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};
//danh sách dành cho phu huynh
exports.homePagefilterTeach = async (req, res) => {
    try {
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const lesson = req.body.lesson ? JSON.parse(req.body.lesson) : null;
        const cls = req.body.cls ? JSON.parse(req.body.cls) : null;
        const city = req.body.city ? JSON.parse(req.body.city) : null;
        const loc = req.body.loc;

        let listConditions = { 'inforGiaSu.ugs_ft': 1, 'inforGiaSu.is_hide': 0 };
        if (lesson) listConditions = { 'inforGiaSu.as_id': { $in: lesson }, ...listConditions };
        if (cls) listConditions = { 'inforGiaSu.ugs_class_teach': { $in: cls }, ...listConditions };
        if (city) listConditions = { city: { $in: city }, ...listConditions };
        let sort = {};
        // lọc theo "Gần nhất" cũng là trạng thái mặc định
        sort['updatedAt'] = -1;
        sort['idGiaSu'] = -1;
        // lọc theo "Xem nhiều" và "Hàng đầu"
        if (loc) sort['inforGiaSu.ugs_view'] = -1;
        let [result, listSubject, listClass, listCity] = await Promise.all([
            Users.aggregate([
                { $match: listConditions },
                { $sort: sort },
                {
                    $lookup: {
                        from: 'GS_user_teach_information',
                        localField: 'idGiaSu',
                        foreignField: 'ugs_id',
                        as: 'infoTeach',
                    },
                },
                { $unwind: { path: '$infoTeach', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'GS_all_subject',
                        localField: 'inforGiaSu.as_id',
                        foreignField: 'as_id',
                        as: 'SJ',
                    },
                },
                { $unwind: { path: '$SJ', preserveNullAndEmptyArrays: true } },
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
                        from: 'GS_class_teach',
                        localField: 'inforGiaSu.ugs_class_teach',
                        foreignField: 'ct_id',
                        as: 'classteach',
                    },
                },
                { $unwind: { path: '$classteach', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        ugs_id: '$idGiaSu',
                        ugs_name: '$userName',
                        ugs_avatar: '$avatarUser',
                        ugs_address: '$address',
                        updatedAt: '$updatedAt',
                        ugs_about_us: '$inforGiaSu.ugs_about_us',
                        ugs_city: '$city.name',
                        as_id: '$inforGiaSu.as_id',
                        as_detail: '$inforGiaSu.as_detail',
                        ugs_class_teach: '$inforGiaSu.ugs_class_teach',
                        ugs_view: '$inforGiaSu.ugs_view',
                        ugs_ft: '$inforGiaSu.ugs_ft',
                        active: '$inforGiaSu.active',
                        ugs_day_now: '$inforGiaSu.ugs_day_now',
                        ugs_time: '$infoTeach.ugs_time',
                        ugs_salary: '$infoTeach.ugs_salary',
                        ugs_unit_price: '$infoTeach.ugs_unit_price',
                        ugs_month: '$infoTeach.ugs_month',
                        as_name: '$SJ.as_name',
                        cit_id: '$city._id',
                        ct_name: '$city.name',
                        saved: 'lưu',
                    },
                },
                {
                    $facet: {
                        paginatedResults: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{
                            $count: 'count',
                        },],
                    },
                },
            ]),
            AllSubject.aggregate([{
                $lookup: {
                    from: 'GS_post_find_tutor',
                    localField: 'as_id',
                    foreignField: 'as_id',
                    as: 'post',
                },
            },
            {
                $group: {
                    _id: '$as_id',
                    Name: { $first: '$as_name' },
                    Count: { $sum: { $size: '$post' } },
                },
            },
            { $sort: { Count: -1 } },
            ]),
            ClassTeach.aggregate([{
                $lookup: {
                    from: 'GS_post_find_tutor',
                    localField: 'ct_id',
                    foreignField: 'ct_id',
                    as: 'post',
                },
            },
            {
                $group: {
                    _id: '$ct_id',
                    Name: { $first: '$ct_name' },
                    Count: { $sum: { $size: '$post' } },
                },
            },
            { $sort: { Count: -1 } },
            ]),
            City.aggregate([{
                $lookup: {
                    from: 'GS_post_find_tutor',
                    localField: '_id',
                    foreignField: 'city_id',
                    as: 'post',
                },
            },
            {
                $group: {
                    _id: '_id',
                    Name: { $first: '$name' },
                    Count: { $sum: { $size: '$post' } },
                },
            },
            { $sort: { Count: -1 } },
            ]),
        ]);
        let data = {};
        let totalCount = 0;
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            totalCount = result[0].totalCount[0].count;
            await Promise.all(
                data.map(async (element) => {
                    // chuyển đổi dạng date
                    // element.day_invitation_teach = new Date(element.day_invitation_teach * 1000)
                    //xử lí cộng chuỗi tiền
                    //thời điểm viết api này chưa ghép chức năng gia chưa check được
                    //xử lí ghép link avatar
                    element.ugs_avatar = await fnc.createLinkFile('GS', element.updatedAt, element.ugs_avatar);
                    const user = await functions.getTokenUser(req, res);
                    // Xử lý luồng người dùng đăng nhập
                    if (user) {
                        const idParent = user.idGiaSu; // id PH
                        //xử lí check lưu Gia su
                        let check = await SaveTeach.findOne({
                            st_pr_id: idParent, //id phu huynh - idParent
                            ugs_teach: element.ugs_id,
                        }).lean();
                        if (check) element.saved = 'Đã lưu';
                    }
                })
            );
        }
        return functions.success(res, 'lấy thành công', { data, totalCount, listSubject, listClass, listCity });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

//danh sách dành cho gia sư
exports.homePagefilterPost = async (req, res) => {
    try {
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const lesson = req.body.lesson ? JSON.parse(req.body.lesson) : null;
        const cls = req.body.cls ? JSON.parse(req.body.cls) : null;
        const city = req.body.city ? JSON.parse(req.body.city) : null;
        const loc = req.body.loc;

        let listConditions = {
            active: 1,
            $or: [{ trangthai_lop: 0 }, { trangthai_lop: 1 }],
        };
        if (lesson) listConditions = { as_id: { $in: lesson }, ...listConditions };
        if (cls) listConditions = { 'inforGiaSu.ugs_class_teach': { $in: cls }, ...listConditions };
        if (city) listConditions = { city: { $in: city }, ...listConditions };
        let sort = {};
        // lọc theo "Gần nhất" cũng là trạng thái mặc định
        sort['day_update'] = -1;
        // lọc theo "Xem nhiều" và "Hàng đầu"
        if (loc == 2) sort['pft_view'] = -1;
        if (loc == 3) sort['pft_view'] = { $gt: 10 };
        let [result, listChild, listSubject] = await Promise.all([
            PostFindTutor.aggregate([
                { $match: listConditions },

                { $sort: sort },

                {
                    $lookup: {
                        from: 'GS_all_subject',
                        localField: 'as_id',
                        foreignField: 'as_id',
                        as: 'infoSubject',
                    },
                },
                { $unwind: { path: '$infoSubject', preserveNullAndEmptyArrays: true } },

                // { $match: { "infoSubject.as_parent" : 0 } },

                {
                    $lookup: {
                        from: 'City',
                        localField: 'city_id',
                        foreignField: '_id',
                        as: 'city',
                    },
                },
                { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'Users',
                        localField: 'ugs_id',
                        foreignField: 'idGiaSu',
                        as: 'infoUsers',
                    },
                },
                { $unwind: { path: '$infoUsers', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        pft_id: 1,
                        ugs_id: 1,
                        title: '$pft_summary',
                        alias: 1,
                        id_mon_hoc: '$as_id',
                        pft_form: '$pft_form', //Trạng thái: Gặp mặt hay online
                        id_lop: '$pft_id',
                        phi_nhan_lop: '$pft_price',
                        pft_price_type: '$pft_price_type',
                        pft_month: '$pft_month',
                        city_id: 1,
                        pft_detail: '$pft_detail',
                        pft_status: '$pft_status',

                        id_mon_hoc: '$infoSubject.as_id',
                        ten_mon_hoc: '$infoSubject.as_name',
                        PhuHuynh: '$infoSubject.as_parent',

                        city: '$city.name',
                        updatedAt: '$infoUsers.updatedAt',
                        userName: '$infoUsers.userName',
                        idPhuHuynh: '$infoUsers.idGiaSu',
                        avatarUser: '$infoUsers.avatarUser',
                        emailContact: '$infoUsers.emailContact',
                        phone: '$infoUsers.phone',
                        ugs_day_now: '$infoUsers.inforGiaSu.ugs_day_now',
                        saved: 'lưu',
                    },
                },
                // { $match: cond2 },

                {
                    $facet: {
                        paginatedResults: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{
                            $count: 'count',
                        },],
                    },
                },
            ]),
            PostFindTutor.aggregate([
                { $sort: { pft_view: -1 } },
                // { $skip: 0 },
                { $limit: 4 },
                // {$lookup : {
                //     from : "Users",
                //     localField : "ugs_id",
                //     foreignField : "idGiaSu",
                //     as : "infoUsers"
                // }},
                // { $unwind : {path : "$infoUsers" , preserveNullAndEmptyArrays : true} },
                {
                    $project: {
                        pft_id: 1,
                        ugs_id: 1,
                        title: '$pft_summary',
                        alias: 1,
                        id_mon_hoc: '$as_id',
                        pft_form: '$pft_form', //Trạng thái: Gặp mặt hay online
                        id_lop: '$pft_id',
                        phi_nhan_lop: '$pft_price',
                        pft_price_type: '$pft_price_type',
                        pft_month: '$pft_month',
                        city_id: 1,
                        pft_detail: '$pft_detail',
                        pft_status: '$pft_status',
                        //     "userName" : "$infoUsers.userName" ,
                        //     "idPhuHuynh" : "$infoUsers.idGiaSu" ,
                        //     "avatarUser" : "$infoUsers.avatarUser" ,
                        //     "emailContact" : "$infoUsers.emailContact" ,
                        //     "phone" : "$infoUsers.phone" ,
                        //     "ugs_day_now" : "$infoUsers.inforGiaSu.ugs_day_now" ,
                        //     "updatedAt" : "$infoUsers.updatedAt" ,
                        saved: 'lưu',
                    },
                },
            ]),
            AllSubject.aggregate([{
                $lookup: {
                    from: 'GS_post_find_tutor',
                    localField: 'as_id',
                    foreignField: 'as_id',
                    as: 'post',
                },
            },
            {
                $group: {
                    _id: '$as_id',
                    Name: { $first: '$as_name' },
                    Count: { $sum: { $size: '$post' } },
                },
            },
            { $sort: { Count: -1 } },
            ]),
        ]);

        let data = {};
        let dataChild = {};
        let totalCount = 0;
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            totalCount = result[0].totalCount[0].count;
            await Promise.all(
                data.map(async (element) => {
                    // chuyển đổi dạng date
                    element.ngay_tao = new Date(element.ngay_tao * 1000);
                    // xử lí ghép link avatar
                    element.avatarUser = fnc.createLinkFile('PH', element.updatedAt, element.avatarUser);
                    // xử lý trạng thái
                    if (element.pft_form == 1) element.TrangThai = 'Gặp mặt';
                    else element.TrangThai = 'Online';
                    // xử lý đếm số đề nghị dạy
                    element.NumInvite = await InviteTeach.countDocuments({
                        type_invite_suggest: 1,
                        it_status: 1,
                        it_class_code: Number(element.pft_id),
                    });
                    // Xử lý luồng người dùng đăng nhập
                    const user = await functions.getTokenUser(req, res);
                    if (user) {
                        const idTeach = user.idGiaSu; // id GS
                        //xử lí check lưu tin
                        let check = await SaveCourse.findOne({
                            ugs_teach: idTeach, //id gia su - idTeach
                            pft_id: element.pft_id,
                            type_invite_suggest: 1,
                        }).lean();
                        if (check) element.saved = 'Đã lưu';
                    }
                })
            );
        }
        if (listChild.length > 0) {
            dataChild = listChild[0];
            await Promise.all(
                listChild.map(async (element) => {
                    // chuyển đổi dạng date
                    element.ngay_tao = new Date(element.ngay_tao * 1000);
                    // xử lí ghép link avatar
                    element.avatarUser = fnc.createLinkFile('PH', element.updatedAt, element.avatarUser);
                })
            );
        }
        return functions.success(res, 'lấy thành công', { data, dataChild, totalCount, listSubject });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};

//trang chủ gia sư
exports.homePage = async (req, res) => {
    try {
        let page = Number(req.body.page) || 1;
        let pageSize = Number(req.body.pageSize) || 5;
        const skip = (page - 1) * pageSize;
        const limit = pageSize;
        const lesson = req.body.lesson ? JSON.parse(req.body.lesson) : null;
        const cls = req.body.cls ? JSON.parse(req.body.cls) : null;
        const city = req.body.city ? JSON.parse(req.body.city) : null;
        const loc = req.body.loc;

        let listConditions = { 'inforGiaSu.ugs_ft': 1, 'inforGiaSu.is_hide': 0 };
        if (lesson) listConditions = { 'inforGiaSu.as_id': { $in: lesson }, ...listConditions };
        if (cls) listConditions = { 'inforGiaSu.ugs_class_teach': { $in: cls }, ...listConditions };
        if (city) listConditions = { city: { $in: city }, ...listConditions };
        let sort = {};
        // lọc theo "Gần nhất" cũng là trạng thái mặc định
        sort['updatedAt'] = -1;
        sort['idGiaSu'] = -1;
        // lọc theo "Xem nhiều" và "Hàng đầu"
        if (loc) sort['inforGiaSu.ugs_view'] = -1;
        let result = await Users.aggregate([
            { $match: listConditions },

            {
                $lookup: {
                    from: 'GS_user_teach_information',
                    localField: 'idGiaSu',
                    foreignField: 'ugs_id',
                    as: 'infoTeach',
                },
            },
            { $unwind: { path: '$infoTeach', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'GS_all_subject',
                    localField: 'inforGiaSu.as_id',
                    foreignField: 'as_id',
                    as: 'SJ',
                },
            },
            { $unwind: { path: '$SJ', preserveNullAndEmptyArrays: true } },
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
                    from: 'GS_teaching_schedule',
                    localField: 'idGiaSu',
                    foreignField: 'ugs_id',
                    as: 'schedule',
                },
            },
            { $unwind: { path: '$schedule', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    ugs_id: '$idGiaSu',
                    ugs_name: '$userName',
                    ugs_avatar: '$avatarUser',
                    ugs_address: '$address',
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt',
                    ugs_about_us: '$inforGiaSu.ugs_about_us',
                    ugs_city: '$city.name',
                    as_id: '$inforGiaSu.as_id',
                    as_detail: '$inforGiaSu.as_detail',
                    ugs_class_teach: '$inforGiaSu.ugs_class_teach',
                    ugs_view: '$inforGiaSu.ugs_view',
                    ugs_ft: '$inforGiaSu.ugs_ft',
                    active: '$inforGiaSu.active',
                    ugs_day_now: '$inforGiaSu.ugs_day_now',
                    experience: '$inForPerson.account.experience',
                    ugs_time: '$infoTeach.ugs_time',
                    ugs_salary: '$infoTeach.ugs_salary',
                    hinhThucDay: '$infoTeach.ugs_formality',
                    ugs_unit_price: '$infoTeach.ugs_unit_price',
                    ugs_month: '$infoTeach.ugs_month',
                    as_name: '$SJ.as_name',
                    cit_id: '$city._id',
                    ct_name: '$city.name',
                    saved: 'lưu',
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
            {
                $facet: {
                    paginatedResults: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
                    paginatedResults2: [{
                        $match: {
                            hinhThucDay: 1,
                            // "ugs_id": { $nin: result[0].paginatedResults.map(item => item.ugs_id) }
                        },
                    },
                    { $limit: 8 },
                    ],
                    paginatedResults3: [{
                        $match: {
                            hinhThucDay: 2,
                        },
                    },
                    { $limit: 8 },
                    ],
                    totalCount: [{
                        $count: 'count',
                    },],
                },
            },
        ]);
        let data = {};
        let data_dayTaiNha = {};
        let data_dayOnl = {};
        let totalCount = 0;
        if (result[0].totalCount.length > 0) {
            data = result[0].paginatedResults;
            let arr_id = result[0].paginatedResults.map((item) => item.ugs_id);
            let paginatedResults2 = result[0].paginatedResults2.filter((item) => !arr_id.includes(item.ugs_id));
            let paginatedResults3 = result[0].paginatedResults3.filter((item) => !arr_id.includes(item.ugs_id));
            data_dayTaiNha = paginatedResults2;
            data_dayOnl = paginatedResults3;
            totalCount = result[0].totalCount[0].count;
            await Promise.all(
                data.map(async (element) => {
                    // chuyển đổi dạng date
                    // element.day_invitation_teach = new Date(element.day_invitation_teach * 1000)
                    //xử lí cộng chuỗi tiền
                    //thời điểm viết api này chưa ghép chức năng gia chưa check được
                    //xử lí ghép link avatar
                    if (element.updatedAt == 0) {
                        element.updatedAt = element.createdAt;
                    }
                    element.ugs_avatar = fnc.createLinkFile('GS', element.updatedAt, element.ugs_avatar);
                    const user = await functions.getTokenUser(req, res);
                    // Xử lý luồng người dùng đăng nhập
                    if (user) {
                        const idParent = user.idGiaSu; // id PH
                        //xử lí check lưu Gia su
                        let check = await SaveTeach.findOne({
                            st_pr_id: idParent, //id phu huynh - idParent
                            ugs_teach: element.ugs_id,
                        }).lean();
                        if (check) element.saved = 'Đã lưu';
                    }
                })
            );
            await Promise.all(
                data_dayTaiNha.map(async (element) => {
                    // chuyển đổi dạng date
                    // element.day_invitation_teach = new Date(element.day_invitation_teach * 1000)
                    //xử lí cộng chuỗi tiền
                    //thời điểm viết api này chưa ghép chức năng gia chưa check được
                    //xử lí ghép link avatar
                    if (element.updatedAt == 0) {
                        element.updatedAt = element.createdAt;
                    }
                    element.ugs_avatar = fnc.createLinkFile('GS', element.updatedAt, element.ugs_avatar);
                    const user = await functions.getTokenUser(req, res);
                    // Xử lý luồng người dùng đăng nhập
                    if (user) {
                        const idParent = user.idGiaSu; // id PH
                        //xử lí check lưu Gia su
                        let check = await SaveTeach.findOne({
                            st_pr_id: idParent, //id phu huynh - idParent
                            ugs_teach: element.ugs_id,
                        }).lean();
                        if (check) element.saved = 'Đã lưu';
                    }
                })
            );
            await Promise.all(
                data_dayOnl.map(async (element) => {
                    // chuyển đổi dạng date
                    // element.day_invitation_teach = new Date(element.day_invitation_teach * 1000)
                    //xử lí cộng chuỗi tiền
                    //thời điểm viết api này chưa ghép chức năng gia chưa check được
                    //xử lí ghép link avatar
                    if (element.updatedAt == 0) {
                        element.updatedAt = element.createdAt;
                    }
                    element.ugs_avatar = fnc.createLinkFile('GS', element.updatedAt, element.ugs_avatar);
                    const user = await functions.getTokenUser(req, res);
                    // Xử lý luồng người dùng đăng nhập
                    if (user) {
                        const idParent = user.idGiaSu; // id PH
                        //xử lí check lưu Gia su
                        let check = await SaveTeach.findOne({
                            st_pr_id: idParent, //id phu huynh - idParent
                            ugs_teach: element.ugs_id,
                        }).lean();
                        if (check) element.saved = 'Đã lưu';
                    }
                })
            );
        }
        return functions.success(res, 'lấy thành công', { data, data_dayTaiNha, data_dayOnl, totalCount });
    } catch (error) {
        console.log(error);
        return functions.setError(res, error.message);
    }
};