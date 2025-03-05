const Session = require("../models/Session");

// 🔹 Yangi seans qo‘shish
const createSession = async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Barcha seanslarni olish
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate("movie");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Seansni ID bo‘yicha olish
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("movie");
    if (!session) return res.status(404).json({ error: "Seans topilmadi" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// 🔹 Seansni o‘chirish
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: "Seans topilmadi" });
    res.json({ message: "Seans o‘chirildi" });
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