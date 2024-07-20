const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const userJwt = require("../middlewares/userJwt");

// Define routes

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.put("/:id", categoryController.updateCategory);

module.exports = router;
