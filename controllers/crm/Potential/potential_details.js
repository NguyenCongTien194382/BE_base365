const functions = require("../../../services/functions");
const crmService = require("../../../services/CRM/CRMservice");
const Potential = require("../../../models/crm/Potential/potentials");
const Customer = require("../../../models/crm/Customer/customer");
const PotentialCampaign = require("../../../models/crm/campaign_customer");
const EmailPotential = require("../../../models/crm/email_potential");
const CustomerNote = require("../../../models/crm/Customer/customer_note");
const CustomerFile = require("../../../models/crm/Customer/customer_file");
const Appointment = require("../../../models/crm/CustomerCare/AppointmentSchedule");
const ProductPotential = require("../../../models/crm/product_potential");
const Products = require("../../../models/crm/Products");
const Campaign = require("../../../models/crm/Campaign/Campaign");
const EmailSms = require("../../../models/crm/EmailSms");
const Users = require("../../../models/Users");
const ShareCustomer = require("../../../models/crm/tbl_share_customer");
const Department = require("../../../models/qlc/Deparment");
const diary_potential = require("../../../models/crm/Diary/diary_potential");
//------------------chien dich

exports.addPotentialIntoCampaign = async (req, res, next) => {
  try {
    let { arr_potential_id, arr_campaign_id } = req.body;
    let time = functions.convertTimestamp(Date.now());
    if (
      arr_potential_id &&
      arr_potential_id.length > 0 &&
      arr_potential_id &&
      arr_potential_id.length > 0
    ) {
      for (let i = 0; i < arr_potential_id.length; i++) {
        for (let j = 0; j < arr_campaign_id.length; j++) {
          let new_id = await functions.getMaxIdByField(PotentialCampaign, "id");
          const checkExit = await PotentialCampaign.findOne({
            cus_id: arr_potential_id[i],
            campaign_id: arr_campaign_id[j],
          });
          if (!checkExit) {
            let new_doc = new PotentialCampaign({
              id: new_id,
              cus_id: arr_potential_id[i],
              campaign_id: arr_campaign_id[j],
              created_at: time,
            });
            await new_doc.save();
          }
        }
      }
      return functions.success(res, "Add potential into campaign success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { cam_id, cus_id } = req.body;
    if (cam_id && cus_id) {
      await PotentialCampaign.findOneAndDelete({ cus_id, campaign_id: cam_id });
      return functions.success(res, "Delete potential into campaign success!");
    } else {
      return functions.setError(res, "Missing input value!", 400);
    }
  } catch (err) {
    return functions.setError(res, error.message);
  }
};

exports.listCampaignContainPotential = async (req, res) => {
  try {
    let {
      cus_id,
      fromDate,
      toDate,
      emp_id,
      status,
      nameCampaign,
      page,
      pageSize,
    } = req.body;
    if (cus_id) {
      cus_id = Number(cus_id);
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;

      let condition = {};
      // tu ngay den ngay
      fromDate = functions.convertTimestamp(fromDate);
      toDate = functions.convertTimestamp(toDate);
      if (fromDate) condition.timeStart = { $gte: fromDate };
      if (toDate) condition.timeEnd = { $lte: toDate };

      if (emp_id) condition.empID = Number(emp_id);
      if (status) condition.status = Number(status);
      if (nameCampaign) condition.nameCampaign = new RegExp(nameCampaign, "i");
      let listCampaign = await Campaign.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "CRM_potential_campaign",
            localField: "_id",
            foreignField: "campaign_id",
            as: "PotentialCampaign",
          },
        },
        { $match: { PotentialCampaign: { $ne: [] } } },
        {
          $unwind: {
            path: "$PotentialCampaign",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { "PotentialCampaign.cus_id": cus_id } },
        { $sort: { "PotentialCampaign.updatedAt": -1 } },
        { $skip: skip },
        { $limit: pageSize },
        {
          $lookup: {
            from: "Users",
            localField: "empID",
            foreignField: "idQLC",
            pipeline: [{ $match: { idQLC: { $nin: [0, null] }, type: 2 } }],
            as: "Employee",
          },
        },
        { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: "$_id",
            groupID: "$groupID",
            nameCampaign: "$nameCampaign",
            status: "$status",
            typeCampaign: "$typeCampaign",
            timeStart: "$timeStart",
            timeEnd: "$timeEnd",
            money: "$money",
            expectedSales: "$expectedSales",
            chanelCampaign: "$chanelCampaign",
            investment: "$investment",
            empID: "$empID",
            description: "$description",
            shareAll: "$shareAll",
            companyID: "$companyID",
            countEmail: "$countEmail",
            type: "$type",
            userIdCreate: "$userIdCreate",
            userIdUpdate: "$userIdUpdate",
            site: "$site",
            isDelete: "$isDelete",
            hidden_null: "$hidden_null",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            emp_name: "$Employee.userName",
            id_potential_campaign: "$PotentialCampaign.id",
          },
        },
      ]);
      let total = await Campaign.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "CRM_potential_campaign",
            localField: "_id",
            foreignField: "campaign_id",
            as: "PotentialCampaign",
          },
        },
        { $match: { PotentialCampaign: { $ne: [] } } },
        {
          $unwind: {
            path: "$PotentialCampaign",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { "PotentialCampaign.cus_id": cus_id } },
        {
          $count: "count",
        },
      ]);
      total = total.length != 0 ? total[0].count : 0;
      return functions.success(res, "get list campaign success", {
        total,
        data: listCampaign,
      });
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//-----------------------------------------------------ghi chu

