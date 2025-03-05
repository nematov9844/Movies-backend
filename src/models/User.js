const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String }, // Google orqali kirgan foydalanuvchilar uchun
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpiry: Date,  // Token muddati
  passwordResetToken: String,
  passwordResetExpiry: Date,
  tickets: [
    {
      movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
      seatNumber: String,
      price: Number,
      paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
      purchasedAt: { type: Date, default: Date.now },
    },
  ],
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
