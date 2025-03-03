const express = require("express");
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require("../controllers/wishlist.Controller");
const { protect } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: "Foydalanuvchi xohlagan kinolar ro‘yxati"
 */

/**
 * @swagger
 * /api/wishlist/add:
 *   post:
 *     summary: "Wishlistga kino qo‘shish"
 *     tags: [Wishlist]
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
 *                 description: "Foydalanuvchi ID"
 *               movieId:
 *                 type: string
 *                 description: "Kino ID"
 *     responses:
 *       200:
 *         description: "Kino wishlistga qo‘shildi"
 *       400:
 *         description: "Kino allaqachon mavjud yoki xato so‘rov"
 *       500:
 *         description: "Server xatosi"
 */
router.post("/add", protect, addToWishlist);

/**
 * @swagger
 * /api/wishlist/remove:
 *   delete:
 *     summary: "Wishlistdan kino o‘chirish"
 *     tags: [Wishlist]
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
 *                 description: "Foydalanuvchi ID"
 *               movieId:
 *                 type: string
 *                 description: "O‘chiriladigan kino ID"
 *     responses:
 *       200:
 *         description: "Kino wishlistdan o‘chirildi"
 *       404:
 *         description: "Wishlist topilmadi"
 *       500:
 *         description: "Server xatosi"
 */
router.delete("/remove", protect, removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/{userId}:
 *   get:
 *     summary: "Foydalanuvchining wishlistini olish"
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: "Foydalanuvchi ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Wishlist muvaffaqiyatli qaytarildi"
 *       404:
 *         description: "Wishlist topilmadi"
 *       500:
 *         description: "Server xatosi"
 */
router.get("/:userId", protect, getWishlist);

module.exports = router;
