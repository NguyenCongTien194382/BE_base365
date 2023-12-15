const mongoose = require("mongoose");
const product_potential = mongoose.Schema(
  {
    id: {
      type: Number,
      require: true,
    },
    cus_id: {
      type: Number,
      require: true,
    },
    product_id: {
      type: Number,
      require: true,
    },
    created_at: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "CRM_product_potential",
    timestamps: true,
  }
);
module.exports = mongoose.model("CRM_product_potential", product_potential);
