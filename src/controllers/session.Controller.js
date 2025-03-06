const Movie = require("../models/Movie");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const connectDB = require("../config/db");

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
    // Avval barcha movie'larni olamiz
    const movies = await Movie.find().lean();
    
    // Barcha sessiyalarni olamiz
    const allSessions = await Session.find().lean();
    
    // Movie'larni sessiyalar bilan birlashtirish
    const moviesWithSessions = movies.map(movie => {
      // Shu movie'ga tegishli sessiyalarni filterlash
      const movieSessions = allSessions.filter(
        session => session.movie.toString() === movie._id.toString()
      );

      return {
        _id: movie._id,
        title: movie.title,
        duration: movie.duration,
        image: movie.image,
        genre: movie.genre,
        description: movie.description,
        releaseDate: movie.releaseDate,
        sessions: movieSessions.map(session => ({
          _id: session._id,
          hall: session.hall,
          date: session.date,
          time: session.time,
          price: session.price,
          availableSeats: session.availableSeats,
          totalSeats: session.totalSeats
        }))
      };
    });

    // Faqat sessiyalari bor movie'larni qaytarish
    const moviesWithActiveSessions = moviesWithSessions.filter(
      movie => movie.sessions.length > 0
    );

    console.log("Movies with sessions:", 
      moviesWithActiveSessions.map(m => ({
        title: m.title, 
        sessionCount: m.sessions.length
      }))
    );

    res.json({
      success: true,
      data: moviesWithActiveSessions
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
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film topilmadi"
      });
    }

    // Sessions qidirish (movie id bo'yicha)
    const sessions = await (await Session.find()).filter(item=>item.movie==req.params.id);

    // Response'ni tayyorlash
    return res.status(200).json({
      success: true,
      data: {
        movie: movie,
        sessions: sessions
      }
    });
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