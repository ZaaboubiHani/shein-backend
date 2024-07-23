const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const userJwt = require("../middlewares/userJwt");

router.post("/", productController.createProduct);
router.post("/many", productController.createProducts);
router.get("/", productController.getAllProducts);
router.get("/random", productController.getRandomProducts);
router.put("/:id", productController.updateProduct);
router.get("/single", productController.getOneProduct);
router.get("/:id", productController.getSingleProduct);

module.exports = router;
