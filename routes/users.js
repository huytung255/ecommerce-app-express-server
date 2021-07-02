var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const Products = require("../models/products.model");
const utils = require("../lib/utils");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post(
  "/place-order",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    console.log(req.body);
    const order = new Order({
      CUS_ID: req.user._id,
      STAFF_ID: null,
      DATECREATED: Date.now(),
      STATUS: 0,
      TOTAL: req.body.total,
      NAME: req.body.name,
      PHONE: req.body.phone,
      ADDRESS: req.body.address,
      TIME: req.body.time,
      NOTE: req.body.note,
    });
    let savedOrder;
    try {
      savedOrder = await order.save();
    } catch (err) {
      res.status(400).json("Error: " + err);
    }
    const { items } = req.body;
    for (let i in items) {
      const orderDetails = new OrderDetail({
        ORDER_ID: savedOrder._id,
        DISH_ID: i,
        QUANTITY: items[i].qty,
        SUBTOTAL: items[i].price,
      });
      let savedDetails;
      try {
        savedDetails = await orderDetails.save();
      } catch (err) {
        res.status(400).json("Error: " + err);
      }
    }
    res.status(200).send(savedOrder._id);
    // order.save().then((err, savedOrder) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(400).send("Bad Request");
    //   }
    //   if (savedOrder === order) {
    //     for (let i in items) {
    //       const orderDetails = new OrderDetail({
    //         ORDER_ID: savedOrder._id,
    //         DISH_ID: i,
    //         QUANTITY: items[i].qty,
    //         SUBTOTAL: items[i].price
    //       })
    //       orderDetails.save().then((err, savedDetails) => {
    //         if (err) {
    //           console.log(err);
    //           res.status(400).send("Bad Request");
    //         }

    //       })
    //     }
    //   } // true
    // });
  }
);
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { CUS_EMAIL, CUS_NAME, CUS_PHONE, CUS_ADDRESS, BIRTHDAY } = req.user;
    const profile = {
      email: CUS_EMAIL,
      name: CUS_NAME,
      phone: CUS_PHONE,
      address: CUS_ADDRESS,
      birthday: BIRTHDAY,
    };
    res.json(profile);
  }
);
router.post(
  "/profile/edit",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    let user = new User(req.user);
    user.CUS_NAME = req.body.name;
    user.CUS_PHONE = req.body.phone;
    user.CUS_ADDRESS = req.body.address;
    user.BIRTHDAY = req.body.birthday;
    user.save().then((savedDoc) => {
      if (savedDoc === user) {
        res.status(200).send("Edited successfully");
      } // true
    });
  }
);
router.post(
  "/profile/edit",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    let user = new User(req.user);
    user.CUS_NAME = req.body.name;
    user.CUS_PHONE = req.body.phone;
    user.CUS_ADDRESS = req.body.address;
    user.BIRTHDAY = req.body.birthday;
    user.save().then((savedDoc) => {
      if (savedDoc === user) {
        res.status(200).send("Edited successfully");
      } // true
    });
  }
);
router.post(
  "/profile/change-password",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    let user = new User(req.user);
    const isValid = await utils.validPassword(
      req.body.currentPassword,
      user.PASSWORD
    );
    if (!isValid) {
      return res.status(401).json({
        success: false,
        msg: "The current password you entered is not correct",
      });
    }
    const hashedPassword = await utils.genPassword(req.body.newPassword);
    user.PASSWORD = hashedPassword;
    user.save().then((savedDoc) => {
      if (savedDoc === user) {
        res.status(200).send("Password changed successfully");
      } // true
    });
  }
);
router.get(
  "/order-history",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const user = new User(req.user);
    let history = [];
    let historyItems;
    try {
      historyItems = await Order.find({ CUS_ID: user._id });
    } catch (err) {
      res.status(400).json("Error: " + err);
    }
    for (i in historyItems) {
      var temp = [];
      let details;
      try {
        details = await OrderDetail.find({ ORDER_ID: historyItems[i]._id });
      } catch (err) {
        res.status(400).json("Error: " + err);
      }
      for (j in details) {
        let product;
        try {
          product = await Products.findOne({ _id: details[j].DISH_ID });
        } catch (err) {
          res.status(400).json("Error: " + err);
        }
        temp.push({ image: product.IMAGES[0], qty: details[j].QUANTITY });
      }
      history.push({ historyItem: historyItems[i], imgQty: temp });
    }
    history.reverse();
    res.json(history);
  }
);
router.get(
  "/order-history/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const orderId = req.params.id;
    let order;
    try {
      order = await Order.findOne({ _id: orderId });
    } catch (err) {
      res.status(400).json("Error: " + err);
    }
    let details;
    try {
      details = await OrderDetail.find({ ORDER_ID: orderId });
    } catch (err) {
      res.status(400).json("Error: " + err);
    }
    let orderItems = [];
    for (i in details) {
      let product;
      try {
        product = await Products.findOne({ _id: details[i].DISH_ID });
      } catch (err) {
        res.status(400).json("Error: " + err);
      }
      let temp = {
        DISH_NAME: product.DISH_NAME,
        PRICE: product.PRICE,
        QUANTITY: details[i].QUANTITY,
        SUBTOTAL: details[i].SUBTOTAL,
        IMAGES: product.IMAGES,
      };
      orderItems.push(temp);
    }
    const sendInfo = {
      order: order,
      details: orderItems,
    };
    res.json(sendInfo);
  }
);
router.get(
  "/order-history/:id/cancel",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const orderId = req.params.id;
    let order;
    try {
      order = await Order.findOne({ _id: orderId });
    } catch (err) {
      res.status(400).json("Error: " + err);
    }
    order.STATUS = -1;
    order.STAFF_ID = order.STAFF_ID ? order.STAFF_ID : null;
    order.save().then((savedDoc) => {
      if (savedDoc === order) {
        res.status(200).json("Canceled successfully");
      } // true
    });
  }
);
module.exports = router;
