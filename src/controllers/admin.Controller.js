const Movie = require("../models/Movie");

// Kino qo‘shish
const addMovie = async (req, res) => {
  try {
    const { title, description, duration, releaseDate, genres, posterUrl } = req.body;

    const movie = new Movie({
      title,
      description,
      duration,
      releaseDate,
      genres,
      posterUrl,
    });

    await movie.save();
    res.status(201).json({ message: "Kino qo‘shildi!", movie });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// Kinoni yangilash
const updateMovie = async (req, res) => {
  try {
    const { title, description, duration, releaseDate, genres, posterUrl } = req.body;
    const movie = await Movie.findByIdAndUpdate(req.params.id, { title, description, duration, releaseDate, genres, posterUrl }, { new: true });

    if (!movie) return res.status(404).json({ message: "Kino topilmadi" });

    res.json({ message: "Kino yangilandi", movie });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// Kinoni o‘chirish
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Kino topilmadi" });

    res.json({ message: "Kino o‘chirildi" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

module.exports = { addMovie, updateMovie, deleteMovie };
