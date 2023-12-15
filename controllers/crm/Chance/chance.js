const Cus_Chance = require("../../../models/crm/Customer/customer_chance");
const Share_Cus = require("../../../models/crm/tbl_share_customer");
const Share_Chance = require("../../../models/crm/tbl_shareChance");
const functions = require("../../../services/functions");
const ProductChance = require("../../../models/crm/Chance/product_chance");
const Chance_diary = require("../../../models/crm/Diary/diary_chance");
const Users = require("../../../models/Users");
const crm_chance_file = require("../../../models/crm/Chance/chance_file");
const crmService = require("../../../services/CRM/CRMservice");
const history_chance_stages = require("../../../models/crm/Chance/history_chance_stages");

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

exports.listChance = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      expected_end_date,
      toDate,
      fromDate,
      emp_id,
      stages,
      campaign_id,
    } = req.body;

    const searchConditions = {
      $or: [],
      com_id: req.user.data.com_id,
      delete_chance: 0,
      ...(expected_end_date && {
        expected_end_date: { $gte: new Date(expected_end_date) },
      }),
      ...(emp_id && Number(emp_id) !== 0 && { emp_id }),
      ...(stages && Number(stages) !== 0 && { stages }),
      ...(campaign_id && { campaign_id: Number(campaign_id) }),
    };

    if (fromDate && !toDate) searchConditions.created_at = { $gte: fromDate };
    if (toDate && !fromDate) searchConditions.created_at = { $lte: toDate };
    if (toDate && fromDate)
      searchConditions.created_at = { $gte: fromDate, $lte: toDate };

    if (keyword) {
      searchConditions.$or.push({ name: new RegExp(keyword, "i") });
      if (typeof Number(keyword) === "number" && !isNaN(Number(keyword))) {
        searchConditions.$or.push({ id: Number(keyword) });
      }
      // else {
      //   searchConditions.$or.push({ name: new RegExp(keyword, "i") });
      // }
    } else {
      searchConditions.$or.push({});
    }

    const skip = (page - 1) * pageSize;

    const populateOptions = [
      {
        path: "cus_id",
        model: "CRM_customer",
        options: { lean: true },
        select: "name",
        localField: "cus_id",
        foreignField: "cus_id",
      },
      {
        path: "emp_id",
        model: Users,
        options: { lean: true },
        select: "userName idQLC",
        localField: "emp_id",
        foreignField: "idQLC",
      },
      // {
      //   path: "user_id_create",
      //   model: Users,
      //   options: { lean: true },
      //   select: "userName idQLC",
      //   localField: "user_id_create",
      //   foreignField: "idQLC",
      // },
      // {
      //   path: "user_id_edit",
      //   model: Users,
      //   options: { lean: true },
      //   select: "userName idQLC",
      //   localField: "user_id_edit",
      //   foreignField: "idQLC",
      // },
      // {
      //   path: "campaign_id",
      //   model: "CRM_Campaign",
      //   options: { lean: true },
      //   select: "_id nameCampaign",
      //   localField: "campaign_id",
      //   foreignField: "_id",
      // },
    ];

    const chances = await Cus_Chance.find(searchConditions, { _id: 0 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .sort({ update_at: -1 })
      .lean();

    await Promise.all(
      populateOptions.map(async (option) => {
        await Cus_Chance.populate(chances, option);
      })
    );

    const count = await Cus_Chance.countDocuments(searchConditions);

    return functions.success(res, "Lấy dữ liệu thành công", {
      data: chances,
      count: count,
    });
  } catch (error) {
    console.error(error);
    return functions.setError(res, error.message);
  }
};

