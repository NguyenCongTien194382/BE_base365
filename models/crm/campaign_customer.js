const mongoose = require("mongoose");
const potential_campaign = mongoose.Schema(
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
  },
  {
    collection: "CRM_potential_campaign",
    timestamps: true,
  }
);
module.exports = mongoose.model("CRM_potential_campaign", potential_campaign);
