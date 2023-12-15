const mongoose = require("mongoose");

const product_chance = mongoose.Schema(
  {
    id: {
      type: Number,
      require: true,
    },
    product_id: {
      type: Number,
      require: true,
    },
    chance_id: {
      type: Number,
      require: true,
    },
    created_at: {
      type: Number,
      default: 0,
    },
    dvt: {
      type: Number,
      default: 0,
    },
    tax_rate: {
      type: Number,
      default: 0,
    },
    discount_rate: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    company_id: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
    product_cost: {
      // Thanh tiền
      type: Number,
      default: 0,
    },
    money_discount: {
      // Tien chiet khau
      type: Number,
      default: 0,
    },
    money_tax: {
      // Tien thue
      type: Number,
      default: 0,
    },
    total: {
      // Tong tien
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_product_chance",
    timestamps: true,
  }
);
module.exports = mongoose.model("CRM_product_chance", product_chance);
