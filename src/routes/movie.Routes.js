const express = require("express");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movie.Controller");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: "Kino bilan bog‘liq operatsiyalar"
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: "Barcha kinolarni olish"
 *     description: "Mavjud barcha kinolar ro‘yxatini qaytaradi"
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: "Kinolar ro‘yxati muvaffaqiyatli qaytarildi"
 *       500:
 *         description: "Server xatosi"
 */
router.get("/", getMovies);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: "Bitta kinoni olish"
 *     description: "ID bo‘yicha bitta kinoni qaytaradi"
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Kinoning ID si"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Kino muvaffaqiyatli topildi"
 *       404:
 *         description: "Kino topilmadi"
 */
router.get("/:id", getMovieById);

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: "Yangi kino qo‘shish"
 *     description: "Admin yangi kino qo‘shishi mumkin"
 *     tags: [Movies]
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
 *                 description: "Kinoning nomi"
 *               description:
 *                 type: string
 *                 description: "Kinoning tavsifi"
 *               duration:
 *                 type: integer
 *                 description: "Davomiyligi (minut)"
 *               price:
 *                 type: number
 *                 description: "Chipta narxi"
 *     responses:
 *       201:
 *         description: "Kino muvaffaqiyatli qo‘shildi"
 *       403:
 *         description: "Ruxsat yo‘q (faqat admin)"
 */
router.post("/", protect, isAdmin, createMovie);

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: "Kinoni yangilash"
 *     description: "Mavjud kinoni yangilaydi"
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Yangilanayotgan kinoning ID si"
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
 *                 description: "Yangilangan kino nomi"
 *               description:
 *                 type: string
 *                 description: "Yangilangan tavsif"
 *               duration:
 *                 type: integer
 *                 description: "Yangilangan davomiylik"
 *               price:
 *                 type: number
 *                 description: "Yangilangan narx"
 *     responses:
 *       200:
 *         description: "Kino muvaffaqiyatli yangilandi"
 *       404:
 *         description: "Kino topilmadi"
 */
router.put("/:id", protect,isAdmin,updateMovie);

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: "Kinoni o‘chirish"
 *     description: "Admin kinoni o‘chirishi mumkin"
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "O‘chirayotgan kinoning ID si"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Kino muvaffaqiyatli o‘chirildi"
 *       403:
 *         description: "Ruxsat yo‘q (faqat admin)"
 *       404:
 *         description: "Kino topilmadi"
 */
router.delete("/:id",protect,isAdmin, deleteMovie);

module.exports = router;
