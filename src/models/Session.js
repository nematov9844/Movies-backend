const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },
  hall: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Virtual field uchun
sessionSchema.virtual('startDateTime').get(function() {
  return new Date(`${this.date}T${this.time}`);
});

// Index qo'shamiz
sessionSchema.index({ movie: 1 });

module.exports = mongoose.model("Session", sessionSchema);
