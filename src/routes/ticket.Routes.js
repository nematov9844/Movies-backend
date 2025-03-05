const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { 
  createCheckoutSession,
  buyTicket,
  stripeWebhook
} = require("../controllers/ticket.Controller");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: "Chipta xarid qilish va Stripe webhook"
 */

/**
 * @swagger
 * /api/tickets/create-checkout-session:
 *   post:
 *     summary: "Stripe checkout session yaratish"
 *     description: "Foydalanuvchi filmga chipta sotib olish uchun Stripe to'lov sessiyasini yaratadi"
 *     tags: [Tickets]
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
 *                 description: "O'rindiqlar ro'yxati"
 *               price:
 *                 type: number
 *                 description: "Chipta narxi (USD)"
 *     responses:
 *       200:
 *         description: "To'lov sessiyasi yaratildi, foydalanuvchi Stripe to'lov sahifasiga yo'naltiriladi"
 *       400:
 *         description: "So'rovda xatolik bor"
 *       500:
 *         description: "Server xatosi"
 */
router.post("/create-checkout-session", protect, createCheckoutSession);

/**
 * @swagger
 * /api/tickets/buy:
 *   post:
 *     summary: "Chipta sotib olish"
 *     description: "Foydalanuvchi filmga chipta sotib olish uchun Stripe to'lov sessiyasini yaratadi"
 *     tags: [Tickets]
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
 *                 description: "O'rindiqlar ro'yxati"
 *               price:
 *                 type: number
 *                 description: "Chipta narxi (USD)"
 *     responses:
 *       200:
 *         description: "To'lov sessiyasi yaratildi, foydalanuvchi Stripe to'lov sahifasiga yo'naltiriladi"
 *       400:
 *         description: "So'rovda xatolik bor"
 *       500:
 *         description: "Server xatosi"
 */
router.post("/buy", protect, buyTicket);

/**
 * @swagger
 * /api/tickets/webhook:
 *   post:
 *     summary: "Stripe webhook orqali chipta tasdiqlash"
 *     description: "Stripe orqali kelgan to'lov natijalarini tekshiradi va foydalanuvchiga chipta beradi"
 *     tags: [Tickets]
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
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = router;
