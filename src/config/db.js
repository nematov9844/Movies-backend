const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ulanishi muvaffaqiyatli! ✅");
  } catch (error) {
    console.error("MongoDB ulanishida xatolik ❌:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
