const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productsSchema = new Schema(
  {
    DISH_NAME: String,
    PRICE: Number,
    STATUS: Number,
    TYPE: String,
    DESCRIPTION: String,
    VIEW: Number,
    IMAGES: [String],
  },
  { collection: "DISH" }
);

const Products = mongoose.model("Products", productsSchema);
module.exports = Products;
