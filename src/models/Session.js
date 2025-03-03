const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true }, // Filmga bog‘lanadi
  hall: { type: String, required: true }, // Qaysi zalda bo‘lishi
  date: { type: Date, required: true }, // Seans sanasi
  time: { type: String, required: true }, // Seans vaqti (HH:mm formatida)
  price: { type: Number, required: true }, // Chiptaning narxi
  availableSeats: { type: Number, required: true }, // Qolgan joylar soni
  totalSeats: { type: Number, required: true }, // Jami joylar soni
});

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
