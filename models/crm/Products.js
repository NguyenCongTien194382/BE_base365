// Model này dùng để
const mongoose = require("mongoose");

const Products = new mongoose.Schema(
  {
    _id: {
      //id
      type: Number,
      required: true,
    },
    group_id: {
      //
      type: Number,
      default: 0,
    },
    category: {
      // Tinh chat hang hoa
      type: Number,
      default: 0,
    },
    barcode: {
      // Ma vach
      type: String,
      default: null,
    },
    prod_name: {
      //
      type: String,
      default: null,
    },
    dvt: {
      // DOn vi tinh
      type: Number,
      default: 0,
    },
    product_image: {
      //
      type: String,
      default: null,
    },
    min_amount: {
      // So luong toi thieu
      type: String,
      default: null,
    },
    description: {
      // Mo ta
      type: String,
    },
    price: {
      // Giá bán
      type: Number,
      require: true,
    },
    capital_price: {
      // Giá vốn
      type: Number,
      require: true,
    },
    bao_hanh: {
      //
      type: Number,
      default: 0,
    },
    expiration_date: {
      //
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      default: null,
    },
    product_origin: {
      //
      type: String,
      default: null,
    },
    tracking: {
      //
      type: Boolean,
      default: false,
    },
    emp_id: {
      //
      type: Number,
      default: 0,
    },
    company_id: {
      //
      type: Number,
      default: 0,
    },
    is_delete: {
      //
      type: Number,
      default: 0,
    },
    created_at: {
      type: Number,
      default: 0,
    },
    update_at: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_Product",
    versionKey: false,
    timestamp: true,
  }
);

module.exports = mongoose.model("CRM_Product", Products);
