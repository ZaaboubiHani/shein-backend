const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.delete("/:id", commentController.deleteComment);
router.post("/", commentController.createComment);
module.exports = router;
