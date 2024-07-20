const Comment = require("../models/comment"); // Adjust the path as necessary

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content, product } = req.body;

    if (!content || !product) {
      return res
        .status(400)
        .send({ message: "Content and product are required" });
    }

    const newComment = new Comment({
      content,
      product,
    });

    await newComment.save();

    res.status(201).send(newComment);
  } catch (err) {
    res.status(500).send({
      message: "Error occurred while creating the comment",
      error: err.message,
    });
  }
};

// Delete an existing comment by ID
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    res.send({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error occurred while deleting the comment",
      error: err.message,
    });
  }
};

module.exports = {
  createComment,
  deleteComment,
};
