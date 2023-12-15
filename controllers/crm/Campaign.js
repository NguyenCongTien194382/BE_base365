let functions = require("../../services/functions");
let Campaign = require("../../models/crm/Campaign/Campaign");
const CustomerCampaign = require("../../models/crm/Campaign/customer_campaign");
const customer_chance = require("../../models/crm/Customer/customer_chance");
const ShareCampaign = require("../../models/crm/tbl_share_campaign");
const order = require("../../models/crm/Order/order");
const Users = require("../../models/Users");
const Department = require("../../models/qlc/Deparment");

exports.listCampaign = async (req, res) => {
  try {
    let com_id = req.user.data.com_id;
    let { page, pageSize, fromDate, toDate, keyword, status, empID } = req.body;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    let condition = { companyID: com_id, is_delete: 0, $or: [] };
    if (keyword) {
      condition.$or.push({ nameCampaign: new RegExp(keyword, "i") });
      if (typeof Number(keyword) === "number" && !isNaN(Number(keyword))) {
        condition.$or.push({ _id: Number(keyword) });
      }
    } else {
      condition.$or.push({});
    }
    // tu ngay den ngay
    fromDate = functions.convertTimestamp(fromDate);
    toDate = functions.convertTimestamp(toDate);
    if (fromDate && !toDate) condition.createdAt = { $gte: fromDate };
    if (toDate && !fromDate) condition.createdAt = { $lte: toDate };
    if (toDate && fromDate)
      condition.createdAt = { $gte: fromDate, $lte: toDate };

    if (status) condition.status = Number(status);
    if (empID) condition.empID = Number(empID);
    // if (nameCampaign) condition.nameCampaign = new RegExp(nameCampaign, "i");

    let listCampaign = await Campaign.aggregate([
      { $match: condition },
      { $sort: { updatedAt: -1 } },
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
          shareAll: "$shareAll",
          companyID: "$companyID",
          countEmail: "$countEmail",
          description: "$description",
          type: "$type",
          userIdCreate: "$userIdCreate",
          userIdUpdate: "$userIdUpdate",
          site: "$site",
          isDelete: "$isDelete",
          hidden_null: "$hidden_null",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          name_emp: "$Employee.userName",
        },
      },
    ]);
    let total = await functions.findCount(Campaign, condition);
    return functions.success(res, "get list campaign success:", {
      total,
      data: listCampaign,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.createCampaign = async (req, res) => {
  try {
    let {
      nameCampaign,
      status,
      typeCampaign,
      timeStart,
      timeEnd,
      money,
      expectedSales,
      chanelCampaign,
      investment,
      empID,
      shareAll,
      description,
    } = req.body;
    if (nameCampaign) {
      const timeStartConvert = timeStart
        ? functions.convertTimestamp(timeStart)
        : 0;
      const timeEndConvert = timeEnd ? functions.convertTimestamp(timeEnd) : 0;
      let new_id = await functions.getMaxIdByField(Campaign, "_id");
      let com_id = req.user.data.com_id;
      let userIdCreate = 0;
      userIdCreate = req.user.data.idQLC;
      let time = functions.convertTimestamp(Date.now());
      let new_campaign = new Campaign({
        _id: new_id,
        nameCampaign: nameCampaign,
        status: status || 0,
        typeCampaign: typeCampaign || 0,
        timeStart: timeStartConvert,
        timeEnd: timeEndConvert,
        money: money || 0,
        expectedSales: expectedSales || 0,
        chanelCampaign: chanelCampaign || 0,
        investment: investment || 0,
        empID: empID || 0,
        shareAll: shareAll || 0,
        companyID: com_id,
        description: description,
        userIdCreate: userIdCreate,
        createdAt: time,
        updatedAt: time,
      });

      await new_campaign.save();
      return functions.success(res, "create campaign success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.editCampaign = async (req, res) => {
  try {
    let {
      nameCampaign,
      status,
      typeCampaign,
      timeStart,
      timeEnd,
      money,
      expectedSales,
      chanelCampaign,
      investment,
      empID,
      shareAll,
      description,
      cam_id,
    } = req.body;

    if (cam_id && nameCampaign) {
      let time = functions.convertTimestamp(Date.now());
      let com_id = req.user.data.com_id;
      const timeStartConvert = timeStart
        ? functions.convertTimestamp(timeStart)
        : 0;
      const timeEndConvert = timeEnd ? functions.convertTimestamp(timeEnd) : 0;
      const dataUpdate = await Campaign.findOneAndUpdate(
        { _id: cam_id, companyID: req.user.data.com_id },
        {
          nameCampaign: nameCampaign,
          status: status || 0,
          typeCampaign: typeCampaign || 0,
          timeStart: timeStartConvert,
          timeEnd: timeEndConvert,
          money: money || 0,
          expectedSales: expectedSales || 0,
          chanelCampaign: chanelCampaign || 0,
          investment: investment || 0,
          empID: empID || 0,
          shareAll: shareAll || 0,
          companyID: com_id,
          description: description,
          updatedAt: time,
        }
      );

      return functions.success(res, "Edit Campaign Successfully");
    } else {
      return functions.setError(res, "Missing input value!", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { cam_id } = req.body;
    if (cam_id) {
      await Campaign.findOneAndUpdate(
        {
          _id: cam_id,
          companyID: req.user.data.com_id,
        },
        {
          $set: {
            is_delete: 1,
          },
        }
      );

      return functions.success(res, "Delete Campaign Successfully");
    } else {
      return functions.setError(res, "Missing cam_id value", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.showDetailCustomer = async (req, res) => {
  try {
    const { cam_id, status, name, page = 1, pageSize = 10, type } = req.body;
    if (!cam_id) {
      return functions.setError(res, "Missing input value!", 400);
    }

    const matchPipeline = [
      {
        $match: {
          campaign_id: Number(cam_id),
          company_id: req.user.data.com_id,
        },
      },
    ];

    const countPipeline = [...matchPipeline];

    const skip = (page - 1) * pageSize;

    const dataPipeline = [
      ...matchPipeline,
      {
        $lookup: {
          from: "CRM_customer",
          let: { cus_id: "$cus_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$cus_id", "$$cus_id"],
                },
              },
            },
          ],
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(pageSize),
      },
    ];

    if (status) {
      dataPipeline.push({
        $match: { status: Number(status) },
      });
    }

    if (name) {
      dataPipeline.push({
        $match: {
          "customerDetails.name": {
            $regex: new RegExp(name, "i"),
          },
        },
      });
    }

    if (type) {
      // type = 3 => Potential
      dataPipeline.push({
        $match: {
          "customerDetails.type": {
            $match: { type: Number(type) },
          },
        },
      });
    }

    const [data, count] = await Promise.all([
      CustomerCampaign.aggregate(dataPipeline),
      CustomerCampaign.aggregate(countPipeline).count("count"),
    ]);

    if (data.length > 0) {
      return functions.success(res, "Get data successfully! ", {
        data,
        count: count.length > 0 ? count[0].count : 0, // Sử dụng countDocuments
      });
    } else {
      return functions.setError(
        res,
        "No customers found for the given campaign_id",
        404
      );
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.updateStatusCustomerCampaign = async (req, res) => {
  try {
    const { cam_id, cus_id, status, note } = req.body;

    if (cam_id && cus_id) {
      const dataUpdate = await CustomerCampaign.findOneAndUpdate(
        {
          campaign_id: Number(cam_id),
          cus_id: Number(cus_id),
          company_id: req.user.data.com_id,
        },
        {
          $set: {
            status: status ? Number(status) : 0,
            note: note ? note : null,
          },
        },
        { new: true }
      );

      if (dataUpdate) {
        return functions.success(res, "Update status successfully!", {
          data: dataUpdate,
        });
      } else {
        return functions.setError(
          res,
          "No matching record found for the given campaign_id and cus_id",
          404
        );
      }
    } else {
      return functions.setError(res, "Missing input value!", 400);
    }
  } catch (err) {
    return functions.setError(res, "Internal Server Error", 500);
  }
};

exports.assignmentCampaign = async (req, res) => {
  try {
    const { cam_id, cus_id, emp_id } = req.body;

    if (cam_id && cus_id && emp_id) {
      const dataUpdate = await CustomerCampaign.findOneAndUpdate(
        {
          campaign_id: Number(cam_id),
          cus_id: Number(cus_id),
          company_id: req.user.data.com_id,
        },
        { $set: { emp_id: Number(emp_id) } },
        { new: true }
      );

      if (dataUpdate) {
        return functions.success(res, "Update assignment successfully!", {
          data: dataUpdate,
        });
      } else {
        return functions.setError(
          res,
          "No matching record found for the given campaign_id and cus_id",
          404
        );
      }
    } else {
      return functions.setError(res, "Missing input value!", 400);
    }
  } catch (err) {
    return functions.setError(res, "Internal Server Error", 500);
  }
};

// Xoá khách hàng trong chiến dịch:
exports.delteCustomerCampaign = async (req, res) => {
  try {
    const { cam_id, customer_ids } = req.body;

    if (!cam_id || !customer_ids || !Array.isArray(customer_ids)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Xóa khách hàng của chiến dịch
    const result = await CustomerCampaign.deleteMany({
      campaign_id: Number(cam_id),
      cus_id: { $in: customer_ids },
      company_id: req.user.data.com_id,
    });

    if (result.deletedCount > 0) {
      return res.json({
        message: `Deleted ${result.deletedCount} customers successfully`,
      });
    } else {
      return res.status(404).json({ error: "No matching customers found" });
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.showDetailCampaign = async (req, res) => {
  try {
    const { cam_id } = req.body;
    if (cam_id) {
      const data = await Campaign.findOne({
        _id: cam_id,
        companyID: req.user.data.com_id,
        is_delete: 0,
      }).lean();
      if (data) {
        return functions.success(res, "Get campaign successfully", { data });
      } else {
        return functions.setError(res, "No matching campaign found", 400);
      }
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.getInfoAccordingChanceAndOrder = async (req, res) => {
  try {
    const { campaign_id } = req.body;

    const customerCampaignSummary = await CustomerCampaign.aggregate([
      {
        $match: {
          campaign_id: Number(campaign_id),
          company_id: req.user.data.idQLC,
        },
      },
      {
        $group: {
          _id: null,
          not_contacted: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", [0, 1]],
                },
                1,
                0,
              ],
            },
          },
          contacted: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
          not_invited: { $sum: { $cond: [{ $eq: ["$status", 3] }, 1, 0] } },
          invited: { $sum: { $cond: [{ $eq: ["$status", 4] }, 1, 0] } },
          received: { $sum: { $cond: [{ $eq: ["$status", 5] }, 1, 0] } },
          opened: { $sum: { $cond: [{ $eq: ["$status", 6] }, 1, 0] } },
          confirmation: { $sum: { $cond: [{ $eq: ["$status", 7] }, 1, 0] } },
          not_contacted_successfully: {
            $sum: { $cond: [{ $eq: ["$status", 8] }, 1, 0] },
          },
          participated: { $sum: { $cond: [{ $eq: ["$status", 9] }, 1, 0] } },
          not_interested: { $sum: { $cond: [{ $eq: ["$status", 10] }, 1, 0] } },
          total_customer: { $sum: 1 },
        },
      },
    ]);

    const chanceSummary = await customer_chance.aggregate([
      {
        $match: {
          campaign_id: Number(campaign_id),
          com_id: req.user.data.idQLC,
        },
      },
      {
        $lookup: {
          from: "CRM_product_chance",
          localField: "id",
          foreignField: "chance_id",
          as: "chance_details",
        },
      },
      {
        $unwind: { path: "$chance_details", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: null,
          in_progress: {
            $sum: { $cond: [{ $eq: ["$stages", 1] }, 1, 0] },
          },
          victory: { $sum: { $cond: [{ $eq: ["$result", 1] }, 1, 0] } },
          failure: { $sum: { $cond: [{ $eq: ["$result", 2] }, 1, 0] } },
          total_value_chance: { $sum: "$chance_details.total" },
        },
      },
    ]);

    const orderSummary = await order.aggregate([
      {
        $match: {
          campaign_id: Number(campaign_id),
          com_id: req.user.data.idQLC,
        },
      },
      {
        $group: {
          _id: null,
          pending_approval: {
            $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] },
          },
          approved: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", 3] }, 1, 0] } },
          total_value_order: { $sum: "$price_order" },
        },
      },
    ]);

    const result = {
      customerCampaignSummary: customerCampaignSummary[0] || {},
      chanceSummary: chanceSummary[0] || {},
      orderSummary: orderSummary[0] || {},
    };

    return functions.success(res, "Get data successfully", { data: result });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

//-----------------------------danh sach chia se

exports.createShareCampaign = async (req, res, next) => {
  try {
    let { arr_emp, arr_dep, arr_campaign, role, share_related_list } = req.body;
    let user_id = req.user.data.idQLC;
    let user_type = req.user.data.type;
    if (
      arr_campaign &&
      Array.isArray(arr_campaign) &&
      arr_campaign.length > 0 &&
      role
    ) {
      let time = functions.convertTimestamp(Date.now());
      for (let i = 0; i < arr_campaign.length; i++) {
        //share customer for department
        if (arr_dep && Array.isArray(arr_dep)) {
          for (let j = 0; j < arr_dep.length; j++) {
            let check_exist = await ShareCampaign.findOne({
              campaign_id: arr_campaign[i],
              dep_id: arr_dep[j],
            });
            if (!check_exist) {
              let id_new = await functions.getMaxIdByField(
                ShareCampaign,
                "_id"
              );
              let new_share = new ShareCampaign({
                _id: id_new,
                campaign_id: arr_campaign[i],
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
              await ShareCampaign.findOneAndUpdate(
                { campaign_id: arr_campaign[i], dep_id: arr_dep[j] },
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
            let check_exist = await ShareCampaign.findOne({
              campaign_id: arr_campaign[i],
              emp_id: arr_emp[j],
            });
            if (!check_exist) {
              let id_new = await functions.getMaxIdByField(
                ShareCampaign,
                "_id"
              );
              let new_share = new ShareCampaign({
                _id: id_new,
                campaign_id: arr_campaign[i],
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
              await ShareCampaign.findOneAndUpdate(
                { campaign_id: arr_campaign[i], emp_id: arr_emp[j] },
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
      return functions.success(res, "create share campaign success!");
    }
    return functions.setError(res, "Missing input value!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.listShareCampaign = async (req, res) => {
  try {
    let { campaign_id, page, pageSize } = req.body;
    let com_id = req.user.data.com_id;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    page = Number(page);
    pageSize = Number(pageSize);
    const skip = (page - 1) * pageSize;

    if (campaign_id) {
      campaign_id = Number(campaign_id);
      let condition = { campaign_id: campaign_id };
      let list_emp = await Users.find(
        { "inForPerson.employee.com_id": com_id },
        { idQLC: 1, userName: 1 }
      );
      let list_dep = await Department.find(
        { com_id: com_id },
        { dep_id: 1, dep_name: 1 }
      );
      let listShare = await functions.pageFind(
        ShareCampaign,
        condition,
        { _id: -1 },
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
      let total = await functions.findCount(ShareCampaign, condition);
      return functions.success(res, "get list share success: ", {
        total,
        data: listShare,
      });
    }
    return functions.setError(res, "Missing input campaign_id!");
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteShareCampaign = async (req, res) => {
  try {
    let _id = req.body._id;
    if (_id) {
      let delete_share = await ShareCampaign.findOneAndDelete({
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