exports.detailChance = async (req, res) => {
  try {
    const { chance_id } = req.body;
    const populateOptions = [
      {
        path: "cus_id",
        model: "CRM_customer",
        options: { lean: true },
        select: "name",
        localField: "cus_id",
        foreignField: "cus_id",
      },
      {
        path: "emp_id",
        model: Users,
        options: { lean: true },
        select: "userName idQLC",
        localField: "emp_id",
        foreignField: "idQLC",
      },
      {
        path: "user_id_create",
        model: Users,
        options: { lean: true },
        select: "userName idQLC",
        localField: "user_id_create",
        foreignField: "idQLC",
      },
      {
        path: "user_id_edit",
        model: Users,
        options: { lean: true },
        select: "userName idQLC",
        localField: "user_id_edit",
        foreignField: "idQLC",
      },
      {
        path: "campaign_id",
        model: "CRM_Campaign",
        options: { lean: true },
        select: "_id nameCampaign",
        localField: "campaign_id",
        foreignField: "_id",
      },
    ];
    if (chance_id) {
      const detailChance = await Cus_Chance.findOne(
        {
          id: chance_id,
          com_id: req.user.data.com_id,
          delete_chance: 0,
        },
        { _id: 0 }
      ).lean();

      if (detailChance) {
        await Promise.all(
          populateOptions.map(async (option) => {
            await Cus_Chance.populate(detailChance, option);
          })
        );

        const history = await Chance_diary.find({
          id_action: Number(chance_id),
        })
          .sort({ create_at: -1 })
          .populate({
            path: "emp_id",
            model: Users,
            select: "idQLC userName",
            localField: "emp_id",
            foreignField: "idQLC",
          })
          .lean();

        const data = await ProductChance.aggregate([
          {
            $match: {
              chance_id: Number(chance_id),
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
          {
            $lookup: {
              from: "CRM_product_chance",
              localField: "_id",
              foreignField: "_id",
              as: "chance_details",
            },
          },
          {
            $unwind: {
              path: "$chance_details",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "CRM_Product_Unit",
              localField: "product_details.dvt",
              foreignField: "_id",
              as: "product_unit",
            },
          },
          {
            $unwind: {
              path: "$product_unit",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "CRM_product_groups",
              localField: "product_details.group_id",
              foreignField: "_id",
              as: "product_gr",
            },
          },
          {
            $unwind: {
              path: "$product_gr",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "chance_details.chance_id": Number(chance_id),
              "chance_details.company_id": req.user.data.com_id,
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
                  $mergeObjects: [
                    "$product_details",
                    "$chance_details",
                    "$product_unit",
                    "$product_gr",
                  ],
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
            detailChance,
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
          detailChance,
          history,
        });
      }
      return functions.setError(res, "Chance not found", 404);
    }
    return functions.setError(res, "Missing input value", 400);
  } catch (err) {}
};

exports.create_Chance = async (req, res) => {
  try {
    let {
      id_customer,
      contact_id,
      chance_name,
      time_complete,
      chance_type,
      reason,
      group_commodities,
      result,
      stages,
      success_rate,
      expected_sales,
      expected_end_date,
      campaign_id,
      soure,
      description,
      country_chance,
      city_chance,
      district_chance,
      ward_chance,
      street_chance,
      area_code_chance,
      address_chance,
      share_all,
      emp_id,
      chance_discount_money,
      chance_discount_rate,
    } = req.body;
    let com_id = req.user.data.com_id;

    const {
      productData = {
        product_ids: [],
        counts: 0,
        dvts: 0,
        tax_rates: 0,
        discount_rates: 0,
        prices: 0,
      },
    } = req.body;
    const {
      product_ids = [],
      counts = 0,
      dvts = 0,
      tax_rates = 0,
      discount_rates = 0,
      prices = 0,
    } = productData;

    if (req.user.data.type == 1 || req.user.data.type == 2) {
      const currentDate = new Date();
      const numericDate = currentDate.getTime();
      const unixTimestamp = Math.floor(numericDate / 1000);

      const totalMoney = totalMoneyCalculate(
        product_ids,
        discount_rates,
        prices,
        counts,
        tax_rates
      );

      const discount_money =
        chance_discount_rate || !chance_discount_money
          ? 0
          : chance_discount_money !== 0
          ? chance_discount_money
          : 0;
      const discount_rate = chance_discount_rate || 0;
      const total = totalMoney || 0;
      const chance_total =
        Number(discount_rate) !== 0
          ? total - total * (discount_rate / 100)
          : total - discount_money;

      let maxID = (await Cus_Chance.findOne({}, {}, { sort: { id: -1 } })) || 0;
      let new_chance = new Cus_Chance({
        id: maxID === 0 ? 0 : Number(maxID.id) + 1,
        name: chance_name,
        com_id: com_id,
        cus_id: id_customer,
        contact_id: contact_id,
        type: chance_type,
        group_commodities: group_commodities,
        stages: stages,
        success_rate: success_rate,
        expected_sales: expected_sales,
        expected_end_date: expected_end_date,
        campaign_id: campaign_id,
        source: soure,
        emp_id: emp_id,
        total_money: chance_total,
        description: description,
        country_change: country_chance,
        city_chance: city_chance,
        district_chance: district_chance,
        ward_chance: ward_chance,
        street_chance: street_chance,
        area_code_chance: area_code_chance,
        address_chance: address_chance,
        share_all: share_all,
        user_id_create: req.user.data.idQLC,
        created_at: unixTimestamp,
        update_at: unixTimestamp,
        result: result,
        chance_discount_money:
          chance_discount_rate || !chance_discount_money
            ? 0
            : chance_discount_money !== 0
            ? chance_discount_money
            : 0,
        chance_discount_rate: chance_discount_rate || 0,
        time_complete,
        reason,
      });
      const saveChacne = await new_chance.save();

      const idDiary = await Chance_diary.find()
        .sort({ _id: -1 })
        .limit(1)
        .lean();

      const newDiary = new Chance_diary({
        emp_id: req.user.data.idQLC,
        action: 3,
        id_action: saveChacne.id,
        _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
        create_at: unixTimestamp,
      });

      await newDiary.save();

      if (!product_ids || !saveChacne.id) {
        return functions.setError(res, "Missing input value :)))", 400);
      }

      const maxIdResult = await ProductChance.findOne()
        .sort({ id: -1 })
        .limit(1);
      const maxId = maxIdResult ? maxIdResult.id : 0;

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
              chance_id: saveChacne.id,
              company_id: req.user.data.com_id,
            },
            update: {
              $set: {
                product_id: prod_id,
                chance_id: saveChacne.id,
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
              $setOnInsert: { id: newId, company_id: req.user.data.com_id },
            },
            upsert: true,
          },
        };
      });

      await ProductChance.bulkWrite(bulkOperations);

      const idStageChance = await history_chance_stages
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .lean();

      const newHistoryStage = new history_chance_stages({
        stage_id: stages,
        _id:
          idStageChance?.length !== 0 ? Number(idStageChance[0]?._id) + 1 : 1,
        chance_id: maxID === 0 ? 0 : Number(maxID.id) + 1,
        created_at: unixTimestamp,
        expected_revenue: expected_sales,
        success_rate: success_rate,
        end_date: time_complete,
        user_edit_id: req.user.data.idQLC,
        company_id: req.user.data.com_id,
        money: chance_total,
      });

      await newHistoryStage.save();

      return functions.success(res, "Thêm dữ liệu thành công", {
        data: new_chance,
      });
    } else {
      return functions.setError(res, "Bạn không có quyền", 400);
    }
  } catch (e) {
    console.log(e);
    return functions.setError(res, e.message);
  }
};

