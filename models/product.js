const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    arrival: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arrival",
    },
    inSale: {
      type: Boolean,
      default: false,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    size: {
      type: String,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    buyPrice: {
      type: Number,
      default: 0,
    },
    sellPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isDrafted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: false,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
