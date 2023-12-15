let functions = require("../../../services/functions");
const ProductUnit = require("../../../models/crm/ProductUnit");

exports.add = async (req, res) => {
  try {
    const { unit_name, description } = req.body;
    if (unit_name) {
      let new_id = await functions.getMaxIdByField(ProductUnit, "_id");
      const newProductUnit = new ProductUnit({
        _id: new_id,
        unit_name,
        description,
        company_id: req.user.data.com_id,
        emp_id: req.user.data.idQLC,
      });

      await newProductUnit.save();
      return functions.success(res, "Add new product unit successfully!");
    } else {
      return functions.setError(res, "Missing input value", 400);
    }
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.edit = async (req, res) => {
  try {
    const { unit_name, description, unit_id } = req.body;
    if (unit_id) {
      const updatedProductUnit = await ProductUnit.findOneAndUpdate(
        { _id: Number(unit_id), company_id: req.user.data.com_id },
        {
          unit_name,
          description,
        },
        { new: true }
      );

      if (updatedProductUnit) {
        return functions.success(res, "Edit product unit successfully!", {
          data: updatedProductUnit,
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
    const { unit_id } = req.body;

    if (!unit_id) {
      return functions.setError(res, "Missing input value", 400);
    }

    const deletedProductGr = await ProductUnit.findOneAndUpdate(
      {
        _id: Number(unit_id),
        company_id: req.user.data.com_id,
      },
      { is_delete: 1 }
    );

    if (!deletedProductGr) {
      return functions.setError(res, "Product unit not found", 404);
    }

    return functions.success(res, "Delete unit group successfully!", {
      data: deletedProductGr,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};

exports.listUnit = async (req, res) => {
  try {
    const { page = 1, page_size = 10, unit } = req.body;
    const com_id = req.user.data.com_id;

    const skip = (page - 1) * page_size;

    const searchCondition = {
      company_id: com_id,
      is_delete: 0,
      ...(unit && { unit_name: { $regex: unit, $options: "i" } }),
    };

    const data = await ProductUnit.find(searchCondition)
      .skip(skip)
      .limit(page_size > 0 ? parseInt(page_size) : undefined)
      .lean();

    const total = await ProductUnit.countDocuments(searchCondition);

    return functions.success(res, "Get product unit successfully", {
      data,
      count: total,
    });
  } catch (err) {
    return functions.setError(res, err.message);
  }
};
