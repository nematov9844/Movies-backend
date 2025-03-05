const express = require("express");
const { createSession, getAllSessions, getSessionById, updateSession, deleteSession } = require("../controllers/session.Controller");
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Kino seanslarini boshqarish
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Yangi seans yaratish
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movie:
 *                 type: string
 *                 description: Film ID
 *               hall:
 *                 type: string
 *                 description: Kino zal nomi
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Seans sanasi
 *               time:
 *                 type: string
 *                 description: Seans vaqti
 *               price:
 *                 type: number
 *                 description: Chipta narxi
 *               availableSeats:
 *                 type: number
 *                 description: Mavjud joylar soni
 *               totalSeats:
 *                 type: number
 *                 description: Jami joylar soni
 *     responses:
 *       201:
 *         description: Seans muvaffaqiyatli yaratildi
 *       400:
 *         description: Xatolik yuz berdi
 */
router.post("/", createSession);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Barcha seanslarni olish
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Seanslar ro‘yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/", getAllSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Seansni ID bo‘yicha olish
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seans ID
 *     responses:
 *       200:
 *         description: Seans ma‘lumotlari
 *       404:
 *         description: Seans topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/:id", getSessionById);

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Seansni yangilash
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seans ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hall:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               price:
 *                 type: number
 *               availableSeats:
 *                 type: number
 *     responses:
 *       200:
 *         description: Seans yangilandi
 *       404:
 *         description: Seans topilmadi
 *       400:
 *         description: Xatolik yuz berdi
 */
router.put("/:id", updateSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Seansni o‘chirish
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seans ID
 *     responses:
 *       200:
 *         description: Seans o‘chirildi
 *       404:
 *         description: Seans topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/:id", deleteSession);

module.exports = router;
