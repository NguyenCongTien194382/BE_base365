let functions = require("../../../services/functions");
const Product = require("../../../models/crm/Products");
const crmService = require("../../../services/CRM/CRMservice");

exports.add = async (req, res) => {
  try {
    const {
      prod_name,
      group_id,
      category,
      barcode,
      dvt,
      product_image,
      min_amount,
      description,
      price,
      capital_price,
      bao_hanh,
      expiration_date,
      product_origin,
      inventory,
      tracking,
    } = req.body;

    if (prod_name) {
      let file_name = "";
      let time = 0;
      let new_id = await functions.getMaxIdByField(Product, "_id");
      if (req.files && req.files.logo) {
        let file = req.files.logo;
        let check_file = await crmService.validateImage(file);
        if (check_file) {
          time = functions.convertTimestamp(Date.now());
          file_name = await crmService.uploadFile("product", time, file);
        } else {
          return functions.setError(res, "Invalid file!", 400);
        }
      }
      const newProduct = new Product({
        _id: new_id,
        logo: file_name,
        prod_name,
        group_id,
        category,
        barcode,
        dvt,
        product_image,
        min_amount,
        description,
        price,
        capital_price,
        bao_hanh,
        expiration_date,
        product_origin,
        inventory,
        tracking,
        emp_id: req.user.data.idQLC,
        company_id: req.user.data.com_id,
        created_at: time,
        update_at: time,
      });

      const savedProduct = await newProduct.save();
      return functions.success(res, "Add new product successfully!");
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.edit = async (req, res) => {
  try {
    const {
      prod_id,
      group_id,
      category,
      barcode,
      dvt,
      product_image,
      min_amount,
      description,
      bao_hanh,
      expiration_date,
      product_origin,
      inventory,
      tracking,
    } = req.body;

    if (prod_id) {
      let file_name = "";
      let time = 0;
      if (req.files && req.files.logo) {
        let file = req.files.logo;
        let check_file = await crmService.validateImage(file);
        if (check_file) {
          time = functions.convertTimestamp(Date.now());
          file_name = await crmService.uploadFile("product", time, file);
        } else {
          return functions.setError(res, "Invalid file!", 400);
        }
      }
      const data = await Product.findOne({ _id: Number(prod_id) });
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: Number(prod_id), company_id: req.user.data.com_id },
        {
          group_id,
          logo: req.files && req.files.logo ? file_name : data.logo,
          category,
          barcode,
          dvt,
          product_image,
          min_amount,
          description,
          bao_hanh,
          expiration_date,
          product_origin,
          inventory,
          tracking,
          update_at: req.files && req.files.logo ? time : data.update_at,
        },
        { new: true }
      );

      return functions.success(res, "Add new product successfully!", {
        data: updatedProduct,
      });
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { prod_id } = req.body;

    if (!prod_id) {
      return functions.setError(res, "Missing input value", 400);
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: Number(prod_id),
      company_id: req.user.data.com_id,
    });

    if (!deletedProduct) {
      return functions.setError(res, "Product not found", 404);
    }

    return functions.success(res, "Delete product successfully!", {
      data: deletedProduct,
    });
  } catch (error) {
    return functions.setError(res, error.message);
  }
};

exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 10,
      gr_id,
      category,
      prod_id,
      prod_name,
    } = req.body;
    const com_id = req.user.data.com_id;

    const skip = (page - 1) * page_size;

    const searchCondition = {
      company_id: com_id,
      is_delete: 0,
      ...(gr_id && { group_id: Number(gr_id) }),
      ...(category && { category: Number(category) }),
      ...(prod_id && { _id: Number(prod_id) }),
      ...(prod_name && { prod_name: { $regex: prod_name, $options: "i" } }),
    };

    const data = await Product.find(searchCondition)
      .populate({
        path: "group_id",
        model: "CRM_product_groups",
        options: { lean: true },
      })
      .populate({
        path: "dvt",
        model: "CRM_Product_Unit",
        options: { lean: true },
      })
      .skip(skip)
      .limit(page_size > 0 ? parseInt(page_size) : undefined)
      .lean();

    for (let i = 0; i < data.length; i++) {
      data[i].logo = crmService.getLinkFile(
        "product",
        data[i].update_at,
        data[i].logo
      );
    }
    const count = await Product.countDocuments(searchCondition);
    return functions.success(res, "Get list product successfully", {
      data,
      count: count,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.detail = async (req, res) => {
  try {
    const { prod_id } = req.body;

    if (!prod_id) {
      return functions.setError(res, "Missing input value", 400);
    }
    const data = await Product.findOne({
      _id: prod_id,
      company_id: req.user.data.com_id,
      is_delete: 0,
    })
      .populate({
        path: "group_id",
        model: "CRM_product_groups",
        options: { lean: true },
      })
      .populate({
        path: "dvt",
        model: "CRM_Product_Unit",
        options: { lean: true },
      })
      .lean();

    data.logo = crmService.getLinkFile("product", data.update_at, data.logo);

    return functions.success(res, "Get product successfully", {
      data,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
