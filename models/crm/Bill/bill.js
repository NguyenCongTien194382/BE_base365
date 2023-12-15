const mongoose = require("mongoose");

const bill = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    cus_id: {
      type: Number,
      default: 0,
    },
    bank_account: {
      type: Number,
      default: 0,
    },
    bank_create_at: {
      type: Number,
      default: 0,
    },
    tax_code: {
      type: Number,
      default: 0,
    },
    buyer: {
      type: Number,
      default: 0,
    },
    order_id: {
      type: Number,
      default: 0,
    },
    email_reciever: {
      type: String,
      default: null,
    },
    phone_reciever: {
      type: String,
      default: null,
    },
    type: {
      type: Number,
      default: 0,
    },
    payment_type: {
      type: Number,
      default: 0,
    },
    date: {
      type: Number,
      default: 0,
    },

    campaign_id: {
      type: Number,
      default: 0,
    },
    com_id: {
      type: Number,
      default: 0,
    },
    user_confirm: {
      type: Number,
      default: 0,
    },
    emp_id: {
      type: Number,
      default: 0,
    },
    is_convert_paper_bill: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 0,
    },
    status_send: {
      type: Number,
      default: 0,
    },
    shipment_status: {
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
    description: {
      type: String,
      default: null,
    },
    share_all: {
      type: String,
      default: null,
    },
    bill_discount_money: {
      type: Number,
      default: 0,
    },
    bill_discount_rate: {
      type: Number,
      default: 0,
    },
    total_money: {
      // Gia tri don hang
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: null,
    },
    is_delete: {
      type: Number,
      default: 0,
    },
    create_at: {
      type: Number,
      default: 0,
    },
    user_create_id: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_Bill",
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("CRM_Bill", bill);
