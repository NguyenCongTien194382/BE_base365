const mongoose = require("mongoose");

const diary_potential = mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    create_at: {
      type: Number,
      required: true,
    },
    emp_id: {
      type: Number,
      required: true,
    },
    action: {
      // 0: Update; 1: Delete; 2: Restore, 3: Add
      type: Number,
      default: 0,
    },
    id_action: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "CRM_potential_diary",
    timestamps: true,
  }
);

module.exports = mongoose.model("CRM_potential_diary", diary_potential);
