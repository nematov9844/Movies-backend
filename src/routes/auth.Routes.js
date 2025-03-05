const express = require("express");
const { registerUser, loginUser, verifyEmail, getMe } = require("../controllers/auth.Controller");
const { protect } = require("../middlewares/authMiddleware");


const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: "Foydalanuvchi autentifikatsiyasi"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: "Foydalanuvchini ro‘yxatdan o‘tkazish"
 *     description: "Yangi foydalanuvchini ro‘yxatdan o‘tkazish"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Foydalanuvchi ismi"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Foydalanuvchi emaili"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "Foydalanuvchi paroli"
 *     responses:
 *       201:
 *         description: "Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi"
 *       400:
 *         description: "Xato so‘rov"
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "Foydalanuvchini tizimga kirishi"
 *     description: "Foydalanuvchi email va parol orqali tizimga kiradi"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Foydalanuvchi emaili"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "Foydalanuvchi paroli"
 *     responses:
 *       200:
 *         description: "Foydalanuvchi muvaffaqiyatli tizimga kirdi"
 *       401:
 *         description: "Noto‘g‘ri email yoki parol"
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: "Emailni tasdiqlash"
 *     description: "Foydalanuvchi email tasdiqlash uchun ushbu marshrutdan foydalanadi"
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: "Email tasdiqlash tokeni"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Email muvaffaqiyatli tasdiqlandi"
 *       400:
 *         description: "Noto‘g‘ri yoki muddati o‘tgan token"
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: "Foydalanuvchi ma'lumotlarini olish"
 *     description: "Joriy foydalanuvchi ma'lumotlarini qaytaradi"
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Foydalanuvchi ma'lumotlari muvaffaqiyatli qaytarildi"
 *       401:
 *         description: "Avtorizatsiya xatosi"
 *       404:
 *         description: "Foydalanuvchi topilmadi"
 */
router.get("/me", protect, getMe);

module.exports = router;
