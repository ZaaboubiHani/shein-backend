const multer = require("multer");
const path = require("path");
const Poster = require("../models/poster");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/posters/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
}).single("poster");

// Function to delete a file from the file system
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const deletePoster = async (req, res) => {
  try {
    const posterId = req.params.id;
    const poster = await Poster.findById(posterId);

    if (!poster) {
      return res.status(404).send({ message: "Poster not found" });
    }
    const baseUrl = process.env.BASE_URL;
    // Construct the correct file system path
    const filePath = poster.url.replace(baseUrl, "");

    // Delete the file from the file system
    await deleteFile(filePath);

    // Remove the poster entry from the database
    await Poster.findByIdAndDelete(posterId);

    res.send({ message: "Poster deleted successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error occurred during deletion",
      error: err,
    });
  }
};

const uploadImage = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if a poster was uploaded
    if (!req.file) {
      return res.status(400).send({ message: "No poster selected" });
    }
    const fileUrl = req.file.path.replace(/\\/g, "/");
    const newPoster = new Poster({ url: fileUrl }); // Store the single poster URL in an array

    await newPoster.save();

    res.send(newPoster);
  } catch (err) {
    console.log("err:" + err);
    res.status(500).send({
      message: "Error occurred during upload or database operation",
      error: err,
    });
  }
};

const getAllPosters = async (req, res) => {
  try {
    const posters = await Poster.find();
    res.send(posters);
  } catch (err) {
    res.status(500).send({
      message: "Error occurred while fetching posters",
      error: err,
    });
  }
};

module.exports = {
  uploadImage,
  getAllPosters,
  deletePoster,
};
