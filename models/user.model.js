const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    CUS_EMAIL: String,
    PASSWORD: String,
    CUS_NAME: String,
    CUS_PHONE: String,
    CUS_ADDRESS: String,
    BIRTHDAY: Date,
    IS_VERIFIED: Boolean,
    IS_LOCK: Boolean,
  },
  { collection: "CUSTOMER" }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
