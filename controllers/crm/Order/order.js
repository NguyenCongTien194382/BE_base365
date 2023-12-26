const functions = require("../../../services/functions");
const CRMOrderModel = require("../../../models/crm/Order/order");
const product_order = require("../../../models/crm/Order/product_order");
const diary_order = require("../../../models/crm/Diary/diary_orders");
const customer = require("../../../models/crm/Customer/customer");
const users = require("../../../models/Users")

const discount_money_value = (bill_discount_rate, bill_discount_money) => {
  const discount_money =
    bill_discount_rate || !bill_discount_money
      ? 0
      : bill_discount_money !== 0
        ? bill_discount_money
        : 0;
  return discount_money;
};

const total_money_value = (discount_rate, total, discount_money) => {
  const bill_total =
    Number(discount_rate) !== 0
      ? total - total * (discount_rate / 100)
      : total - discount_money;
  return bill_total;
};

const total_money_value_without_discount = (
  discount_rate,
  total,
  discount_money
) => {
  const bill_total =
    Number(discount_rate) !== 0
      ? total + total * (discount_rate / 100)
      : total + discount_money;
  return bill_total;
};

// Tong tien cua Product
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

exports.addOrder = async (req, res) => {
  try {
    const {
      date,
      cus_id,
      contact_id,
      price_info_id,
      chance_id,
      campaign_id,
      explain,
      type,
      day_owned,
      ship_deadline,
      payment_deadline,
      emp_id,
      price_order,
      status,
      shipment_status,
      real_revenue,
      order_process_cost,
      export_bill,
      payment_status,
      bill_cus_id,
      bill_buyer,
      bill_country,
      bill_city,
      bill_district,
      bill_ward,
      bill_street,
      bill_area_code,
      bill_address,
      bill_email,
      receiver,
      receiver_phone,
      receiver_country,
      receiver_district,
      receiver_ward,
      receiver_area_code,
      receiver_street,
      receiver_address,
      description,
      share_all,
      order_discount_rate,
      order_discount_money,
      quote_id
    } = req.body;

    const maxID = await CRMOrderModel.find().sort({ _id: -1 }).limit(1).lean();

    const productData = req.body.productData;
    const { product_ids, counts, dvts, tax_rates, discount_rates, prices } =
      productData;

    const totalMoney = totalMoneyCalculate(
      product_ids,
      discount_rates,
      prices,
      counts,
      tax_rates
    );

    const discount_money = discount_money_value(
      order_discount_rate,
      order_discount_money
    );
    const discount_rate = order_discount_rate || 0;
    const total = totalMoney || 0;
    const order_total = total_money_value(discount_rate, total, discount_money);

    const newOrder = new CRMOrderModel({
      _id: maxID?.length !== 0 ? Number(maxID[0]?._id) + 1 : 1,
      date,
      cus_id,
      contact_id,
      price_info_id,
      chance_id,
      campaign_id,
      explain,
      type,
      com_id: req.user.data.com_id,
      day_owned,
      ship_deadline,
      payment_deadline,
      emp_id,
      price_order,
      status,
      shipment_status,
      real_revenue,
      order_process_cost,
      export_bill,
      payment_status,
      bill_cus_id,
      bill_buyer,
      bill_country,
      bill_city,
      bill_district,
      bill_ward,
      bill_street,
      bill_area_code,
      bill_address,
      bill_email,
      receiver,
      receiver_phone,
      receiver_country,
      receiver_district,
      receiver_ward,
      receiver_area_code,
      receiver_street,
      receiver_address,
      description,
      share_all,
      user_create_id: req.user.data.idQLC,
      order_discount_rate: order_discount_rate
        ? Number(order_discount_rate)
        : 0,
      order_discount_money: discount_money,
      total_money: order_total,
      quote_id
    });

    const savedOrder = await newOrder.save();

    const idDiary = await diary_order.find().sort({ _id: -1 }).limit(1).lean();
    const currentDate = new Date();
    const dateAsNumber = currentDate.getTime();
    const newDiary = new diary_order({
      emp_id: req.user.data.idQLC,
      action: 3,
      id_action: savedOrder._id,
      _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
      create_at: dateAsNumber,
    });

    await newDiary.save();

    if (!product_ids || !savedOrder._id) {
      return functions.setError(
        res,
        "Missing product_ids value or bill_id value :)))",
        400
      );
    }

    const maxIdResult = await product_order
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
            order_id: savedOrder._id,
            company_id: req.user.data.com_id,
          },
          update: {
            $set: {
              product_id: prod_id,
              order_id: savedOrder._id,
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

    await product_order.bulkWrite(bulkOperations);

    return functions.success(res, "Add new order successfully");
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.editOrder = async (req, res) => {
  try {
    const orderId = req.body.id;

    const {
      date,
      cus_id,
      contact_id,
      price_info_id,
      chance_id,
      campaign_id,
      explain,
      type,
      day_owned,
      ship_deadline,
      payment_deadline,
      emp_id,
      price_order,
      status,
      shipment_status,
      real_revenue,
      order_process_cost,
      export_bill,
      payment_status,
      bill_cus_id,
      bill_buyer,
      bill_country,
      bill_city,
      bill_district,
      bill_ward,
      bill_street,
      bill_area_code,
      bill_address,
      bill_email,
      receiver,
      receiver_phone,
      receiver_country,
      receiver_district,
      receiver_ward,
      receiver_area_code,
      receiver_street,
      receiver_address,
      description,
      share_all,
      order_discount_rate,
      order_discount_money,
      reason,
      quote_id
    } = req.body;

    const productData = req.body.productData;

    const exitData = await CRMOrderModel.findOne({
      _id: Number(orderId),
      com_id: req.user.data.com_id,
    });

    let updatedOrder = null;

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

      const discount_money = discount_money_value(
        order_discount_rate,
        order_discount_money
      );
      const discount_rate = order_discount_rate || 0;
      const total = total_money || 0;
      const order_total = total_money_value(
        discount_rate,
        total,
        discount_money
      );

      updatedOrder = await CRMOrderModel.findOneAndUpdate(
        { _id: Number(orderId), com_id: req.user.data.com_id },
        {
          $set: {
            date,
            cus_id,
            contact_id,
            price_info_id,
            chance_id,
            campaign_id,
            explain,
            type,
            com_id: req.user.data.com_id,
            day_owned,
            ship_deadline,
            payment_deadline,
            emp_id,
            price_order,
            status,
            shipment_status,
            real_revenue,
            order_process_cost,
            export_bill,
            payment_status,
            bill_cus_id,
            bill_buyer,
            bill_country,
            bill_city,
            bill_district,
            bill_ward,
            bill_street,
            bill_area_code,
            bill_address,
            bill_email,
            receiver,
            receiver_phone,
            receiver_country,
            receiver_district,
            receiver_ward,
            receiver_area_code,
            receiver_street,
            receiver_address,
            description,
            share_all,
            reason,
            order_discount_rate:
              !order_discount_rate && order_discount_money
                ? 0
                : order_discount_rate
                  ? order_discount_rate
                  : exitData?.order_discount_rate,
            order_discount_money:
              order_discount_rate && order_discount_rate !== 0
                ? 0
                : order_discount_money !== 0
                  ? order_discount_money
                  : exitData?.order_discount_money,
            total_money:
              total_money || order_discount_rate || order_discount_money
                ? order_total
                : exitData?.total_money,
          },
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!product_ids || !orderId) {
        return functions.setError(
          res,
          "Missing product_ids value or bill_id value :)))",
          400
        );
      }

      const maxIdResult = await product_order
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
              order_id: orderId,
              company_id: req.user.data.com_id,
            },
            update: {
              $set: {
                product_id: prod_id,
                order_id: orderId,
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

      await product_order.bulkWrite(bulkOperations);
    } else {
      updatedOrder = await CRMOrderModel.findOneAndUpdate(
        { _id: Number(orderId), com_id: req.user.data.com_id },
        {
          $set: {
            date,
            cus_id,
            contact_id,
            price_info_id,
            chance_id,
            campaign_id,
            explain,
            type,
            com_id: req.user.data.com_id,
            day_owned,
            ship_deadline,
            payment_deadline,
            emp_id,
            price_order,
            status,
            shipment_status,
            real_revenue,
            order_process_cost,
            export_bill,
            payment_status,
            bill_cus_id,
            bill_buyer,
            bill_country,
            bill_city,
            bill_district,
            bill_ward,
            bill_street,
            bill_area_code,
            bill_address,
            bill_email,
            receiver,
            receiver_phone,
            receiver_country,
            receiver_district,
            receiver_ward,
            receiver_area_code,
            receiver_street,
            receiver_address,
            description,
            share_all,
            reason,
          },
        },
        { new: true }
      );
    }

    const idDiary = await diary_order.find().sort({ _id: -1 }).limit(1).lean();
    const currentDate = new Date();
    const dateAsNumber = currentDate.getTime();
    const newDiary = new diary_order({
      emp_id: req.user.data.idQLC,
      action: 0,
      id_action: orderId,
      _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
      create_at: dateAsNumber,
    });

    await newDiary.save();

    return functions.success(res, "Update order successfully", {
      data: updatedOrder,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { order_ids } = req.body;

    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or empty order_ids array" });
    }

    const deleteResult = await CRMOrderModel.updateMany(
      {
        _id: { $in: order_ids },
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
        .json({ error: "No matching orders found for deletion" });
    }

    const idDiary = await diary_order.find().sort({ _id: -1 }).limit(1).lean();
    for (let i = 0; i < order_ids.length; i++) {
      const currentDate = new Date();
      const dateAsNumber = currentDate.getTime() / 1000;
      const newDiary = new diary_order({
        emp_id: req.user.data.idQLC,
        action: 1,
        id_action: order_ids[i],
        _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 + i : 1,
        create_at: dateAsNumber,
      });

      await newDiary.save();
    }

    return functions.success(res, "Delete orders successfully");
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listOrder = async (req, res) => {
  try {
    const {
      keyword,
      fromDate,
      toDate,
      status,
      payment_status,
      shipment_status,
      campaign_id,
      chance_id,
      page = 1,
      pageSize = 10,
      cus_id,
      quote_id
    } = req.body;

    const searchConditions = {
      $or: [],
      com_id: req.user.data.com_id,
      is_delete: 0,
    };

    if (keyword) {
      if (typeof Number(keyword) === "number" && !isNaN(Number(keyword))) {
        searchConditions.$or.push({ _id: keyword });
      } else {
        const customers = await customer.find(
          { name: new RegExp(keyword, "i") },
          { cus_id: 1, _id: 0 }
        );
        const customerIds = customers.map((customer) => customer.cus_id);
        searchConditions.$or.push({ cus_id: { $in: customerIds } });
        searchConditions.$or.push({ receiver: new RegExp(keyword, "i") });
      }
    } else {
      searchConditions.$or.push({});
    }

    if (fromDate && !toDate) searchConditions.date = { $gte: fromDate };
    if (toDate && !fromDate) searchConditions.date = { $lte: toDate };
    if (toDate && fromDate)
      searchConditions.date = { $gte: fromDate, $lte: toDate };
    if (status) searchConditions.status = status;
    if (payment_status) searchConditions.payment_status = payment_status;
    if (shipment_status) searchConditions.shipment_status = shipment_status;
    if (campaign_id) searchConditions.campaign_id = campaign_id;
    if (chance_id) searchConditions.chance_id = chance_id;
    if (cus_id) searchConditions.cus_id = cus_id;
    if (quote_id) searchConditions.quote_id = quote_id;

    const startIndex = (page - 1) * pageSize;

    const orders = await CRMOrderModel.find(searchConditions)
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
        path: "user_create_id",
        model: users,
        options: { lean: true },
        select: "userName",
        localField: "user_create_id",
        foreignField: "idQLC",
      })
      .lean();

    const count = await CRMOrderModel.countDocuments(searchConditions);
    return functions.success(res, "Get data successfully", {
      data: orders,
      count,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.detailOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (order_id) {
      const detaiOrder = await CRMOrderModel.findOne({
        com_id: req.user.data.com_id,
        _id: order_id,
        is_delete: 0,
      }).lean();
      if (detaiOrder) {
        const history = await diary_order
          .find({ id_action: Number(order_id) })
          .sort({ create_at: -1 });

        const data = await product_order.aggregate([
          {
            $match: {
              order_id: Number(order_id),
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
            $unwind: "$customer_infor",
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
          { $match: { "product_details.is_delete": 0 } },
          {
            $lookup: {
              from: "CRM_product_order",
              localField: "_id",
              foreignField: "_id",
              as: "order_details",
            },
          },
          {
            $unwind: {
              path: "$order_details",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "order_details.order_id": Number(order_id),
              "order_details.company_id": req.user.data.com_id,
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
                  $mergeObjects: ["$product_details", "$order_details"],
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
            history,
            detaiOrder,
            dataProduct: result.data || [],
          });
        }

        return functions.success(res, "Get data successfully", {
          total_money: 0,
          total_count: 0,
          total_product_cost: 0,
          total_tax: 0,
          total_money_discount: 0,
          history,
          detaiOrder,
          dataProduct: [],
        });
      }
      return functions.setError(res, "Order not found", 404);
    }
    return functions.setError(res, "Missing order_id value", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.addProductOrder = async (req, res) => {
  try {
    const {
      product_ids,
      order_id,
      counts,
      dvts,
      tax_rates,
      discount_rates,
      prices,
    } = req.body;

    if (product_ids && order_id) {
      const maxIdResult = await product_order
        .findOne()
        .sort({ _id: -1 })
        .limit(1);
      let maxId = maxIdResult ? maxIdResult._id : 0;

      const bulkOperations = product_ids.map((prod_id, index) => {
        const newId = maxId + 1 + index;
        maxId = newId; // Update maxId for next loop
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
              order_id,
              company_id: req.user.data.com_id,
            },
            update: {
              $set: {
                product_id: prod_id,
                order_id,
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

      await product_order.bulkWrite(bulkOperations);
      return res
        .status(200)
        .json({ success: true, message: "Add product successfully" });
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listProductOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (order_id) {
      const data = await product_order.aggregate([
        {
          $match: {
            order_id: Number(order_id),
            company_id: req.user.data.com_id,
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
        { $match: { "product_details.is_delete": 0 } },
        {
          $lookup: {
            from: "CRM_product_order",
            localField: "_id",
            foreignField: "_id",
            as: "order_details",
          },
        },
        {
          $unwind: {
            path: "$order_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "order_details.order_id": Number(order_id),
            "order_details.company_id": req.user.data.com_id,
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
                $mergeObjects: ["$product_details", "$order_details"],
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
          data_length: result.data ? result.data.length : 0,
        });
      }

      return functions.success(res, "No data found", {
        total_money: 0,
        total_count: 0,
        total_product_cost: 0,
        total_tax: 0,
        total_money_discount: 0,
        data: [],
        data_length: 0,
      });
    }
    return functions.setError(res, "Missing value", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.deleteProductOrder = async (req, res) => {
  try {
    const { order_ids, prod_ids } = req.body;

    if (
      Array.isArray(order_ids) &&
      Array.isArray(prod_ids) &&
      order_ids.length > 0 &&
      prod_ids.length > 0
    ) {
      await product_order.deleteMany({
        order_id: { $in: order_ids.map(Number) },
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
