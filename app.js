const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();
const path = require("path");

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "SHEIN",
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Increase the payload limit for JSON data
app.use(express.json());
app.use(morgan("tiny"));

// // Define routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const arrivalRoutes = require("./routes/arrivalRoutes");
const orderRoutes = require("./routes/orderRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const statsRoutes = require("./routes/statsRoutes");
const clientRoutes = require("./routes/clientRoutes");
const discountRoutes = require("./routes/discountRoutes");
const customerRoutes = require("./routes/customerRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const posterRoutes = require("./routes/posterRoutes");
const fileRoutes = require("./routes/fileRoutes");
const commentRoutes = require("./routes/commentRoutes");

const api = process.env.API_URL;

app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/arrivals", arrivalRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/expenses", expenseRoutes);
app.use("/stats", statsRoutes);
app.use("/clients", clientRoutes);
app.use("/discounts", discountRoutes);
app.use("/customers", customerRoutes);
app.use("/passwords", passwordRoutes);
app.use("/posters", posterRoutes);
app.use("/comments", commentRoutes);
app.use("/uploads/posters", express.static("uploads/posters/"));
app.use("/upload", fileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "images")));

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status).json({ message: err });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
