const express = require("express");
const { createCheckoutSession, webhookHandler } = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// To‘lov sessiyasi yaratish
router.post("/create-checkout-session", protect, createCheckoutSession);

// Webhook orqali to‘lov natijasini tekshirish
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

module.exports = router;
