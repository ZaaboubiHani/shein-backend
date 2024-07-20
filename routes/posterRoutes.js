const express = require("express");
const router = express.Router();
const posterUploadController = require("../controllers/posterController");

// Define routes

router.post("/", posterUploadController.uploadImage);
router.get("/", posterUploadController.getAllPosters);
router.delete("/:id", posterUploadController.deletePoster);

module.exports = router;
