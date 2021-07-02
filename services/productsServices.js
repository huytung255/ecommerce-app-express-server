let Product = require("../models/products.model");
exports.products = async (page, query, sort) => {
  const PAGE_SIZE = 9;
  const allProducts = await Product.find({
    ...query,
  })
    .limit(PAGE_SIZE)
    .skip(PAGE_SIZE * page)
    .sort(sort);
  return allProducts;
};
exports.countProducts = async (query) => {
  // const count = await Product.countDocuments({
  //   $or: [{ TYPE: "pizza" }, { TYPE: "burger" }],
  // });
  const count = await Product.countDocuments({
    ...query,
  });
  return count;
};
exports.allCategories = async () => {
  const allProducts = await Product.find();
  const allCategories = [...new Set(allProducts.map((item) => item.TYPE))];
  return allCategories;
};
