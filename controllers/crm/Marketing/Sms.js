const functions = require("../../../services/functions");
const crmService = require("../../../services/CRM/CRMservice");
const FormSms = require("../../../models/crm/FormSms");
const Sms = require("../../../models/crm/Sms");
const Customer = require("../../../models/crm/Customer/customer");
// const SmsSetting = require("../../../models/crm/SmsSetting");

exports.createSms = async(req, res) => {
    try {
        let { supplier, all_receiver, list_receiver, sample_sms_id, content, info_system, date_send_sms, time_send_sms } = req.body;
        let com_id = req.user.data.com_id;
        let user_id = req.user.data.idQLC;
        let type = req.user.data.type;
        let time = functions.convertTimestamp(Date.now());
        //1 -> ca nhan 2-> he thong
        if (supplier && content) {
            supplier = Number(supplier);
            //check da co ket noi den nha mang de gui sms chua
            // let sms_supplier = await SmsSetting.findOne({ _id: supplier });
            // if (sms_supplier) {
            //     let sms_sample = await FormSms.findOne({ _id: Number(sample_sms_id) });
            //     if (sms_sample) {
            //         content = sms_sample.content_form_sms;
            //     }

            //     //lay ra danh sach nguoi nhan
            //     let list_customer = await Customer.find({ company_id: com_id }, { cus_id: 1, phone_number: 1 });
            //     let arr_sms_receiver = [];
            //     if (all_receiver == 1) {
            //         if (list_customer && list_customer.length > 0) {
            //             for (let i = 0; i < list_customer.length; i++) {
            //                 let phone_customer = list_customer[i].phone_number;

            //                 let new_id = await functions.getMaxIdByField(Sms, '_id');
            //                 let new_sms = new Sms({
            //                     _id: new_id,
            //                     company_id: com_id,
            //                     supplier: supplier,
            //                     phone_send: sms_supplier.brand_name,
            //                     phone_receive: phone_customer,
            //                     content: content,
            //                     info_system: info_system,
            //                     date_send_sms: functions.convertTimestamp(date_send_sms),
            //                     time_send_sms: time_send_sms,
            //                     created_at: time,
            //                     user_create_id: user_id,
            //                     user_create_type: type,
            //                     user_edit_id: user_id,
            //                     user_edit_type: type,
            //                     customer_id: list_customer[i].cus_id
            //                 });
            //                 await new_sms.save();

            //                 if (phone_customer && !arr_sms_receiver.includes(phone_customer)) {
            //                     arr_sms_receiver.push(phone_customer);
            //                 }
            //             }
            //         }
            //     } else if (list_receiver && list_receiver.length > 0) {
            //         for (let i = 0; i < list_receiver.length; i++) {
            //             for (let j = 0; j < list_customer.length; j++) {
            //                 let phone_customer = list_customer[j].phone_number;
            //                 if (list_customer[j].cus_id == list_receiver[i] && phone_customer) {
            //                     let new_id = await functions.getMaxIdByField(Sms, '_id');
            //                     let new_sms = new Sms({
            //                         _id: new_id,
            //                         company_id: com_id,
            //                         supplier: supplier,
            //                         phone_send: sms_supplier.brand_name,
            //                         phone_receive: phone_customer,
            //                         content: content,
            //                         info_system: info_system,
            //                         date_send_sms: functions.convertTimestamp(date_send_sms),
            //                         time_send_sms: time_send_sms,
            //                         created_at: time,
            //                         user_create_id: user_id,
            //                         user_create_type: type,
            //                         user_edit_id: user_id,
            //                         user_edit_type: type,
            //                         customer_id: list_customer[i].cus_id
            //                     });
            //                     await new_sms.save();
            //                     if (!arr_sms_receiver.includes(phone_customer)) arr_sms_receiver.push(phone_customer);
            //                     break;
            //                 }
            //             }
            //         }
            //     }

            //     let time_send = new Date(Date.now());
            //     //ket noi den nha mang de gui sms
            //     //mac dinh gui luon, info_system==2 -> gui theo ke hoach
            //     if (info_system == 2) {
            //         time_send = crmService.createDateWithDateAndTime(date_send_sms, time_send_sms);
            //         // let send_sms = await crmService.sendEmailSchedule(server_mail, port_number, method_security, name_login, password, arr_sms_receiver, title, content, time_send);
            //     } else {
            //         // let send_sms = await crmService.sendEmail(server_mail, port_number, method_security, name_login, password, arr_sms_receiver, title, content);
            //     }
            //     return functions.success(res, "Create sms success!");
            // }
            return functions.success(res, "Chua cai dat sms de gui!", 400);
        }
        return functions.success(res, "Missing input value!", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.listSms = async(req, res) => {
    try {
        let { customer_id, page, pageSize, fromDate, toDate, title } = req.body;
        let com_id = req.user.data.com_id;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;

        let condition = { company_id: com_id };
        if (customer_id) {
            condition.customer_id = Number(customer_id);
            // condition = {
            //   company_id: com_id,
            //   $or: [
            //     {all_receiver: 1},
            //     {list_receiver: new RegExp(`\\b${customer_id}\\b`)}
            //   ]
            // }
        }

        fromDate = functions.convertTimestamp(fromDate);
        toDate = functions.convertTimestamp(toDate);
        if (fromDate && !toDate) condition.date_send_email = { $gte: fromDate };
        if (toDate && !fromDate) condition.date_send_email = { $lte: toDate };
        if (fromDate && toDate) condition.date_send_email = { $gte: fromDate, $lte: toDate };
        if (title) condition.title = new RegExp(title, 'i');

        let listSms = await Sms.aggregate([{
                $match: condition
            },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "Users",
                    localField: 'company_id',
                    foreignField: 'idQLC',
                    pipeline: [
                        { $match: { type: 1 } },
                    ],
                    as: "Company"
                }
            },
            { $unwind: { path: "$Company", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "CRM_customer",
                    localField: 'customer_id',
                    foreignField: 'cus_id',
                    as: "Customer"
                }
            },
            { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "Users",
                    localField: 'user_create_id',
                    foreignField: 'idQLC',
                    let: { userTypeId: "$user_create_type" },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$idQLC", 0] },
                                        { $ne: ["$idQLC", null] },
                                        { $eq: ["$type", "$$userTypeId"] }
                                    ]
                                }
                            },
                        },
                        { $project: { _id: 0, userName: 1 } }
                    ],
                    as: 'Creator'
                }
            },
            { $unwind: { path: "$Creator", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": "$_id",
                    "company_id": "$company_id",
                    "customer_id": "$customer_id",
                    "phone_receive": "$phone_receive",
                    "content": "$content",
                    "supplier": "$supplier",
                    "phone_send": "$phone_send",
                    "info_system": "$info_system",
                    "date_send_email": "$date_send_email",
                    "time_send_email": "$time_send_email",
                    "user_create_id": "$user_create_id",
                    "user_create_type": "$user_create_type",
                    "user_edit_id": "$user_edit_id",
                    "user_edit_type": "$user_edit_type",
                    "status": "$status",
                    "is_delete": "$is_delete",
                    "created_at": "$created_at",
                    "updated_at": "$updated_at",
                    "user_create_name": "$Creator.userName",
                    "company_name": "$Company.userName",
                    "customer_name": "$Customer.name",
                    "customer_type": "$Customer.type",
                }
            },
        ]);
        // for(let i=0; i<listSms.length; i++) {
        //   //lay ra ten ds khach hang+phan he
        //   let arr_
        //   listSms[i].phone_receiver = customer.phone_number;
        // }

        let total = await functions.findCount(Sms, condition);
        return functions.success(res, "get list email potential success:", { total, listSms });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.createSampleSms = async(req, res) => {
    try {
        let { name_form_sms, content_form_sms } = req.body;
        if (name_form_sms && content_form_sms) {
            let com_id = req.user.data.com_id;
            let user_id = req.user.data.idQLC;
            let user_type = req.user.data.type;
            let time = functions.convertTimestamp(Date.now());
            let new_id = await functions.getMaxIdByField(FormSms, '_id');
            let new_sample_sms = new FormSms({
                _id: new_id,
                com_id: com_id,
                name_form_sms: name_form_sms,
                content_form_sms: content_form_sms,
                user_create_id: user_id,
                user_create_type: user_type,
                user_edit_id: user_id,
                user_edit_type: user_type,
                created_at: time,
                updated_at: time
            });
            new_sample_sms = await new_sample_sms.save();
            if (new_sample_sms) {
                return functions.success(res, "Create sample sms success");
            }
            return functions.setError(res, "Create sample sms fail!");
        }
        return functions.setError(res, "Missing input value!", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.updateSampleSms = async(req, res, next) => {
    try {
        let { id_sms, name_form_sms, content_form_sms } = req.body;
        if (id_sms && name_form_sms && content_form_sms) {
            let com_id = req.user.data.com_id;
            let user_id = req.user.data.idQLC;
            let user_type = req.user.data.type;
            let time = functions.convertTimestamp(Date.now());

            let update_sms = await FormSms.findOneAndUpdate({ _id: Number(id_sms), com_id: com_id }, {
                name_form_sms: name_form_sms,
                content_form_sms: content_form_sms,
                user_edit_id: user_id,
                user_edit_type: user_type,
                updated_at: time
            }, { new: true });

            if (update_sms) {
                return functions.success(res, "Update sample sms success");
            }
            return functions.setError(res, "Sample sms not found!");
        }
        return functions.setError(res, "Missing input value!", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.listSampleSms = async(req, res, next) => {
    try {
        let { id_sms, name_form_sms, page, pageSize } = req.body;
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        page = Number(page);
        pageSize = Number(pageSize);
        const skip = (page - 1) * pageSize;

        let com_id = req.user.data.com_id;
        let condition = { com_id: com_id, is_delete: 0 };
        if (id_sms) condition._id = Number(id_sms);
        if (name_form_sms) condition.name_form_sms = new RegExp(name_form_sms, 'i');

        let list_customer = await Customer.find({ company_id: com_id }, { cus_id: 1, name: 1, phone_number: 1, type: 1 });
        let listSampleSms = await FormSms.aggregate([
            { $match: condition },
            { $sort: { created_at: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
                $lookup: {
                    from: "Users",
                    localField: 'user_edit_id',
                    foreignField: 'idQLC',
                    let: { userTypeId: "$user_edit_type" },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$idQLC", 0] },
                                        { $ne: ["$idQLC", null] },
                                        { $eq: ["$type", "$$userTypeId"] }
                                    ]
                                }
                            },
                        },
                        { $project: { _id: 0, userName: 1 } }
                    ],
                    as: 'Editor'
                }
            },
            { $unwind: { path: "$Editor", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "_id": "$_id",
                    "com_id": "$com_id",
                    "name_form_sms": "$name_form_sms",
                    "content_form_sms": "$content_form_sms",
                    "user_create_id": "$user_create_id",
                    "user_create_type": "$user_create_type",
                    "user_edit_id": "$user_edit_id",
                    "user_edit_type": "$user_edit_type",
                    "is_delete": "$is_delete",
                    "created_at": "$created_at",
                    "updated_at": "$updated_at",
                    "name_user_edit": "$Editor.userName",
                }
            },
        ]);
        let total = await functions.findCount(FormSms, condition);
        return functions.success(res, "get list sample sms success: ", { total, data: listSampleSms });
    } catch (error) {
        return functions.setError(res, error.message);
    }
}

exports.deleteMany = async(req, res) => {
    try {
        let { arr_id, type, model } = req.body;
        if (type && model && arr_id && Array.isArray(arr_id) && arr_id.length > 0) {
            //xoa tam thoi
            if (type == 1) {
                if (model == 'sample_sms') {
                    await crmService.deleteSoft(FormSms, '_id', arr_id);
                    return functions.success(res, "Delete soft sample sms success!");
                }
                if (model == 'appointment') {
                    await crmService.deleteSoft(Appointment, '_id', arr_id);
                    return functions.success(res, "Delete soft sample sms success!");
                }
                return functions.setError(res, "Model not found!");
            }
            //khoi phuc
            else if (type == 2) {
                if (model == 'sample_sms') {
                    await crmService.restore(FormSms, '_id', arr_id);
                    return functions.success(res, "Delete soft sample sms success!");
                }
                return functions.setError(res, "Model not found!");
            }
            //xoa vienh vien
            else if (type == 3) {
                if (model == 'sample_sms') {
                    await crmService.delete(FormSms, '_id', arr_id);
                    return functions.success(res, "Delete soft sample sms success!");
                }
                return functions.setError(res, "Model not found!");
            }
            return functions.setError(res, "type=1, 2, 3!");
        }
        return functions.setError(res, "Missing input arr_id or type or model!");
    } catch (error) {
        return functions.setError(res, error.message);
    }
}