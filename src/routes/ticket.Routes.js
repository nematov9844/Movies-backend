const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { 
  createCheckoutSession,
  buyTicket
} = require("../controllers/ticket.Controller");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: "Chipta xarid qilish"
 */

/**
 * @swagger
 * /api/tickets/create-checkout-session:
 *   post:
 *     summary: "Stripe checkout session yaratish"
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - seatNumber
 *               - price
 *     responses:
 *       200:
 *         description: "To'lov sessiyasi yaratildi"
 */
router.post("/create-checkout-session", protect, createCheckoutSession);

/**
 * @swagger
 * /api/tickets/buy:
 *   post:
 *     summary: "Chipta sotib olish"
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - seatNumber
 *     responses:
 *       200:
 *         description: "Chipta muvaffaqiyatli sotib olindi"
 */
router.post("/buy", protect, buyTicket);

module.exports = router;
