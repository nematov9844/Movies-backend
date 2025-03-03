const Movie = require("../models/Movie");

// === Barcha kinolarni olish (filter va qidiruv bilan) ===
const getMovies = async (req, res) => {
  try {
    const { search, genre, minYear, maxYear, sortBy, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" }; // Kino nomi bo‘yicha qidirish
    }
    if (genre) {
      filter.genre = genre;
    }
    if (minYear || maxYear) {
      filter.releaseYear = {};
      if (minYear) filter.releaseYear.$gte = parseInt(minYear);
      if (maxYear) filter.releaseYear.$lte = parseInt(maxYear);
    }

    let query = Movie.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (sortBy) {
      query = query.sort({ [sortBy]: -1 });
    }

    const movies = await query;
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// === Bitta kinoni olish ===
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Kino topilmadi" });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// === Yangi kino qo‘shish ===
const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: "Kino qo‘shildi!", movie });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// === Kinoni yangilash ===
const updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMovie) {
      return res.status(404).json({ message: "Kino topilmadi" });
    }
    res.json({ message: "Kino yangilandi!", updatedMovie });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// === Kinoni o‘chirish ===
const deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Kino topilmadi" });
    }
    res.json({ message: "Kino o‘chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
