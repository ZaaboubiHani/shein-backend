const mongoose = require("mongoose");

const arrivalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    date: {
      type: Date,
    },
    quantity: {
      type: Number,
    },
    numBoxes: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    items: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    isDrafted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Arrival = mongoose.model("Arrival", arrivalSchema);

module.exports = Arrival;
