const mongoose = require("mongoose");

const crm_order = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    cus_id: {
      type: Number,
      default: 0,
    },
    contact_id: {
      type: Number,
      default: 0,
    },
    price_info_id: {
      type: Number,
      default: 0,
    },
    chance_id: {
      type: Number,
      default: 0,
    },
    campaign_id: {
      type: Number,
      default: 0,
    },
    explain: {
      type: String,
      default: null,
    },
    type: {
      type: Number,
      default: 0,
    },
    com_id: {
      type: Number,
      default: 0,
    },
    day_owned: {
      type: Number,
      default: 0,
    },
    ship_deadline: {
      type: Number,
      default: 0,
    },
    payment_deadline: {
      type: Number,
      default: 0,
    },
    emp_id: {
      type: Number,
      default: 0,
    },
    price_order: {
      type: Number,
      default: 0,
    },
    status: {
      //"Chờ duyệt" 1
      // "Đã duyệt" 2
      // "Đã hủy": 3
      type: Number,
      default: 1,
    },
    shipment_status: {
      type: Number,
      default: 0,
    },
    real_revenue: {
      type: Number,
      default: 0,
    },
    order_process_cost: {
      //Chi phi thuc hien don hang
      type: Number,
      default: 0,
    },
    export_bill: {
      type: Boolean,
      default: false,
    },
    payment_status: {
      type: Number,
      default: 0,
    },
    bill_cus_id: {
      type: Number,
      default: 0,
    },
    bill_buyer: {
      type: Number,
      default: 0,
    },
    bill_country: {
      type: Number,
      default: 0,
    },
    bill_city: {
      type: Number,
      default: 0,
    },
    bill_district: {
      type: Number,
      default: 0,
    },
    bill_ward: {
      type: Number,
      default: 0,
    },
    bill_street: {
      type: String,
      default: null,
    },
    bill_area_code: {
      type: Number,
      default: 0,
    },
    bill_address: {
      type: String,
      default: null,
    },
    bill_email: {
      type: String,
      default: null,
    },
    receiver: {
      type: String,
      default: null,
    },
    receiver_phone: {
      type: String,
      default: "",
    },
    receiver_country: {
      type: Number,
      default: null,
    },
    receiver_district: {
      type: Number,
      default: 0,
    },
    receiver_ward: {
      type: Number,
      default: 0,
    },
    receiver_area_code: {
      type: Number,
      default: 0,
    },
    receiver_ward: {
      type: Number,
      default: 0,
    },
    receiver_street: {
      type: String,
      default: null,
    },
    receiver_address: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    share_all: {
      type: String,
      default: null,
    },
    order_discount_rate: {
      type: Number,
      default: 0,
    },
    total_money: {
      // Gia tri don hang
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: null,
    },
    order_discount_money: {
      type: Number,
      default: 0,
    },
    is_delete: {
      type: Number,
      default: 0,
    },
    user_create_id: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_Order",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("CRM_Order", crm_order);
