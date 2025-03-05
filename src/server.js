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
      servers: [
        {
          url: "http://localhost:5000", // Serveringiz URL'i
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./src/routes/*.js"], // Path to'g'rilanishi kerak
});
  
// Swagger UI endpoint
  
// === ROUTES ===
const authRoutes = require("./routes/auth.Routes");
const movieRoutes = require("./routes/movie.Routes");
const ticketRoutes = require("./routes/ticket.Routes");
const paymentRoutes = require("./routes/paymet.Routes");
const sessionRoutes = require("./routes/session.Routes");
// const swaggerSpec = require("./config/swager");
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// === MIDDLEWARE'lar ===
// app.use(cors({ 
//   origin: [process.env.FRONTEND_URL, "http://localhost:5173","https://movies-frontend-8.vercel.app"],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
  origin: "*", // Hamma domenlarga ruxsat
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use("/api/wishlist", require("./routes/wishlist.Routes"));
app.use("/api/sessions", sessionRoutes);
app.get("/", (req, res) => {
  res.send("🎬 Movie App API ishlayapti! 🚀");
});

// === STRIPE WEBHOOK ===
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Webhook boshlanishi");

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Event turi:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("To'lov sessiyasi:", session);
      
      // Metadata'dan ma'lumotlarni olish
      const { userId, movieId, seatNumber, price } = session.metadata;
      console.log("Metadata:", { userId, movieId, seatNumber, price });

      // User modelini import qilish
      const User = require("./models/User");
      
      // Foydalanuvchini topish
      const user = await User.findById(userId);
      console.log("Topilgan foydalanuvchi:", user);

      if (!user) {
        console.error("Foydalanuvchi topilmadi:", userId);
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      // Chipta qo'shish
      const newTicket = {
        movie: movieId,
        seatNumber: seatNumber,
        price: Number(price),
        paymentStatus: "paid",
        purchasedAt: new Date()
      };

      user.tickets.push(newTicket);
      console.log("Yangi chipta qo'shildi:", newTicket);

      // O'zgarishlarni saqlash
      await user.save();
      console.log("Foydalanuvchi saqlandi");

      res.json({ 
        received: true,
        message: "Chipta muvaffaqiyatli qo'shildi"
      });
    } else {
      res.json({ received: true });
    }

  } catch (error) {
    console.error("Webhook xatosi:", error);
    res.status(400).json({ 
      message: "Webhook xatosi", 
      error: error.message 
    });
  }
});

// === SERVERNI ISHGA TUSHIRISH ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda ishlayapti! 🔥`));
