const express = require("express");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movie.Controller");

const router = express.Router();

router.get("/", getMovies); // Kinolarni olish
router.get("/:id", getMovieById); // Bitta kinoni olish
router.post("/", createMovie); // Yangi kino qo‘shish
router.put("/:id", updateMovie); // Kinoni yangilash
router.delete("/:id", deleteMovie); // Kinoni o‘chirish

module.exports = router;
