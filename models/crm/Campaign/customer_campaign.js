const mongoose = require("mongoose");

const customer_campaign = mongoose.Schema(
  {
    id: {
      type: Number,
      require: true,
    },
    cus_id: {
      type: Number,
      require: true,
    },
    campaign_id: {
      type: Number,
      require: true,
    },
    created_at: {
      type: Number,
      default: 0,
    },
    status: {
      // Type tu 0 -> 10
      type: Number,
      default: 1,
    },
    emp_id: {
      // Nhan vien thuc hien
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: null,
    },
    company_id: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_customer_campaign",
    timestamps: true,
  }
);
module.exports = mongoose.model("CRM_customer_campaign", customer_campaign);
