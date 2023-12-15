const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const potential_crm = new Schema(
  {
    potential_id: {
      //id tiềm năng khách hàng
      type: Number,
      require: true,
      unique: true,
    },
    pos_id: {
      //id vi tri
      type: Number,
      default: 0,
    },
    vocative: {
      type: Number,
      default: 0,
    },
    social: {
      Facebook: {
        type: String,
        default: null,
      },
      Instagram: {
        type: String,
        default: null,
      },
      Zalo: {
        type: String,
        default: null,
      },
      Telegram: {
        type: String,
        default: null,
      },
      Twitter: {
        type: String,
        default: null,
      },
      Tiktok: {
        type: String,
        default: null,
      },
      Skype: {
        type: String,
        default: null,
      },
      Youtube: {
        type: String,
        default: null,
      },
      Linkedn: {
        type: String,
        default: null,
      },
    },
    office: {
      type: String,
      default: null,
    },
    office_email: {
      type: String,
      default: null,
    },
    private_email: {
      type: String,
      default: null,
    },
    private_phone: {
      type: String,
      default: null,
    },
    office_phone: {
      type: String,
      default: null,
    },
    department: {
      type: Number,
      default: 0,
    },
    sector: {
      //Lĩnh vực
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    status: {
      // check is converted to customer
      // 1 is converted
      type: Number,
      default: 0,
    },
    classify: {
      // phân loại tiềm năng
      type: Number,
      default: 0,
    },
    user_create_id: {
      type: Number,
      default: 0,
    },
    user_create_name: {
      type: String,
      default: "",
    },
    cus_id: {
      //id khách hàng
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_potential",
    versionKey: false,
  }
);
module.exports = mongoose.model("CRM_potential", potential_crm);
