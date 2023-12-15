//Model này dùng để
const mongoose = require("mongoose");

const Product_Unit = new mongoose.Schema(
  {
    _id: {
      //id
      type: Number,
      required: true,
    },
    unit_name: {
      //
      type: String,
      required: true,
    },
    description: {
      //
      type: String,
      default: null,
    },
    company_id: {
      //
      type: Number,
      default: 0,
    },
    emp_id: {
      //
      type: Number,
      default: 0,
    },
    is_delete: {
      //
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_Product_Unit",
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("CRM_Product_Unit", Product_Unit);
