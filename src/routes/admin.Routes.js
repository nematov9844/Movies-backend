const express = require("express");
const { addMovie, updateMovie, deleteMovie } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: "Admin kinolarni boshqaradi"
 */

/**
 * @swagger
 * /api/admin/movies:
 *   post:
 *     summary: "Yangi kino qo‘shish"
 *     description: "Admin tomonidan yangi kino qo‘shish"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: "Kino nomi"
 *               description:
 *                 type: string
 *                 description: "Kino haqida ma'lumot"
 *               duration:
 *                 type: number
 *                 description: "Davomiyligi (daqiqada)"
 *               price:
 *                 type: number
 *                 description: "Chipta narxi (USD)"
 *     responses:
 *       201:
 *         description: "Kino muvaffaqiyatli qo‘shildi"
 *       400:
 *         description: "Xato so‘rov"
 *       403:
 *         description: "Faqat adminlar qo‘sha oladi"
 */
router.post("/movies", protect, adminMiddleware, addMovie);

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   put:
 *     summary: "Kino ma’lumotlarini yangilash"
 *     description: "Admin mavjud kinoni yangilaydi"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Yangilanadigan kino ID'si"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: "Kino nomi"
 *               description:
 *                 type: string
 *                 description: "Kino haqida ma'lumot"
 *               duration:
 *                 type: number
 *                 description: "Davomiyligi (daqiqada)"
 *               price:
 *                 type: number
 *                 description: "Chipta narxi (USD)"
 *     responses:
 *       200:
 *         description: "Kino muvaffaqiyatli yangilandi"
 *       400:
 *         description: "Xato so‘rov"
 *       403:
 *         description: "Faqat adminlar yangilay oladi"
 *       404:
 *         description: "Kino topilmadi"
 */
router.put("/movies/:id", protect, adminMiddleware, updateMovie);

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   delete:
 *     summary: "Kino o‘chirish"
 *     description: "Admin kino ma’lumotlarini o‘chirishi mumkin"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "O‘chiriladigan kino ID'si"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Kino muvaffaqiyatli o‘chirildi"
 *       403:
 *         description: "Faqat adminlar o‘chira oladi"
 *       404:
 *         description: "Kino topilmadi"
 */
router.delete("/movies/:id", protect, adminMiddleware, deleteMovie);

module.exports = router;
