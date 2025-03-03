require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Movies API",
        version: "1.0.0",
        description: "Movie API uchun Swagger hujjati",
      },
    },
    apis: ["./routes/*.js"],
  });
  
  // Swagger UI endpoint
  
// === ROUTES ===
const authRoutes = require("./routes/auth.Routes");
const movieRoutes = require("./routes/movie.Routes");
const ticketRoutes = require("./routes/ticket.Routes");
const paymentRoutes = require("./routes/paymet.Routes");
// const swaggerSpec = require("./config/swager");
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// === MIDDLEWARE'lar ===
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// === MongoDB ulash ===
connectDB();

// === API marshrutlari ===
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/", (req, res) => {
  res.send("🎬 Movie App API ishlayapti! 🚀");
});

// === STRIPE WEBHOOK ===
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const { userId, movieId, seatNumber, price } = event.data.object.metadata;

      const User = require("./models/User");
      const user = await User.findById(userId);
      if (user) {
        user.tickets.push({ movie: movieId, seatNumber, price, paymentStatus: "paid" });
        await user.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: "Webhook xatosi", error });
  }
});

// === SERVERNI ISHGA TUSHIRISH ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda ishlayapti! 🔥`));