exports.update_chance = async (req, res) => {
  try {
    let {
      chance_id,
      id_customer,
      contact_id,
      name,
      chance_type,
      group_commodities,
      money,
      stages,
      success_rate,
      expected_sale,
      expected_end_date,
      campaign_id,
      soure,
      description,
      country_chance,
      city_chance,
      district_chance,
      ward_chance,
      street_chance,
      area_code_chance,
      address_chance,
      share_all,
      emp_id,
      result,
      time_complete,
      reason,
      chance_discount_money,
      chance_discount_rate,
    } = req.body;
    if (chance_id > 0 && name != "") {
      const productData = req.body.productData;

      const currentDate = new Date();
      const numericDate = currentDate.getTime();
      const unixTimestamp = Math.floor(numericDate / 1000);
      let Chance_update = null;
      if (productData) {
        const { product_ids, counts, dvts, tax_rates, discount_rates, prices } =
          productData;

        const totalMoney = totalMoneyCalculate(
          product_ids,
          discount_rates,
          prices,
          counts,
          tax_rates
        );

        const discount_money =
          chance_discount_rate || !chance_discount_money
            ? 0
            : chance_discount_money !== 0
            ? chance_discount_money
            : 0;
        const discount_rate = chance_discount_rate || 0;
        const total = totalMoney || 0;
        const chance_total =
          Number(discount_rate) !== 0
            ? total - total * (discount_rate / 100)
            : total - discount_money;

        const exitsData = await Cus_Chance.findOne({
          id: Number(chance_id),
          com_id: req.user.data.com_id,
          delete_chance: 0,
        });

        Chance_update = await Cus_Chance.findOneAndUpdate(
          { id: chance_id, delete_chance: 0 },
          {
            name: name,
            contact_id: contact_id,
            type: chance_type,
            group_commodities: group_commodities,
            money: money,
            cus_id: id_customer,
            stages: stages,
            success_rate: success_rate,
            expected_sales: expected_sale,
            expected_end_date: expected_end_date,
            campaign_id: campaign_id,
            source: soure,
            emp_id: emp_id,
            // total_money: chance_total,
            description: description,
            country_change: country_chance,
            city_chance: city_chance,
            district_chance: district_chance,
            ward_chance: ward_chance,
            street_chance: street_chance,
            area_code_chance: area_code_chance,
            address_chance: address_chance,
            share_all: share_all,
            user_id_edit: req.user.data.idQLC,
            update_at: unixTimestamp,
            result: result,
            time_complete,
            reason,
            chance_discount_money:
              chance_discount_rate !== 0 && chance_discount_rate
                ? 0
                : chance_discount_money !== 0
                ? chance_discount_money
                : exitsData?.chance_discount_money,
            chance_discount_rate:
              !chance_discount_rate && chance_discount_money
                ? 0
                : chance_discount_rate
                ? chance_discount_rate
                : exitsData?.chance_discount_rate,
          },
          { new: true }
        );

        if (!product_ids) {
          return functions.success(res, "Sửa thành công", {
            data: Chance_update,
          });
        }

        const maxIdResult = await ProductChance.findOne()
          .sort({ id: -1 })
          .limit(1);
        const maxId = maxIdResult ? maxIdResult.id : 0;

        const listIdProductChance = await ProductChance.find({
          chance_id: Number(chance_id),
          company_id: req.user.data.com_id,
        })
          .select("id chance_id product_id")
          .populate({
            path: "product_id",
            model: "CRM_Product",
            localField: "product_id",
            foreignField: "_id",
            select: "_id prod_name",
          });

        const dataIsDelete = listIdProductChance?.filter(
          (item) => !product_ids?.includes(item?.product_id?._id)
        );

        if (dataIsDelete.length > 0) {
          //
          const promiseDelData = dataIsDelete?.map((item) => {
            return ProductChance.findOneAndDelete({
              chance_id: Number(chance_id),
              product_id: Number(item?.product_id?._id),
              company_id: req.user.data.com_id,
            });
          });

          await Promise.all(promiseDelData);
        }

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
                chance_id: chance_id,
                company_id: req.user.data.com_id,
              },
              update: {
                $set: {
                  product_id: prod_id,
                  chance_id: chance_id,
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
                $setOnInsert: { id: newId, company_id: req.user.data.com_id },
              },
              upsert: true,
            },
          };
        });

        await ProductChance.bulkWrite(bulkOperations);
      } else {
        Chance_update = await Cus_Chance.findOneAndUpdate(
          { id: chance_id, delete_chance: 0 },
          {
            name: name,
            contact_id: contact_id,
            type: chance_type,
            group_commodities: group_commodities,
            money: money,
            cus_id: id_customer,
            stages: stages,
            success_rate: success_rate,
            expected_sales: expected_sale,
            expected_end_date: expected_end_date,
            campaign_id: campaign_id,
            source: soure,
            emp_id: emp_id,
            description: description,
            country_change: country_chance,
            city_chance: city_chance,
            district_chance: district_chance,
            ward_chance: ward_chance,
            street_chance: street_chance,
            area_code_chance: area_code_chance,
            address_chance: address_chance,
            share_all: share_all,
            user_id_edit: req.user.data.idQLC,
            update_at: unixTimestamp,
            result: result,
            time_complete,
            reason,
          },
          { new: true }
        );
      }

      // const updateData = await Chance_update.save();

      if (!Chance_update) {
        return functions.setError(res, "Chance not found", 404);
      }

      const idDiary = await Chance_diary.find()
        .sort({ _id: -1 })
        .limit(1)
        .lean();

      const newDiary = new Chance_diary({
        emp_id: req.user.data.idQLC,
        action: 0,
        id_action: chance_id,
        _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
        create_at: unixTimestamp,
      });

      await newDiary.save();

      if (stages) {
        // Update history stages chance:
        const idStageChance = await history_chance_stages
          .find()
          .sort({ _id: -1 })
          .limit(1)
          .lean();

        const newHistoryStage = new history_chance_stages({
          stage_id: stages,
          _id:
            idStageChance?.length !== 0 ? Number(idStageChance[0]?._id) + 1 : 1,
          chance_id: chance_id,
          created_at: unixTimestamp,
          expected_revenue: Chance_update?.expected_sales,
          success_rate: Chance_update?.success_rate,
          end_date: Chance_update?.time_complete,
          user_edit_id: req.user.data.idQLC,
          company_id: req.user.data.com_id,
          money: Chance_update?.total_money,
        });

        await newHistoryStage.save();
      }

      return functions.success(res, "Sửa thành công", { data: Chance_update });
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (e) {
    return functions.setError(res, e.message);
  }
};

