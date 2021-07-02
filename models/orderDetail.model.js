const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema(
  {
    ORDER_ID: mongoose.ObjectId,
    DISH_ID: mongoose.ObjectId,
    SUBTOTAL: Number,
    QUANTITY: Number,
  },
  { collection: "ORDER_DETAIL" }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);

module.exports = OrderDetail;
