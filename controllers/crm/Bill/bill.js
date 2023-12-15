const functions = require("../../../services/functions");
const CRMBill = require("../../../models/crm/Bill/bill");
const product_bill = require("../../../models/crm/Bill/product_bill");
const Bill_diary = require("../../../models/crm/Diary/diary_bill");

const totalMoneyCalculate = (
  product_ids,
  discount_rates,
  prices,
  counts,
  tax_rates
) => {
  let total = 0;
  const totalMap = product_ids.map((prod_id, index) => {
    const discount = discount_rates[index] || 0;
    const price = prices[index] || 0;
    const count = counts[index] || 0;

    const product_cost = price * count;
    const money_discount = price * count * (discount / 100);
    const money_tax =
      (price * count - price * count * (discount / 100)) *
      (tax_rates[index] / 100);
    const productTotal = price * count + money_tax - money_discount;

    total += productTotal;
  });
  return total;
};

exports.addBill = async (req, res) => {
  try {
    const {
      cus_id,
      bank_account,
      bank_create_at,
      tax_code,
      buyer,
      order_id,
      email_reciever,
      phone_reciever,
      type,
      payment_type,
      date,
      campaign_id,
      user_confirm,
      is_convert_paper_bill,
      status,
      bill_country,
      bill_city,
      bill_district,
      bill_ward,
      bill_street,
      bill_area_code,
      bill_address,
      description,
      share_all,
      bill_discount_money,
      bill_discount_rate,
      name,
      status_send,
    } = req.body;

    const productData = req.body.productData;
    const { product_ids, counts, dvts, tax_rates, discount_rates, prices } =
      productData;

    const createAt = new Date();
    const totalMoney = totalMoneyCalculate(
      product_ids,
      discount_rates,
      prices,
      counts,
      tax_rates
    );

    const maxID = await CRMBill.find().sort({ _id: -1 }).limit(1).lean();
    const discount_money =
      bill_discount_rate || !bill_discount_money
        ? 0
        : bill_discount_money !== 0
        ? bill_discount_money
        : 0;
    const discount_rate = bill_discount_rate || 0;
    const total = totalMoney || 0;
    const bill_total =
      Number(discount_rate) !== 0
        ? total - total * (discount_rate / 100)
        : total - discount_money;
    const newBill = new CRMBill({
      _id: maxID?.length !== 0 ? Number(maxID[0]?._id) + 1 : 1,
      cus_id: cus_id || 0,
      bank_account: bank_account || 0,
      bank_create_at: bank_create_at || 0,
      tax_code: tax_code || 0,
      buyer: buyer || 0,
      order_id: order_id || 0,
      email_reciever: email_reciever || null,
      phone_reciever: phone_reciever || null,
      type: type || 0,
      payment_type: payment_type || 0,
      date: date || 0,
      campaign_id: campaign_id || 0,
      com_id: req.user.data.com_id,
      user_confirm: user_confirm || 0,
      emp_id: req.user.data.idQLC,
      is_convert_paper_bill: is_convert_paper_bill || 0,
      status: status || 0,
      bill_country: bill_country || 0,
      bill_city: bill_city || 0,
      bill_district: bill_district || 0,
      bill_ward: bill_ward || 0,
      bill_street: bill_street || null,
      bill_area_code: bill_area_code || 0,
      bill_address: bill_address || null,
      description: description || null,
      share_all: share_all || null,
      bill_discount_money:
        bill_discount_rate || !bill_discount_money
          ? 0
          : bill_discount_money !== 0
          ? bill_discount_money
          : 0,
      bill_discount_rate: bill_discount_rate || 0,
      total_money: bill_total || 0,
      user_create_id: req.user.data.idQLC,
      name,
      status_send,
      create_at: createAt.getTime(),
    });

    const savedBill = await newBill.save();

    const idDiary = await Bill_diary.find().sort({ _id: -1 }).limit(1).lean();
    const currentDate = new Date();
    const dateAsNumber = currentDate.getTime();
    const newDiary = new Bill_diary({
      emp_id: req.user.data.idQLC,
      action: 3,
      id_action: savedBill._id,
      _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
      create_at: dateAsNumber,
    });

    await newDiary.save();

    if (!product_ids || !savedBill._id) {
      return functions.setError(
        res,
        "Missing product_ids value or bill_id value :)))",
        400
      );
    }

    const maxIdResult = await product_bill.findOne().sort({ _id: -1 }).limit(1);
    const maxId = maxIdResult ? maxIdResult._id : 0;

    const bulkOperations = product_ids.map((prod_id, index) => {
      const newId = maxId + 1 + index;
      const discount = discount_rates[index] || 0;
      const price = prices[index] || 0;
      const count = counts[index] || 0;

      const product_cost = price * count;
      const money_discount = price * count * (discount / 100);
      const money_tax =
        (price * count - price * count * (discount / 100)) *
        (tax_rates[index] / 100);
      const total = price * count + money_tax - money_discount;

      return {
        updateOne: {
          filter: {
            product_id: prod_id,
            bill_id: savedBill._id,
            company_id: req.user.data.com_id,
          },
          update: {
            $set: {
              product_id: prod_id,
              bill_id: savedBill._id,
              count,
              dvt: dvts[index] || 0,
              tax_rate: tax_rates[index] || 0,
              discount_rate: discount,
              price,
              product_cost,
              money_discount,
              money_tax,
              total,
            },
            $setOnInsert: { _id: newId, company_id: req.user.data.com_id },
          },
          upsert: true,
        },
      };
    });

    await product_bill.bulkWrite(bulkOperations);

    return res
      .status(200)
      .json({ success: true, message: "Add bill and product successfully" });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.editBill = async (req, res) => {
  try {
    const billID = req.body.id;

    const {
      cus_id,
      name,
      bank_account,
      bank_create_at,
      tax_code,
      buyer,
      order_id,
      email_reciever,
      phone_reciever,
      type,
      payment_type,
      date,
      campaign_id,
      user_confirm,
      is_convert_paper_bill,
      status,
      bill_country,
      bill_city,
      bill_district,
      bill_ward,
      bill_street,
      bill_area_code,
      bill_address,
      description,
      share_all,
      bill_discount_money,
      bill_discount_rate,
      status_send,
    } = req.body;

    const productData = req.body.productData;

    const exitsData = await CRMBill.findOne({
      _id: Number(billID),
      com_id: req.user.data.com_id,
      is_delete: 0,
    });

    let updatedBill = null;

    if (productData) {
      const { product_ids, counts, dvts, tax_rates, discount_rates, prices } =
        productData;

      const total_money = totalMoneyCalculate(
        product_ids,
        discount_rates,
        prices,
        counts,
        tax_rates
      );

      const discount_money =
        bill_discount_rate || !bill_discount_money
          ? 0
          : bill_discount_money !== 0
          ? bill_discount_money
          : 0;
      const discount_rate = bill_discount_rate || 0;
      const total = total_money || 0;
      const bill_total =
        Number(discount_rate) !== 0
          ? total - total * (discount_rate / 100)
          : total - discount_money;

      updatedBill = await CRMBill.findOneAndUpdate(
        { _id: Number(billID), com_id: req.user.data.com_id, is_delete: 0 },
        {
          $set: {
            cus_id,
            bank_account,
            bank_create_at,
            tax_code,
            buyer,
            order_id,
            email_reciever,
            phone_reciever,
            type,
            payment_type,
            date,
            campaign_id,
            user_confirm,
            is_convert_paper_bill,
            status,
            bill_country,
            bill_city,
            bill_district,
            bill_ward,
            bill_street,
            bill_area_code,
            bill_address,
            description,
            share_all,
            bill_discount_money:
              bill_discount_rate !== 0 && bill_discount_rate
                ? 0
                : bill_discount_money !== 0
                ? bill_discount_money
                : exitsData?.bill_discount_money,
            bill_discount_rate:
              !bill_discount_rate && bill_discount_money
                ? 0
                : bill_discount_rate
                ? bill_discount_rate
                : exitsData?.bill_discount_rate,
            total_money:
              bill_discount_money || bill_discount_rate || total_money
                ? bill_total
                : exitsData?.total_money,
            com_id: req.user.data.com_id,
            emp_id: req.user.data.idQLC,
            name,
            status_send,
          },
        },
        { new: true }
      );

      if (!product_ids || !billID) {
        return functions.setError(
          res,
          "Missing product_ids value or bill_id value :)))",
          400
        );
      }

      const maxIdResult = await product_bill
        .findOne()
        .sort({ _id: -1 })
        .limit(1);
      const maxId = maxIdResult ? maxIdResult._id : 0;

      const bulkOperations = product_ids.map((prod_id, index) => {
        const newId = maxId + 1 + index;
        const discount = discount_rates[index] || 0;
        const price = prices[index] || 0;
        const count = counts[index] || 0;

        const product_cost = price * count;
        const money_discount = price * count * (discount / 100);
        const money_tax =
          (price * count - price * count * (discount / 100)) *
          (tax_rates[index] / 100);
        const total = price * count + money_tax - money_discount;

        return {
          updateOne: {
            filter: {
              product_id: prod_id,
              bill_id: Number(billID),
              company_id: req.user.data.com_id,
            },
            update: {
              $set: {
                product_id: prod_id,
                bill_id: billID,
                count,
                dvt: dvts[index] || 0,
                tax_rate: tax_rates[index] || 0,
                discount_rate: discount,
                price,
                product_cost,
                money_discount,
                money_tax,
                total,
              },
              $setOnInsert: { _id: newId, company_id: req.user.data.com_id },
            },
            upsert: true,
          },
        };
      });

      await product_bill.bulkWrite(bulkOperations);
    } else {
      updatedBill = await CRMBill.findOneAndUpdate(
        { _id: Number(billID), com_id: req.user.data.com_id, is_delete: 0 },
        {
          $set: {
            cus_id,
            bank_account,
            bank_create_at,
            tax_code,
            buyer,
            order_id,
            email_reciever,
            phone_reciever,
            type,
            payment_type,
            date,
            campaign_id,
            user_confirm,
            is_convert_paper_bill,
            status,
            bill_country,
            bill_city,
            bill_district,
            bill_ward,
            bill_street,
            bill_area_code,
            bill_address,
            description,
            share_all,
            emp_id: req.user.data.idQLC,
            name,
            status_send,
          },
        },
        { new: true }
      );
    }

    if (!updatedBill) {
      return res.status(404).json({ error: "bill not found" });
    }

    const idDiary = await Bill_diary.find().sort({ _id: -1 }).limit(1).lean();
    const currentDate = new Date();
    const dateAsNumber = currentDate.getTime() / 1000;
    const newDiary = new Bill_diary({
      emp_id: req.user.data.idQLC,
      action: 0,
      id_action: Number(billID),
      _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
      create_at: dateAsNumber,
    });

    await newDiary.save();

    return functions.success(res, "Update bill successfully", {
      data: updatedBill,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const { bill_ids } = req.body;

    if (!Array.isArray(bill_ids) || bill_ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty bill_ids array" });
    }

    const deleteResult = await CRMBill.updateMany(
      {
        _id: { $in: bill_ids },
        com_id: req.user.data.com_id,
      },
      {
        $set: {
          is_delete: 1,
        },
      }
    );

    if (deleteResult.nModified === 0) {
      return res
        .status(404)
        .json({ error: "No matching bills found for deletion" });
    }

    const idDiary = await Bill_diary.find().sort({ _id: -1 }).limit(1).lean();
    for (let i = 0; i < bill_ids.length; i++) {
      const currentDate = new Date();
      const dateAsNumber = currentDate.getTime() / 1000;
      const newDiary = new Bill_diary({
        emp_id: req.user.data.idQLC,
        action: 1,
        id_action: bill_ids[i],
        _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 + i : 1,
        create_at: dateAsNumber,
      });

      await newDiary.save();
    }

    return functions.success(res, "Delete bills successfully");
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listBill = async (req, res) => {
  try {
    const {
      keyword,
      toDate,
      fromDate,
      status,
      campaign_id,
      page = 1,
      pageSize = 10,
      cus_id,
      order_id,
      shipment_status,
      status_send,
      toCreateAt,
      fromCreateAt,
    } = req.body;

    const searchConditions = {
      $or: [],
      com_id: req.user.data.com_id,
      is_delete: 0,
    };

    if (keyword) {
      if (typeof Number(keyword) === "number" && !isNaN(Number(keyword))) {
        searchConditions.$or.push({ _id: Number(keyword) });
      } else {
        searchConditions.$or.push({ name: new RegExp(keyword, "i") });
      }
    } else {
      searchConditions.$or.push({});
    }

    if (fromCreateAt && !toCreateAt)
      searchConditions.create_at = { $gte: fromCreateAt };
    if (toCreateAt && !fromCreateAt)
      searchConditions.create_at = { $lte: toCreateAt };
    if (toCreateAt && fromCreateAt)
      searchConditions.date = { $gte: fromDate, $lte: toCreateAt };

    if (fromDate && !toDate) searchConditions.date = { $gte: fromDate };
    if (toDate && !fromDate) searchConditions.date = { $lte: toDate };
    if (toDate && fromDate)
      searchConditions.date = { $gte: fromDate, $lte: toDate };

    if (status) searchConditions.status = status;

    if (shipment_status)
      searchConditions.shipment_status = Number(shipment_status);

    if (status_send) searchConditions.status_send = Number(status_send);

    if (campaign_id) searchConditions.campaign_id = campaign_id;

    if (order_id) searchConditions.order_id = order_id;

    if (cus_id) searchConditions.cus_id = cus_id;

    const startIndex = (page - 1) * pageSize;
    let bills = [];
    if (searchConditions.$or.length > 0) {
      bills = await CRMBill.find(searchConditions)
        .skip(Number(startIndex))
        .limit(Number(pageSize))
        .sort({ updatedAt: -1 })
        .populate({
          path: "cus_id",
          model: "CRM_customer",
          options: { lean: true },
          select: "name",
          localField: "cus_id",
          foreignField: "cus_id",
        })
        .populate({
          path: "order_id",
          model: "CRM_Order",
          options: { lean: true },
          select:
            "date explain type status emp_id shipment_status payment_status real_revenue order_process_cost receiver description receiver_phone ship_deadline payment_deadline day_owned",
        })
        .lean();
    } else {
      delete searchConditions.$or;
      bills = await CRMBill.find(searchConditions)
        .skip(Number(startIndex))
        .limit(Number(pageSize))
        .sort({ updatedAt: -1 })
        .populate({
          path: "cus_id",
          model: "CRM_customer",
          options: { lean: true },
          select: "name",
          localField: "cus_id",
          foreignField: "cus_id",
        })
        .populate({
          path: "order_id",
          model: "CRM_Order",
          options: { lean: true },
          select:
            "date explain type status emp_id shipment_status payment_status real_revenue order_process_cost receiver description receiver_phone ship_deadline payment_deadline day_owned",
        })
        .lean();
    }

    const count = await CRMBill.countDocuments(searchConditions);

    return functions.success(res, "Get data successfully", {
      data: bills,
      count: count || 0,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.detailBill = async (req, res) => {
  try {
    const { bill_id } = req.body;
    if (bill_id) {
      const detailBill = await CRMBill.findOne({
        com_id: req.user.data.com_id,
        _id: bill_id,
        is_delete: 0,
      }).lean();
      if (detailBill) {
        const history = await Bill_diary.find({
          id_action: Number(bill_id),
        }).sort({ create_at: -1 });

        const data = await product_bill.aggregate([
          {
            $match: {
              bill_id: Number(bill_id),
              company_id: req.user.data.com_id,
            },
          },
          {
            $lookup: {
              from: "CRM_customer",
              localField: "cus_id",
              foreignField: "cus_id",
              as: "customer_infor",
            },
          },
          {
            $unwind: {
              path: "$customer_infor",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "CRM_Product",
              localField: "product_id",
              foreignField: "_id",
              as: "product_details",
            },
          },
          {
            $unwind: {
              path: "$product_details",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "CRM_product_bill",
              localField: "_id",
              foreignField: "_id",
              as: "bill_details",
            },
          },
          {
            $unwind: {
              path: "$bill_details",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "bill_details.bill_id": Number(bill_id),
              "bill_details.company_id": req.user.data.com_id,
            },
          },
          {
            $group: {
              _id: null,
              total_money: { $sum: "$total" },
              total_count: { $sum: "$count" },
              total_product_cost: { $sum: "$product_cost" },
              total_tax: { $sum: "$money_tax" },
              total_money_discount: { $sum: "$money_discount" },
              data: {
                $push: {
                  $mergeObjects: ["$product_details", "$bill_details"],
                },
              },
            },
          },
        ]);

        if (data.length > 0) {
          const result = data[0];
          return functions.success(res, "Get data successfully", {
            total_money: result.total_money || 0,
            total_count: result.total_count || 0,
            total_product_cost: result.total_product_cost || 0,
            total_tax: result.total_tax || 0,
            total_money_discount: result.total_money_discount || 0,
            data: result.data || [],
            detailBill,
            history,
          });
        }

        return functions.success(res, "Get data successfully", {
          total_money: 0,
          total_count: 0,
          total_product_cost: 0,
          total_tax: 0,
          total_money_discount: 0,
          data: [],
          detailBill,
          history,
        });
      }
      return functions.setError(res, "Bill not found", 404);
    }
    return functions.setError(res, "Missing bill_id value", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

// exports.addProductBill = async (req, res, productData) => {
//   try {
//     const {
//       product_ids,
//       bill_id,
//       counts,
//       dvts,
//       tax_rates,
//       discount_rates,
//       prices,
//     } = productData || req.body;

//     if (!product_ids || !bill_id) {
//       return functions.setError(
//         res,
//         "Missing product_ids value or bill_id value :))) ",
//         400
//       );
//     }

//     const maxIdResult = await product_bill.findOne().sort({ _id: -1 }).limit(1);
//     const maxId = maxIdResult ? maxIdResult._id : 0;

//     const bulkOperations = product_ids.map((prod_id, index) => {
//       const newId = maxId + 1 + index;
//       const discount = discount_rates[index] || 0;
//       const price = prices[index] || 0;
//       const count = counts[index] || 0;

//       const product_cost = price * count;
//       const money_discount = price * count * (discount / 100);
//       const money_tax =
//         (price * count - price * count * (discount / 100)) *
//         (tax_rates[index] / 100);
//       const total = price * count + money_tax - money_discount;

//       return {
//         updateOne: {
//           filter: {
//             product_id: prod_id,
//             bill_id,
//             company_id: req.user.data.com_id,
//           },
//           update: {
//             $set: {
//               product_id: prod_id,
//               bill_id,
//               count,
//               dvt: dvts[index] || 0,
//               tax_rate: tax_rates[index] || 0,
//               discount_rate: discount,
//               price,
//               product_cost,
//               money_discount,
//               money_tax,
//               total,
//             },
//             $setOnInsert: { _id: newId, company_id: req.user.data.com_id },
//           },
//           upsert: true,
//         },
//       };
//     });

//     await product_bill.bulkWrite(bulkOperations);
//     return res
//       .status(200)
//       .json({ success: true, message: "Add product successfully" });
//   } catch (err) {
//     return functions.setError(res, err.message);
//   }
// };

// exports.listProductBill = async (req, res) => {
//   try {
//     const { bill_id } = req.body;
//     if (!bill_id) {
//       return functions.setError(res, "Missing bill_id value", 400);
//     }

//     const data = await product_bill.aggregate([
//       {
//         $match: {
//           bill_id: Number(bill_id),
//           company_id: req.user.data.com_id,
//         },
//       },
//       {
//         $lookup: {
//           from: "CRM_Product",
//           localField: "product_id",
//           foreignField: "_id",
//           as: "product_details",
//         },
//       },
//       {
//         $unwind: "$product_details",
//       },
//       {
//         $lookup: {
//           from: "CRM_product_bill",
//           localField: "_id",
//           foreignField: "_id",
//           as: "bill_details",
//         },
//       },
//       {
//         $unwind: {
//           path: "$bill_details",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           "bill_details.bill_id": Number(bill_id),
//           "bill_details.company_id": req.user.data.com_id,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           total_money: { $sum: "$total" },
//           total_count: { $sum: "$count" },
//           total_product_cost: { $sum: "$product_cost" },
//           total_tax: { $sum: "$money_tax" },
//           total_money_discount: { $sum: "$money_discount" },
//           data: {
//             $push: {
//               $mergeObjects: ["$product_details", "$bill_details"],
//             },
//           },
//         },
//       },
//     ]);

//     if (data.length > 0) {
//       const result = data[0];
//       return functions.success(res, "Get data successfully", {
//         total_money: result.total_money || 0,
//         total_count: result.total_count || 0,
//         total_product_cost: result.total_product_cost || 0,
//         total_tax: result.total_tax || 0,
//         total_money_discount: result.total_money_discount || 0,
//         data: result.data || [],
//       });
//     }

//     return functions.success(res, "No data found", {
//       total_money: 0,
//       total_count: 0,
//       total_product_cost: 0,
//       total_tax: 0,
//       total_money_discount: 0,
//       data: [],
//     });
//   } catch (err) {
//     return functions.setError(res, err.message);
//   }
// };

exports.deleteProductBill = async (req, res) => {
  try {
    const { bill_ids, prod_ids } = req.body;

    if (
      Array.isArray(bill_ids) &&
      Array.isArray(prod_ids) &&
      bill_ids.length > 0 &&
      prod_ids.length > 0
    ) {
      await product_bill.deleteMany({
        bill_id: { $in: bill_ids.map(Number) },
        product_id: { $in: prod_ids.map(Number) },
        company_id: req.user.data.com_id,
      });

      return functions.success(res, "Delete successfully");
    }

    return functions.setError(res, "Missing or invalid input values", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
