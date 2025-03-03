const express = require("express");
const { createCheckoutSession, webhookHandler } = require("../controllers/paymet.Controller");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: "To‘lov operatsiyalari"
 */

/**
 * @swagger
 * /api/payment/create-checkout-session:
 *   post:
 *     summary: "To‘lov sessiyasini yaratish"
 *     description: "Foydalanuvchi uchun Stripe to‘lov sessiyasini yaratadi"
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "Foydalanuvchi ID si"
 *               movieId:
 *                 type: string
 *                 description: "Kinoning ID si"
 *               seatNumber:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "O‘rindiqlar ro‘yxati"
 *               price:
 *                 type: number
 *                 description: "To‘lov summasi (USD)"
 *     responses:
 *       200:
 *         description: "To‘lov sessiyasi muvaffaqiyatli yaratildi"
 *       400:
 *         description: "So‘rovda xatolik bor"
 *       500:
 *         description: "Server xatosi"
 */
router.post("/create-checkout-session", protect, createCheckoutSession);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: "Stripe webhookni qabul qilish"
 *     description: "Stripe orqali kelgan to‘lov natijalarini tekshiradi"
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: "Webhook muvaffaqiyatli qabul qilindi"
 *       400:
 *         description: "Webhook tekshirishda xatolik"
 */
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

module.exports = router;
