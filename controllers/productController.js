const Product = require("../models/product");
const Category = require("../models/category");
const File = require("../models/file");
const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const categoryIds = req.query.categories ? req.query.categories.split(',') : []; // Expect a comma-separated list of IDs
    const sizes = req.query.sizes ? req.query.sizes.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortAsc = req.query.sort === "true";
    
    // Initialize query object
    const query = {
      isDrafted: false,
    };

    // Handle multiple categories
    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds }; // Use $in operator for multiple categories
    }

    // Handle multiple sizes
    if (sizes.length > 0) {
      query.size = { $in: sizes }; // Use $in operator for multiple sizes
    }

    // Pagination and sorting options
    const options = {
      page,
      limit,
      sort: sortAsc ? { buyPrice: 1 } : { buyPrice: -1 },
      populate: [
        { path: 'category' }, // Populate the category reference
        { path: 'arrival' }   // Populate the arrival reference
      ],
    };

    // Fetch products with pagination
    const result = await Product.paginate(query, options);
    const products = result.docs;

    // Fetch image URLs using Promise.all for better performance
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const file = await File.findById(product.image);
        return {
          ...product.toObject(), // Convert Mongoose document to plain object
          imageUrl: file?.url, // Add imageUrl field
        };
      })
    );

    // Send response
    res.status(200).json({
      docs: productsWithImages,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving Products.");
  }
};

const getRandomProducts = async (req, res) => {
  try {
    const randomNumber = 10; // Number of random products to fetch
    const baseUrl = process.env.BASE_URL;

    const products = await Product.aggregate([
      { $match: { isDrafted: false } }, // Ensure only non-drafted products are considered
      { $sample: { size: randomNumber } }, // Randomly sample 10 products
      {
        $lookup: {
          from: "categories", // This should match the name of the collection for categories
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "files", // This should match the name of the collection for files
          localField: "image", // Adjust this field if necessary
          foreignField: "_id",
          as: "image",
        },
      },
      { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } }, // Unwind the image array to return as an object
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }, // Unwind the category array to return as an object
      {
        $addFields: {
          imageUrl: { $concat: [baseUrl, "$image.url"] },
        },
      },
    ]);

    // Send response
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving random Products.");
  }
};

const generateBarcode = async () => {
  let barcode;
  let isUnique = false;

  while (!isUnique) {
    barcode = Math.random().toString().slice(2, 11).padEnd(9, "0");
    const existingProduct = await Product.findOne({ barcode });
    if (!existingProduct) {
      isUnique = true;
    }
  }

  return barcode;
};

const createProducts = async (req, res) => {
  try {
    const { category: categoryId, items, arrival: arrivalId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    let productsToCreate = [];

    for (const item of items) {
      const { size, price, quantity, buyPrice } = item;

      for (let i = 0; i < quantity; i++) {
        const barcode = await generateBarcode();
        const name = `${category.name} (${size}) #${barcode}`;

        productsToCreate.push({
          category: categoryId,
          size,
          sellPrice: price,
          buyPrice: buyPrice,
          barcode,
          name,
          arrival: arrivalId,
        });
      }
    }

    const createdProducts = await Product.insertMany(productsToCreate);

    category.stock += createdProducts.length;
    await category.save();

    res.status(200).json(createdProducts);
  } catch (error) {
    console.error("Failed to create products:", error);
    res.status(500).json({ error: "Error creating products", details: error });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      category: categoryId,
      size,
      price,
      buyPrice,
      arrival: arrivalId,
      image,
    } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const barcode = await generateBarcode();
    const name = `${category.name} (${size}) #${barcode}`;

    const newProduct = {
      category: categoryId,
      size,
      sellPrice: price,
      buyPrice: buyPrice,
      image: image,
      barcode,
      name,
      arrival: arrivalId,
    };

    const createdProduct = await Product.create(newProduct);

    category.stock += 1; // Increment the stock by 1 for the new product
    await category.save();

    res.status(200).json(createdProduct);
  } catch (error) {
    console.error("Failed to create product:", error);
    res.status(500).json({ error: "Error creating product", details: error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    const productId = req.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      {
        new: true,
      }
    ).populate("category arrival");
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Convert Mongoose document to plain JavaScript object
    const updatedProductObject = updatedProduct.toObject();
    const file = await File.findById(updatedProduct?.image);
    updatedProductObject.imageUrl = file?.url;
    res.status(200).json(updatedProductObject);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating Product",
    });
    console.error(error);
  }
};

const getOneProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: barcode }).populate([
      { path: "category", select: "name discount" },
      { path: "arrival", select: "name" },
    ]);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const singleProduct = product.toObject();
    const file = await File.findById(singleProduct?.image);
    singleProduct.imageUrl = file?.url;
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error getting Product" });
    console.error(error);
  }
};

const getSingleProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId).populate('category'); // populate the category reference
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const singleProduct = product.toObject();
    const file = await File.findById(singleProduct?.image);
    singleProduct.imageUrl = file?.url;
    res.status(200).json(singleProduct); // ensure singleProduct is sent instead of product
  } catch (error) {
    res.status(500).json({ error: "Error getting Product" });
    console.error(error);
  }
};


module.exports = {
  getAllProducts,
  getRandomProducts,
  updateProduct,
  getOneProduct,
  createProduct,
  createProducts,
  getSingleProduct,
};
