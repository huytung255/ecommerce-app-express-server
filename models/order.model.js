const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    CUS_ID: mongoose.ObjectId,
    STAFF_ID: mongoose.ObjectId,
    DATECREATED: Date,
    STATUS: Number,
    TOTAL: Number,
    NAME: String,
    PHONE: String,
    ADDRESS: String,
    TIME: String,
    NOTE: String,
  },
  { collection: "ORDER" }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
