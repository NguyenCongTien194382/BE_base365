let functions = require("../../../services/functions");
const ProductGroup = require("../../../models/crm/ProductGroups");

exports.add = async (req, res) => {
  try {
    const { gr_name, description } = req.body;
    if (gr_name) {
      let new_id = await functions.getMaxIdByField(ProductGroup, "_id");
      const newProductGr = new ProductGroup({
        _id: new_id,
        gr_name,
        description,
        company_id: req.user.data.com_id,
        emp_id: req.user.data.idQLC,
      });

      await newProductGr.save();
      return functions.success(res, "Add new product group successfully!");
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.edit = async (req, res) => {
  try {
    const { gr_name, description, gr_id } = req.body;
    if (gr_id) {
      const updatedProduct = await ProductGroup.findOneAndUpdate(
        { _id: Number(gr_id), company_id: req.user.data.com_id },
        {
          gr_name,
          description,
        },
        { new: true }
      );

      if (updatedProduct) {
        return functions.success(res, "Edit product group successfully!", {
          data: updatedProduct,
        });
      }
      return functions.setError(res, "Update failed", 400);
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { gr_id } = req.body;

    if (!gr_id) {
      return functions.setError(res, "Missing input value", 400);
    }

    const deletedProductGr = await ProductGroup.findOneAndUpdate(
      {
        _id: Number(gr_id),
        company_id: req.user.data.com_id,
      },
      { is_delete: 1 }
    );

    if (!deletedProductGr) {
      return functions.setError(res, "Product group not found", 404);
    }

    return functions.success(res, "Delete product group successfully!", {
      data: deletedProductGr,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listGr = async (req, res) => {
  try {
    const { page = 1, page_size = 10, gr_name } = req.body;
    const com_id = req.user.data.com_id;

    const skip = (page - 1) * page_size;

    const searchCondition = {
      company_id: com_id,
      is_delete: 0,
      ...(gr_name && { gr_name: { $regex: gr_name, $options: "i" } }),
    };

    const data = await ProductGroup.find(searchCondition)
      .skip(skip)
      .limit(page_size > 0 ? parseInt(page_size) : undefined)
      .lean();

    const total = await ProductGroup.countDocuments(searchCondition);
    return functions.success(res, "Get product group successfully", {
      data,
      count: total,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