exports.createNoteForPotential = async (req, res) => {
  try {
    let { content, cus_id } = req.body;
    if (cus_id && content) {
      let kh = await Potential.findOne(
        { potential_id: Number(cus_id) },
        { potential_id: 1 }
      );
      if (kh) {
        let time = functions.convertTimestamp(Date.now());
        let user_id = req.user.data.idQLC;
        let user_type = req.user.data.type;
        let new_id = await functions.getMaxIdByField(CustomerNote, "id");
        let new_note = new CustomerNote({
          id: new_id,
          content: content,
          cus_id: cus_id,
          user_created_id: user_id,
          user_created_type: user_type,
          type_note: 0,
          created_at: time,
          updated_at: time,
        });
        await new_note.save();
        return functions.success(res, "Create note for potential success!");
      }
      return functions.setError(res, "Khanh hang not found!", 400);
    }
    return functions.setError(res, "Missing input content!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateNoteForPotential = async (req, res) => {
  try {
    let { id, content } = req.body;
    if (id && content) {
      id = Number(id);
      let time = functions.convertTimestamp(Date.now());
      let user_id = req.user.data.idQLC;
      let update_note = await CustomerNote.findOneAndUpdate(
        { id: id },
        {
          content: content,
          updated_at: time,
        },
        { new: true }
      );
      if (update_note) {
        return functions.success(res, "Update note for potential success!");
      }
      return functions.setError(res, "Note not found!", 404);
    }
    return functions.setError(res, "Missing input content or id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteNotePotential = async (req, res) => {
  try {
    let { id } = req.body;
    if (id) {
      id = Number(id);
      let note = await CustomerNote.findOneAndDelete({ id: id });
      if (note) {
        return functions.success(res, "Delete note for potential success!");
      }
      return functions.setError(res, "Note not found!", 404);
    }
    return functions.setError(res, "Missing input id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listNotePotential = async (req, res) => {
  try {
    let { cus_id, fromDate, toDate, emp_id, emp_name, page, pageSize } =
      req.body;
    if (cus_id) {
      cus_id = Number(cus_id);
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;
      let com_id = req.user.data.com_id;

      let condition = { cus_id: cus_id };
      let condition2 = { "inForPerson.employee.com_id": com_id, type: 2 };
      // tu ngay den ngay
      fromDate = functions.convertTimestamp(fromDate);
      toDate = functions.convertTimestamp(toDate);
      if (fromDate && !toDate) condition.created_at = { $gte: fromDate };
      if (toDate && !fromDate) condition.created_at = { $lte: toDate };
      if (toDate && fromDate)
        condition.created_at = { $gte: fromDate, $lte: toDate };

      if (emp_id) condition.user_created_id = Number(emp_id);
      // if (emp_name) condition2["Employee.userName"] = new RegExp(emp_name, "i");
      if (emp_name) condition2.userName = new RegExp(emp_name, "i");

      let list_emp_name = await Users.find(condition2, {
        idQLC: 1,
        userName: 1,
      });
      let company_name = await Users.findOne(
        { idQLC: com_id, type: 1 },
        { userName: 1 }
      );
      let listNote = await functions.pageFind(
        CustomerNote,
        condition,
        { updatedAt: -1 },
        skip,
        pageSize
      );

      let user_name = "";
      for (let i = 0; i < listNote.length; i++) {
        if (listNote[i].user_created_type == 1) {
          listNote[i].user_name = company_name?.userName;
        } else {
          for (let j = 0; j < list_emp_name.length; j++) {
            if (list_emp_name[j].idQLC == listNote[i].user_created_id) {
              listNote[i].user_name = list_emp_name[j].userName;
              break;
            }
          }
        }
      }
      let total = await functions.findCount(CustomerNote, condition);
      // let listNote = await CustomerNote.aggregate([
      //   { $match: condition },
      //   { $sort: { id: -1 } },
      //   { $skip: skip },
      //   { $limit: pageSize },
      //   {
      //     $lookup: {
      //       from: "Users",
      //       localField: "user_created_id",
      //       foreignField: "idQLC",
      //       let: { userTypeId: "$user_created_type" },
      //       pipeline: [
      //         {
      //           $match: {
      //             $expr: {
      //               $and: [
      //                 { $ne: ["$idQLC", 0] },
      //                 { $ne: ["$idQLC", null] },
      //                 { $eq: ["$type", "$$userTypeId"] }
      //               ]
      //             }
      //           },
      //         },
      //         {$project: {_id: 0, userName: 1}}
      //       ],
      //       as: "Employee",
      //     },
      //   },
      //   { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
      //   { $match: condition2 },
      //   {
      //     $project: {
      //       id: "$id",
      //       content: "$content",
      //       cus_id: "$cus_id",
      //       user_created_id: "$user_created_id",
      //       type_note: "$type_note",
      //       created_at: "$created_at",
      //       updated_at: "$updated_at",
      //       emp_name: "$Employee.userName",
      //     },
      //   },
      // ]);
      // let total = await CustomerNote.aggregate([
      //   { $match: condition },
      //   {
      //     $lookup: {
      //       from: "Users",
      //       localField: "user_created_id",
      //       foreignField: "idQLC",
      //       let: { userTypeId: "$user_created_type" },
      //       pipeline: [
      //           {
      //           $match: {
      //             $expr: {
      //               $and: [
      //                 { $ne: ["$idQLC", 0] },
      //                 { $ne: ["$idQLC", null] },
      //                 { $eq: ["$type", "$$userTypeId"] }
      //               ]
      //             }
      //           },
      //         },
      //         {$project: {_id: 0, userName: 1}}
      //       ],
      //       as: "Employee",
      //     },
      //   },
      //   { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
      //   { $match: condition2 },
      //   {
      //     $count: "count",
      //   },
      // ]);
      // total = total.length != 0 ? total[0].count : 0;
      return functions.success(res, "get list note potential success:", {
        total: total,
        data: listNote,
      });
    }
    return functions.setError(res, "Missing input cus_id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//--------------------------------------------------------tai lieu dinh kem
exports.createAttachment = async (req, res) => {
  try {
    let cus_id = req.body.cus_id;
    let user_id = req.user.data.idQLC;
    if (cus_id) {
      if (req.files && req.files.document) {
        let file = req.files.document;
        let check_file = await crmService.checkFile(file.path);
        if (check_file) {
          let time = functions.convertTimestamp(Date.now());
          let file_size = file.size;
          let file_name = await crmService.uploadFile("potential", time, file);
          let new_id = await functions.getMaxIdByField(CustomerFile, "id");
          let new_file = new CustomerFile({
            id: new_id,
            file_name: file_name,
            cus_id: cus_id,
            user_created_id: user_id,
            file_size: file_size,
            created_at: time,
          });
          await new_file.save();
          return functions.success(res, "Create attachment success!");
        }
        return functions.setError(res, "Invalid file!", 400);
      }
      return functions.success(res, "Missing input file!");
    }
    return functions.success(res, "Missing input cus_id!");
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listAttachment = async (req, res) => {
  try {
    let { cus_id, fromDate, toDate, file_name, page, pageSize } = req.body;
    if (cus_id) {
      cus_id = Number(cus_id);
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;

      let condition = { cus_id: cus_id };
      // tu ngay den ngay
      fromDate = functions.convertTimestamp(fromDate);
      toDate = functions.convertTimestamp(toDate);
      if (fromDate && !toDate) condition.created_at = { $gte: fromDate };
      if (toDate && !fromDate) condition.created_at = { $lte: toDate };
      if (toDate && fromDate)
        condition.created_at = { $gte: fromDate, $lte: toDate };

      if (file_name) condition.file_name = new RegExp(file_name, "i");

      let listAttachment = await CustomerFile.aggregate([
        { $match: condition },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: pageSize },
        {
          $lookup: {
            from: "Users",
            localField: "user_created_id",
            foreignField: "idQLC",
            pipeline: [{ $match: { type: 2 } }],
            as: "Employee",
          },
        },
        { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: "$id",
            file_name: "$file_name",
            cus_id: "$cus_id",
            user_created_id: "$user_created_id",
            file_size: "$file_size",
            created_at: "$created_at",
            user_name: "$Employee.userName",
          },
        },
      ]);
      let total = await functions.findCount(CustomerFile, condition);
      for (let i = 0; i < listAttachment.length; i++) {
        listAttachment[i].linkFile = crmService.getLinkFile(
          "potential",
          listAttachment[i].created_at,
          listAttachment[i].file_name
        );
      }
      return functions.success(res, "get list note potential success:", {
        total: total,
        data: listAttachment,
      });
    }
    return functions.setError(res, "Missing input cus_id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    let { id } = req.body;
    if (id) {
      id = Number(id);
      let attachment = await CustomerFile.findOne({ id: id });
      if (attachment) {
        await crmService.deleteFile(
          "potential",
          attachment.created_at,
          attachment.file_name
        );
        await CustomerFile.findOneAndDelete({ id: id });
        return functions.success(res, "Delete note for potential success!");
      }
      return functions.setError(res, "Attachment not found!", 404);
    }
    return functions.setError(res, "Missing input id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//---------------------------------------lich hen

exports.createAppointment = async (req, res) => {
  try {
    let {
      schedule_name,
      cus_id,
      ep_id,
      address,
      start_date_schedule,
      end_date_schedule,
      description,
    } = req.body;
    if (
      schedule_name &&
      cus_id &&
      ep_id &&
      start_date_schedule &&
      end_date_schedule
    ) {
      let com_id = req.user.data.com_id;
      let checkDate1 = functions.checkDate(start_date_schedule);
      let checkDate2 = functions.checkDate(end_date_schedule);
      if (checkDate1 && checkDate2) {
        let new_id = await functions.getMaxIdByField(Appointment, "_id");
        let time = functions.convertTimestamp(Date.now());
        let new_schedule = new Appointment({
          _id: new_id,
          com_id: com_id,
          schedule_name: schedule_name,
          cus_id: cus_id,
          ep_id: ep_id,
          address: address,
          start_date_schedule: new Date(start_date_schedule),
          end_date_schedule: new Date(end_date_schedule),
          schedule_status: 2,
          description: description,
          created_at: time,
          updated_at: time,
        });
        await new_schedule.save();
        return functions.success(res, "Create appoint success!");
      }
      return functions.setError(res, "Invalid date!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    let {
      id_schedule,
      schedule_name,
      cus_id,
      ep_id,
      address,
      start_date_schedule,
      end_date_schedule,
      description,
    } = req.body;
    if (
      id_schedule &&
      schedule_name &&
      cus_id &&
      ep_id &&
      start_date_schedule &&
      end_date_schedule
    ) {
      let com_id = req.user.data.com_id;
      let checkDate1 = functions.checkDate(start_date_schedule);
      let checkDate2 = functions.checkDate(end_date_schedule);
      if (checkDate1 && checkDate2) {
        let time = functions.convertTimestamp(Date.now());
        let update_schedule = await Appointment.findOneAndUpdate(
          { _id: Number(id_schedule), com_id: com_id },
          {
            schedule_name: schedule_name,
            cus_id: cus_id,
            ep_id: ep_id,
            address: address,
            start_date_schedule: new Date(start_date_schedule),
            end_date_schedule: new Date(end_date_schedule),
            description: description,
            updated_at: time,
          },
          { new: true }
        );
        if (update_schedule) {
          return functions.success(res, "Update appoint success!");
        }
        return functions.setError(res, "Update appoint fail!");
      }
      return functions.setError(res, "Invalid date!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listAppointment = async (req, res) => {
  try {
    let { page, pageSize, fromDate, toDate, ep_id, status, name, cus_id } =
      req.body;
    let com_id = req.user.data.com_id;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = { com_id: com_id, is_delete: 0 };
    if (cus_id) condition.cus_id = Number(cus_id);
    if (ep_id) condition.ep_id = Number(ep_id);
    if (status) condition.schedule_status = Number(status);
    if (name) condition.schedule_name = new RegExp(name, "i");
    // tu ngay den ngay
    if (fromDate) condition.start_date_schedule = { $gte: new Date(fromDate) };
    if (toDate) condition.end_date_schedule = { $lte: new Date(toDate) };

    let listAppointment = await Appointment.aggregate([
      { $match: condition },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "Users",
          localField: "ep_id",
          foreignField: "idQLC",
          pipeline: [{ $match: { type: 2 } }],
          as: "Employee",
        },
      },
      { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id",
          schedule_name: "$schedule_name",
          cus_id: "$cus_id",
          ep_id: "$ep_id",
          address: "$address",
          start_date_schedule: "$start_date_schedule",
          end_date_schedule: "$end_date_schedule",
          schedule_status: "$schedule_status",
          reason_cancel: "$reason_cancel",
          description: "$description",
          content: "$content",
          is_delete: "$is_delete",
          created_at: "$created_at",
          updated_at: "$updated_at",
          ep_name: "$Employee.userName",
        },
      },
    ]);
    let total = await functions.findCount(Appointment, condition);
    return functions.success(res, "get list appointment success: ", {
      total,
      data: listAppointment,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.changeStatusAppointment = async (req, res) => {
  try {
    let { id_schedule, status, content } = req.body;
    if (id_schedule && content) {
      let com_id = req.user.data.com_id;
      let time = functions.convertTimestamp(Date.now());
      let update_schedule = await Appointment.findOneAndUpdate(
        { _id: Number(id_schedule), com_id: com_id },
        {
          schedule_status: status,
          content: content,
          updated_at: time,
        },
        { new: true }
      );
      if (update_schedule) {
        return functions.success(res, "Update status appoint success!");
      }
      return functions.setError(res, "Update status appoint fail!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    let { id_schedule, reason_cancel } = req.body;
    if (id_schedule && reason_cancel) {
      let com_id = req.user.data.com_id;
      let time = functions.convertTimestamp(Date.now());
      let update_schedule = await Appointment.findOneAndUpdate(
        { _id: Number(id_schedule), com_id: com_id },
        {
          schedule_status: 4,
          reason_cancel: reason_cancel,
          updated_at: time,
        },
        { new: true }
      );
      if (update_schedule) {
        return functions.success(res, "Cancel appoint success!");
      }
      return functions.setError(res, "Cancel appoint fail!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//---------------------------------------------------email
//
exports.sendEmailToPotential = async (req, res, next) => {
  try {
    let { arr_potential_id, arr_email_id } = req.body;
    let time = functions.convertTimestamp(Date.now());
    if (
      arr_potential_id &&
      arr_potential_id.length > 0 &&
      arr_potential_id &&
      arr_potential_id.length > 0
    ) {
      for (let i = 0; i < arr_potential_id.length; i++) {
        for (let j = 0; j < arr_email_id.length; j++) {
          let new_id = await functions.getMaxIdByField(EmailPotential, "id");
          let new_doc = new EmailPotential({
            id: new_id,
            cus_id: arr_potential_id[i],
            email_id: arr_email_id[j],
            created_at: time,
          });
          await new_doc.save();
        }
      }
      return functions.success(res, "Add potential into campaign success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listEmailPotential = async (req, res) => {
  try {
    let { customer_id, page, pageSize, fromDate, toDate, title } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    if (customer_id) {
      customer_id = Number(customer_id);
      let condition = {
        $or: [
          { all_receiver: 1 },
          { list_receiver: new RegExp(`\\b${customer_id}\\b`) },
        ],
      };

      fromDate = functions.convertTimestamp(fromDate);
      toDate = functions.convertTimestamp(toDate);
      if (fromDate && !toDate) condition.date_send_email = { $gte: fromDate };
      if (toDate && !fromDate) condition.date_send_email = { $lte: toDate };
      if (fromDate && toDate)
        condition.date_send_email = { $gte: fromDate, $lte: toDate };
      if (title) condition.title = new RegExp(title, "i");

      let customer = await Customer.findOne(
        { cus_id: customer_id },
        { email: 1 }
      );
      if (customer) {
        let listEmailPotential = await EmailSms.aggregate([
          {
            $match: condition,
          },
          { $sort: { updatedAt: -1 } },
          { $skip: skip },
          { $limit: pageSize },
          {
            $lookup: {
              from: "Users",
              localField: "user_create_id",
              foreignField: "idQLC",
              let: { userTypeId: "$user_create_type" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: ["$idQLC", 0] },
                        { $ne: ["$idQLC", null] },
                        { $eq: ["$type", "$$userTypeId"] },
                      ],
                    },
                  },
                },
                { $project: { _id: 0, userName: 1 } },
              ],
              as: "Creator",
            },
          },
          { $unwind: { path: "$Creator", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: "$_id",
              title: "$title",
              status: "$status",
              user_create_id: "$user_create_id",
              user_create_name: "$Creator.userName",
              date_send_email: "$date_send_email",
              time_send_email: "$time_send_email",
              email_reply: "$email_reply",
              email_send: "$email_send",
              created_at: "$created_at",
            },
          },
        ]);
        for (let i = 0; i < listEmailPotential.length; i++) {
          listEmailPotential[i].email_receiver = customer.email;
        }
        let total = await functions.findCount(EmailSms, condition);
        return functions.success(res, "get list email potential success:", {
          total,
          listEmailPotential,
        });
      }
      return functions.setError(res, "Customer not found!", 400);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//------------------------------------------------------------them hang hang quan tam
exports.addProductInterest = async (req, res) => {
  try {
    let { arr_potential_id, arr_product_id } = req.body;
    if (
      arr_potential_id &&
      arr_product_id &&
      arr_potential_id.length > 0 &&
      arr_product_id.length > 0
    ) {
      let time = functions.convertTimestamp(Date.now());
      for (let i = 0; i < arr_potential_id.length; i++) {
        for (let j = 0; j < arr_product_id.length; j++) {
          let new_id = await functions.getMaxIdByField(ProductPotential, "id");
          let new_doc = new ProductPotential({
            id: new_id,
            cus_id: arr_potential_id[i],
            product_id: arr_product_id[j],
            created_at: time,
          });
          await new_doc.save();
        }
      }
      return functions.success(res, "Add product into potential success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listProductInterest = async (req, res, next) => {
  try {
    let { potential_id, page, pageSize, product_group, product_name } =
      req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;
    if (potential_id) {
      potential_id = Number(potential_id);
      let condition = {};
      if (product_name) condition.prod_name = new RegExp(product_name, "i");
      if (product_group) condition.group_id = Number(product_group);

      let listProductInterest = await Products.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "CRM_product_potential",
            localField: "_id",
            foreignField: "product_id",
            as: "ProductPotential",
          },
        },
        { $match: { ProductPotential: { $ne: [] } } },
        {
          $unwind: {
            path: "$ProductPotential",
            preserveNullAndEmptyArrays: true,
          },
        },

        { $match: { "ProductPotential.cus_id": potential_id } },
        { $sort: { "ProductPotential.updatedAt": -1 } },
        { $skip: skip },
        { $limit: pageSize },
        {
          $lookup: {
            from: "CRM_product_groups",
            localField: "group_id",
            foreignField: "_id",
            as: "Group",
          },
        },
        { $unwind: { path: "$Group", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "CRM_Product_Unit",
            localField: "dvt",
            foreignField: "_id",
            as: "Unit",
          },
        },
        { $unwind: { path: "$Unit", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            product_id: "$_id",
            prod_name: "$prod_name",
            group_id: "$group_id",
            dvt: "$dvt",
            unit_name: "$Unit.unit_name",
            group_name: "$Group.gr_name",
            created_at: "$ProductPotential.created_at",
            price: "$price",
          },
        },
      ]);
      let total = await Products.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "CRM_product_potential",
            localField: "_id",
            foreignField: "product_id",
            as: "ProductPotential",
          },
        },
        { $match: { ProductPotential: { $ne: [] } } },
        {
          $unwind: {
            path: "$ProductPotential",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { "ProductPotential.cus_id": potential_id } },
        {
          $count: "count",
        },
      ]);
      total = total.length != 0 ? total[0].count : 0;
      return functions.success(res, "get list product potential:", {
        total,
        data: listProductInterest,
      });
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteProductPotential = async (req, res) => {
  try {
    let { cus_id, product_id } = req.body;
    if (cus_id && product_id) {
      cus_id = Number(cus_id);
      product_id = Number(product_id);
      let productInterest = await ProductPotential.findOneAndDelete({
        cus_id: cus_id,
        product_id: product_id,
      });
      if (productInterest) {
        return functions.success(
          res,
          "Delete productInterest for potential success!"
        );
      }
      return functions.setError(res, "ProductPotential not found!", 404);
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

//-----------------------------danh sach chia se

exports.createShareCustomer = async (req, res, next) => {
  try {
    let { arr_emp, arr_dep, arr_cus, role, share_related_list } = req.body;
    let user_id = req.user.data.idQLC;
    let user_type = req.user.data.type;
    if (arr_cus && Array.isArray(arr_cus) && arr_cus.length > 0 && role) {
      let time = functions.convertTimestamp(Date.now());
      for (let i = 0; i < arr_cus.length; i++) {
        //share customer for department
        if (arr_dep && Array.isArray(arr_dep)) {
          for (let j = 0; j < arr_dep.length; j++) {
            let check_exist = await ShareCustomer.findOne({
              customer_id: arr_cus[i],
              dep_id: arr_dep[j],
            });
            if (!check_exist) {
              let id_new = await functions.getMaxIdByField(
                ShareCustomer,
                "_id"
              );
              let new_share = new ShareCustomer({
                _id: id_new,
                customer_id: arr_cus[i],
                dep_id: arr_dep[j],
                role: role,
                share_related_list: share_related_list,
                user_create_id: user_id,
                user_create_type: user_type,
                created_at: time,
                updated_at: time,
              });
              await new_share.save();
            } else {
              await ShareCustomer.findOneAndUpdate(
                { customer_id: arr_cus[i], dep_id: arr_dep[j] },
                {
                  role: role,
                  share_related_list: share_related_list,
                  update_at: time,
                },
                { new: true }
              );
            }
          }
        }

        //employee
        if (arr_emp && Array.isArray(arr_emp)) {
          for (let j = 0; j < arr_emp.length; j++) {
            let check_exist = await ShareCustomer.findOne({
              customer_id: arr_cus[i],
              emp_id: arr_emp[j],
            });
            if (!check_exist) {
              let id_new = await functions.getMaxIdByField(
                ShareCustomer,
                "_id"
              );
              let new_share = new ShareCustomer({
                _id: id_new,
                customer_id: arr_cus[i],
                emp_id: arr_emp[j],
                role: role,
                share_related_list: share_related_list,
                user_create_id: user_id,
                user_create_type: user_type,
                created_at: time,
                updated_at: time,
              });
              await new_share.save();
            } else {
              await ShareCustomer.findOneAndUpdate(
                { customer_id: arr_cus[i], emp_id: arr_emp[j] },
                {
                  role: role,
                  share_related_list: share_related_list,
                  update_time: time,
                },
                { new: true }
              );
            }
          }
        }
      }
      return functions.success(res, "create share customer success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listShare = async (req, res) => {
  try {
    let { cus_id, page, pageSize } = req.body;
    let com_id = req.user.data.com_id;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    if (cus_id) {
      cus_id = Number(cus_id);
      let condition = { customer_id: cus_id };
      let list_emp = await Users.find(
        { "inForPerson.employee.com_id": com_id },
        { idQLC: 1, userName: 1 }
      );
      let list_dep = await Department.find(
        { com_id: com_id },
        { dep_id: 1, dep_name: 1 }
      );
      let listShare = await functions.pageFind(
        ShareCustomer,
        condition,
        { updatedAt: -1 },
        skip,
        pageSize
      );
      for (let i = 0; i < listShare.length; i++) {
        if (listShare[i].emp_id != 0) {
          let emp_name = list_emp.filter((e) => e.idQLC == listShare[i].emp_id);
          if (emp_name && emp_name.length > 0) {
            listShare[i].emp_name = emp_name[0].userName;
          } else {
            listShare[i].emp_name = "";
          }
        } else if (listShare[i].dep_id != 0) {
          let dep_name = list_dep.filter(
            (e) => e.dep_id == listShare[i].dep_id
          );
          if (dep_name && dep_name.length > 0) {
            listShare[i].dep_name = dep_name[0].dep_name;
          } else {
            listShare[i].dep_name = "";
          }
        }
      }
      let total = await functions.findCount(ShareCustomer, condition);
      return functions.success(res, "get list share success: ", {
        total,
        data: listShare,
      });
    }
    return functions.setError(res, "Missing input cus_id!");
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteShare = async (req, res) => {
  try {
    let _id = req.body._id;
    if (_id) {
      let delete_share = await ShareCustomer.findOneAndDelete({
        _id: Number(_id),
      });
      if (delete_share) {
        return functions.success(res, "delete share customer success");
      }
      return functions.setError(res, "Share customer not found!", 400);
    }
    return functions.setError(res, "Missing input _id!");
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

///-------------------------------------------------------------
exports.showDetailPotential = async (req, res) => {
  try {
    const { cus_id } = req.body;
    const dataUser = (comId = req.user.data);

    if (!cus_id) {
      return functions.setError(res, "Thiếu trường", 400);
    } else {
      if (typeof cus_id !== "number" && isNaN(Number(cus_id))) {
        return functions.setError(res, "cus_id phải là 1 số", 400);
      }
      if (dataUser.type !== 1 && dataUser.type !== 2) {
        return functions.setError(res, "Bạn không có quyền", 400);
      }

      const history = await diary_potential
        .find({
          id_action: Number(cus_id),
        })
        .sort({ create_at: -1 });

      const dataPotential = await Customer.findOne(
        {
          cus_id: Number(cus_id),
          type: 3,
        },
        {
          is_delete: 0,
          type: 0,
          deb_limit: 0,
          number_of_day_owed: 0,
          contact_gender: 0,
          cmnd_ccnd_address: 0,
          cmnd_ccnd_time: 0,
          cmnd_ccnd_number: 0,
        }
      )
        .populate({
          path: "potential_id",
          model: "CRM_potential",
          options: { lean: true },
          localField: "potential_id",
          foreignField: "potential_id",
        })
        .populate({
          path: "emp_id",
          model: Users,
          options: { lean: true },
          localField: "emp_id",
          select: "userName",
          foreignField: "idQLC",
        });
      return functions.success(res, "get data success", {
        data: dataPotential,
        history,
      });
    }
  } catch (err) {
    console.log("Err", err);
    return functions.setError(res, err);
  }
};
