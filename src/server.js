require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

// Middleware'lar
app.use(express.json());
app.use(cors());

// MongoDB ulash
connectDB();

// API marshrutlari
app.use("/api/auth", require("./routes/auth.Routes"));
app.use("/api/movies", require("./routes/movie.Routes"));
app.get("/", (req, res) => {
  res.send("Movie App API ishlayapti! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda! 🔥`));
