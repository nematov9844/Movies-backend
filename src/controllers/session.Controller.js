const Session = require("../models/Session");
const Movie = require("../models/Movie");
const mongoose = require("mongoose");

// 🔹 Yangi seans qo'shish
const createSession = async (req, res) => {
  try {
    const { movieId, startTime, endTime, hall, price, seats } = req.body;

    // Seatlarni generatsiya qilish
    const availableSeats = seats.map(seatNumber => ({
      number: seatNumber,
      isBooked: false
    }));

    const session = await Session.create({
      movie: movieId,
      startTime,
      endTime,
      hall,
      price,
      availableSeats
    });

    res.status(201).json({
      success: true,
      message: "Seans muvaffaqiyatli yaratildi",
      session
    });
  } catch (error) {
    console.error("Seans yaratishda xatolik:", error);
    res.status(500).json({ 
      success: false,
      message: "Server xatosi",
      error: error.message 
    });
  }
};

// 🔹 Barcha seanslarni olish
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('movie', 'title duration posterUrl')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Seanslarni olishda xatolik:", error);
    res.status(500).json({ 
      success: false,
      message: "Server xatosi",
      error: error.message 
    });
  }
};

// 🔹 Seansni ID bo'yicha olish
const getSessionById = async (req, res) => {
  try {
    console.log("So'ralgan ID:", req.params.id);

    // ID validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Noto'g'ri ID formati"
      });
    }

    // Movie ma'lumotlarini olish
    const movie = await Movie.findById(req.params.id)
      .select('title duration posterUrl genre description releaseDate');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film topilmadi"
      });
    }

    // Shu movie uchun barcha sessiyalarni olish
    const sessions = await Session.find({ movie: req.params.id })
      .sort({ startTime: 1 });

    console.log("Film:", movie.title);
    console.log("Sessiyalar soni:", sessions.length);

    // Response'ni tayyorlash
    const response = {
      success: true,
      data: {
        movie: {
          _id: movie._id,
          title: movie.title,
          duration: movie.duration,
          posterUrl: movie.posterUrl,
          genre: movie.genre,
          description: movie.description,
          releaseDate: movie.releaseDate
        },
        sessions: sessions.map(session => ({
          _id: session._id,
          startTime: session.startTime,
          endTime: session.endTime,
          hall: session.hall,
          price: session.price,
          availableSeats: session.availableSeats.map(seat => ({
            number: seat.number,
            isBooked: seat.isBooked
          })),
          duration: Math.round((session.endTime - session.startTime) / (1000 * 60))
        }))
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Ma'lumotlarni olishda xatolik:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server xatosi",
      error: error.message 
    });
  }
};

// 🔹 Seansni yangilash
const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!session) return res.status(404).json({ error: "Seans topilmadi" });
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Seansni o'chirish
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: "Seans topilmadi" });
    res.json({ message: "Seans o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
};