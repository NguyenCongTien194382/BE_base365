//Model này dùng để
const mongoose = require("mongoose");

const ProductGroups = new mongoose.Schema(
  {
    _id: {
      //id
      type: Number,
      required: true,
    },
    gr_name: {
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
    collection: "CRM_product_groups",
    versionKey: false,
    timestamp: true,
  }
);

module.exports = mongoose.model("CRM_product_groups", ProductGroups);