exports.deleteChange = async (req, res) => {
  try {
    const { chance_id } = req.body;
    if (chance_id > 0) {
      let del_chance = await Cus_Chance.findOneAndUpdate(
        { id: chance_id, com_id: req.user.data.com_id },
        { delete_chance: 1 }
      );

      const currentDate = new Date();
      const numericDate = currentDate.getTime();
      const unixTimestamp = Math.floor(numericDate / 1000);

      const idDiary = await Chance_diary.find()
        .sort({ _id: -1 })
        .limit(1)
        .lean();

      const newDiary = new Chance_diary({
        emp_id: req.user.data.idQLC,
        action: 1,
        id_action: chance_id,
        _id: idDiary?.length !== 0 ? Number(idDiary[0]?._id) + 1 : 1,
        create_at: unixTimestamp,
      });

      await newDiary.save();

      return functions.success(res, "xóa thành công");
    } else {
      return functions.setError(res, "Missing value", 400);
    }
  } catch (e) {
    return functions.setError(res, e.message);
  }
};

exports.addProductChance = async (req, res) => {
  try {
    const {
      product_ids,
      chance_id,
      counts,
      dvts,
      tax_rates,
      discount_rates,
      prices,
    } = req.body;

    if (product_ids && chance_id) {
      const maxIdResult = await ProductChance.findOne({ chance_id })
        .sort({ id: -1 })
        .limit(1);
      let maxId = maxIdResult ? maxIdResult.id : 0;

      const bulkOperations = product_ids.map((prod_id, index) => {
        const newId = maxId + 1 + index;
        maxId = newId;

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
              chance_id,
              company_id: req.user.data.com_id,
            },
            update: {
              $set: {
                product_id: prod_id,
                chance_id,
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
              $setOnInsert: { id: newId, company_id: req.user.data.com_id },
            },
            upsert: true,
          },
        };
      });

      await ProductChance.bulkWrite(bulkOperations);
      return res
        .status(200)
        .json({ success: true, message: "Thêm sản phẩm thành công" });
    } else {
      return functions.setError(
        res,
        "Thiếu thông tin sản phẩm hoặc cơ hội",
        400
      );
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listProductChance = async (req, res) => {
  try {
    const { chance_id } = req.body;
    if (chance_id) {
      const data = await ProductChance.aggregate([
        {
          $match: {
            chance_id: Number(chance_id),
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
            from: "CRM_product_chance",
            localField: "id",
            foreignField: "id",
            as: "chance_details",
          },
        },
        {
          $unwind: {
            path: "$chance_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "chance_details.chance_id": Number(chance_id),
            "chance_details.company_id": req.user.data.com_id,
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
                $mergeObjects: ["$product_details", "$chance_details"],
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

exports.deleteProductChance = async (req, res) => {
  try {
    const { chance_id, prod_id } = req.body;
    if (chance_id && prod_id) {
      await ProductChance.findOneAndDelete({
        chance_id: Number(chance_id),
        product_id: Number(prod_id),
        company_id: req.user.data.com_id,
      });
      return functions.success(res, "Delete successfully");
    }
    return functions.setError(res, "Missing input value", 400);
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listHistoryStagesChance = async (req, res) => {
  try {
    const { chance_id, page, pageSize = 10 } = req.body;

    const skip = (page - 1) * pageSize;

    const listHistory = await history_chance_stages
      .find({
        chance_id: Number(chance_id),
      })
      .skip(skip)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 })
      .populate({
        path: "user_edit_id",
        model: Users,
        select: "idQLC userName",
        localField: "user_edit_id",
        foreignField: "idQLC",
      })
      .lean();

    return functions.success(res, "Get data successfully ", {
      data: listHistory,
    });
  } catch (err) {
    functions.setError(res, err);
  }
};

// Attachment:
exports.createChanceAttachment = async (req, res) => {
  try {
    let { chance_id } = req.body;
    let user_id = req.user.data.idQLC;
    if (chance_id) {
      if (req.files && req.files.document) {
        let file = req.files.document;
        let check_file = await crmService.checkFile(file.path);
        if (check_file) {
          let time = functions.convertTimestamp(Date.now());
          let file_size = file.size;
          let file_name = await crmService.uploadFile("chance", time, file);
          let new_id = await functions.getMaxIdByField(crm_chance_file, "id");
          let new_file = new crm_chance_file({
            id: new_id,
            file_name: file_name,
            chance_id: chance_id,
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
    let {
      chance_id,
      fromDate,
      toDate,
      file_name,
      page,
      pageSize = 10,
    } = req.body;
    if (chance_id) {
      chance_id = Number(chance_id);
      if (!page) page = 1;
      if (!pageSize) pageSize = 10;
      page = Number(page);
      pageSize = Number(pageSize);
      const skip = (page - 1) * pageSize;

      let condition = { chance_id: chance_id };
      // tu ngay den ngay
      fromDate = functions.convertTimestamp(fromDate);
      toDate = functions.convertTimestamp(toDate);
      if (fromDate && !toDate) condition.created_at = { $gte: fromDate };
      if (toDate && !fromDate) condition.created_at = { $lte: toDate };
      if (toDate && fromDate)
        condition.created_at = { $gte: fromDate, $lte: toDate };

      if (file_name) condition.file_name = new RegExp(file_name, "i");

      let listAttachment = await crm_chance_file.aggregate([
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
            chance_id: "$chance_id",
            user_created_id: "$user_created_id",
            file_size: "$file_size",
            created_at: "$created_at",
            user_name: "$Employee.userName",
          },
        },
      ]);
      let total = await functions.findCount(crm_chance_file, condition);
      for (let i = 0; i < listAttachment.length; i++) {
        listAttachment[i].linkFile = crmService.getLinkFile(
          "chance",
          listAttachment[i].created_at,
          listAttachment[i].file_name
        );
      }
      return functions.success(res, "get list note chance success:", {
        total: total,
        data: listAttachment,
      });
    }
    return functions.setError(res, "Missing input chance_id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    let { id } = req.body;
    if (id) {
      id = Number(id);
      let attachment = await crm_chance_file.findOne({ id: id });
      if (attachment) {
        await crmService.deleteFile(
          "chance",
          attachment.created_at,
          attachment.file_name
        );
        await crm_chance_file.findOneAndDelete({ id: id });
        return functions.success(res, "Delete note for chance success!");
      }
      return functions.setError(res, "Attachment not found!", 404);
    }
    return functions.setError(res, "Missing input id!", 400);
  } catch (error) {
    return functions.setError(res, error.message);
  }
};
