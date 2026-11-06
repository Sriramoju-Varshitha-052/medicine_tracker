
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const MedicalShop = require("../models/MedicalShop");
const authMiddleware = require("../middleware/authMiddleware");

// 1. User places an order
router.post("/place", authMiddleware, async (req, res) => {
    try {
        // Only users can place orders
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only users can place orders"
            });
        }

        const { medicineId, quantity, deliveryAddress } = req.body;

        if (!medicineId || !Number.isInteger(quantity) ||
            quantity <= 0 || !deliveryAddress) {
            return res.status(400).json({
                message: "Valid medicineId, quantity and deliveryAddress are required"
            });
        }

        // Find medicine
        const medicine = await Medicine.findById(medicineId);

        if (!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        // Check medical shop
        const shop = await MedicalShop.findOne({
            _id: medicine.medicalShop,
            status: "approved",
            isOpen: true
        });

        if (!shop) {
            return res.status(400).json({
                message: "Medical shop is closed or not approved"
            });
        }

        // Check stock
        if (medicine.quantity < quantity) {
            return res.status(400).json({
                message: "Insufficient medicine stock"
            });
        }

        // Calculate total price using database price
        const totalPrice = medicine.price * quantity;

        // Reduce stock
        const updatedMedicine = await Medicine.findOneAndUpdate(
            {
                _id: medicineId,
                quantity: { $gte: quantity }
            },
            {
                $inc: { quantity: -quantity }
            },
            { new: true }
        );

        if (!updatedMedicine) {
            return res.status(400).json({
                message: "Insufficient stock. Please try again."
            });
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            medicalShop: medicine.medicalShop,
            medicine: medicineId,
            quantity,
            totalPrice,
            deliveryAddress
        });

        await order.save();

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error placing order",
            error: error.message
        });
    }
});

module.exports = router;
