const Category = require("../models/category");
const Product = require("../models/product");
const File = require("../models/file");

const createCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      ...req.body,
    });

    const createdCategory = await newCategory.save();

    res.status(200).json(createdCategory);
  } catch (error) {
    res.status(500).json({ error: "Error creating Category" });
  }
};
const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    // Convert Mongoose document to plain JavaScript object
    const updatedCategoryObject = updatedCategory.toObject();

    const file = await File.findById(updatedCategory.image);
    updatedCategoryObject.imageUrl = file?.url;

    res.status(200).json(updatedCategoryObject);
  } catch (error) {
    res.status(500).json({ error: "Error updating Category" });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDrafted: false })
      .sort({ name: 1 })
      .lean();

    for (let category of categories) {
      const file = await File.findById(category.image);
      const inSaleTrueCount = await Product.countDocuments({
        category: category._id,
        inSale: true,
        isSold: false,
      });
      const inSaleFalseCount = await Product.countDocuments({
        category: category._id,
        inSale: false,
        isSold: false,
      });
      
      category.imageUrl = file?.url;
      category.productCounts = {
        inSaleTrueCount,
        inSaleFalseCount,
      };
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching categories" });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getCategories,
};
