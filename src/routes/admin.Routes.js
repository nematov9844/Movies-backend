const express = require("express");
const { addMovie, updateMovie, deleteMovie } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// Kino qo‘shish
router.post("/movies", protect, adminMiddleware, addMovie);

// Kinoni yangilash
router.put("/movies/:id", protect, adminMiddleware, updateMovie);

// Kinoni o‘chirish
router.delete("/movies/:id", protect, adminMiddleware, deleteMovie);

module.exports = router;
