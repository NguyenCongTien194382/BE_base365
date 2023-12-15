const mongoose = require("mongoose");

const history_stage_chance = mongoose.Schema(
  {
    _id: {
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
    expected_revenue: {
      type: Number,
      default: 0,
    },
    success_rate: {
      type: Number,
      default: 0,
    },
    end_date: {
      type: Number,
      default: 0,
    },
    user_edit_id: {
      type: Number,
      default: 0,
    },
    company_id: {
      type: Number,
      default: 0,
    },
    stage_id: {
      type: Number,
      default: 0,
    },
    money: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_history_stage_chance",
    timestamps: true,
  }
);
module.exports = mongoose.model(
  "CRM_history_stage_chance",
  history_stage_chance
);
