const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  hall: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableSeats: [{
    number: String,
    isBooked: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field uchun
sessionSchema.virtual('duration').get(function() {
  return Math.round((this.endTime - this.startTime) / (1000 * 60)); // Minutlarda
});

// Index qo'shamiz
sessionSchema.index({ movie: 1 });

module.exports = mongoose.model("Session", sessionSchema);
