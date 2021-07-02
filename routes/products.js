var express = require("express");
var router = express.Router();
let Product = require("../models/products.model");
const productsController = require("../controllers/productsController");
router.get("/", productsController.products);
router.get("/top-picks", async (req, res, next) => {
  let products;
  try {
    products = await Product.find({}).limit(8).sort({ VIEW: -1 });
  } catch (err) {
    res.status(404).send(err);
  }
  res.send(products);
});

router.get("/search", async (req, res, next) => {
  let products;
  const query = req.query.search;
  const page = parseInt(req.query.page || "0");
  try {
    products = await Product.find({ $text: { $search: query } })
      .limit(9)
      .skip(page * 9);
  } catch (err) {
    res.status(404).send(err);
  }
  let count;
  try {
    count = await Product.countDocuments({ $text: { $search: query } });
  } catch (err) {
    res.status(404).send(err);
  }
  res.json({
    totalPages: Math.ceil(count / 9),
    products: products,
  });
});
router.get("/categories", productsController.categories);
router.get("/:id", async (req, res, next) => {
  let product;
  try {
    product = await Product.findOne({ _id: req.params.id });
    product.VIEW = product.VIEW + 1;
    product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});
router.get("/:id/related", async (req, res, next) => {
  let product;
  try {
    product = await Product.findOne({ _id: req.params.id });
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
  const category = product.TYPE;
  let count;
  try {
    count = await Product.countDocuments({
      TYPE: category,
      _id: { $nin: [req.params.id] },
    });
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
  let related;
  const random = (count) => {
    const result = Math.floor(Math.random() * (count - 4));
    return result;
  };
  try {
    related = await Product.find({
      TYPE: category,
      _id: { $nin: [req.params.id] },
    })
      .limit(5)
      .skip(random(count));
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
  res.send(related);
});
module.exports = router;
