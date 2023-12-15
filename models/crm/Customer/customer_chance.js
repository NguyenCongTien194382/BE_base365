const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const crm_chance = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    com_id: {
      type: Number,
      default: 0,
    },
    cus_id: {
      type: Number,
      default: 0,
    },
    contact_id: {
      type: Number,
      default: 0,
    },
    type: {
      type: Number,
      default: 0,
    },
    group_commodities: {
      // Nhom hang hoa
      type: Number,
      default: 0,
    },
    chance_discount_rate: {
      type: Number,
      default: 0,
    },
    chance_discount_money: {
      type: Number,
      default: 0,
    },
    stages: {
      // Giai doan
      type: Number,
      default: 1,
    },
    success_rate: {
      type: Number,
      default: 0,
    },
    expected_sales: {
      type: Number,
      default: 0,
    },
    expected_end_date: {
      type: Number,
      require: true,
    },
    campaign_id: {
      type: Number,
      default: 0,
    },
    source: {
      type: Number,
      default: 0,
    },
    emp_id: {
      type: Number,
      default: 0,
    },
    total_money: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: null,
    },
    country_change: {
      type: Number,
      default: 0,
    },
    city_chance: {
      type: Number,
      default: 0,
    },
    district_chance: {
      type: Number,
      default: 0,
    },
    ward_chance: {
      type: Number,
      default: 0,
    },
    street_chance: {
      type: String,
      default: null,
    },
    area_code_chance: {
      type: String,
      default: null,
    },
    address_chance: {
      type: String,
      default: null,
    },
    share_all: {
      type: Number,
      default: 0,
    },
    user_id_create: {
      type: Number,
      default: 0,
    },
    user_id_edit: {
      type: Number,
      default: 0,
    },
    result: {
      type: Number,
      default: 0,
    },
    reason: {
      type: [],
      default: [],
    },
    time_complete: {
      type: Number,
      default: 0,
    },
    delete_chance: {
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
    collection: "crm_chance",
    versionKey: false,
    timestamp: true,
  }
);
module.exports = mongoose.model("crm_chance", crm_chance);
