const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(express.json());

// User Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// Medical Shop Routes
const medicalShopRoutes = require("./routes/medicalShopRoutes");

app.use("/api/medical-shops", medicalShopRoutes);
// Medicine Routes
const medicineRoutes = require("./routes/medicineRoutes");

app.use("/api/medicines", medicineRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
// Order Routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

// Home Route
app.get("/", (req, res) => {
    res.send("Medicine Search and Tracking System Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});