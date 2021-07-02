const productsServices = require("../services/productsServices");
exports.products = async (req, res, next) => {
  try {
    const query = [];
    if (req.query.category) {
      let typeQuery = { $or: [] };
      for (let i in req.query.category) {
        const temp = { TYPE: req.query.category[i] };
        typeQuery.$or = [...typeQuery.$or, temp];
      }
      query.push(typeQuery);
    }
    if (req.query.availability) {
      let availabilityQuery = { $or: [] };
      for (let i in req.query.availability) {
        const temp = { STATUS: Number.parseInt(req.query.availability[i]) };
        availabilityQuery.$or = [...availabilityQuery.$or, temp];
      }
      query.push(availabilityQuery);
    }
    if (req.query.range) {
      let rangeQuery = { $or: [] };
      for (let i in req.query.range) {
        const range = JSON.parse(req.query.range[i]);
        let temp;
        if (range.length === 2) {
          temp = { PRICE: { $gte: range[0], $lte: range[1] } };
        }
        if (range.length === 1) {
          temp = { PRICE: { $gte: range[0] } };
        }
        rangeQuery.$or = [...rangeQuery.$or, temp];
      }
      query.push(rangeQuery);
    }
    let sort = {};
    if (req.query.name) {
      sort["DISH_NAME"] = Number.parseInt(req.query.name);
    }
    if (req.query.price) {
      sort["PRICE"] = Number.parseInt(req.query.price);
    }
    if (req.query.view) {
      sort["VIEW"] = Number.parseInt(req.query.view);
    }
    let finalQuery = {};
    if (query.length > 1) {
      finalQuery.$and = query;
    }
    if (query.length === 1) {
      finalQuery = { ...query[0] };
    }
    const PAGE_SIZE = 9;
    const page = parseInt(req.query.page || "0");
    const products = await productsServices.products(page, finalQuery, sort);
    const total = await productsServices.countProducts(finalQuery);
    res.json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      products: products,
    });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};
exports.categories = async (req, res, next) => {
  try {
    const allCategories = await productsServices.allCategories();
    res.json(allCategories);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};
