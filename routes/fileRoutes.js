const express = require("express");
const router = express.Router();
const fileUploadController = require("../controllers/fileUploadController");

// Define routes

router.post("/", fileUploadController.uploadImage);
router.delete("/:id", fileUploadController.deleteImage);

module.exports = router;
