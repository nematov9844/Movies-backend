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
          url: "https://movies-backend-sph7.onrender.com", // Serveringiz URL'i
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

// Webhook route uchun raw body kerak, shuning uchun uni alohida handle qilamiz
app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Webhook boshlanishi");

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Event turi:", event.type);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("PaymentIntent:", paymentIntent);

      // Metadata'ni to'g'ridan-to'g'ri PaymentIntent'dan olish
      const metadata = paymentIntent.metadata;
      console.log("Metadata:", metadata);

      if (!metadata || !metadata.userId || !metadata.movieId || !metadata.seatNumber || !metadata.price) {
        console.error("Metadata to'liq emas:", metadata);
        return res.status(400).json({ error: "Metadata to'liq emas" });
      }

      const { userId, movieId, seatNumber, price } = metadata;

      try {
        const User = require("./models/User");
        const user = await User.findById(userId);
        
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

        // Tickets array mavjud emasligini tekshirish
        if (!Array.isArray(user.tickets)) {
          user.tickets = [];
        }

        user.tickets.push(newTicket);
        console.log("Yangi chipta qo'shilmoqda:", newTicket);

        const savedUser = await user.save();
        console.log("Foydalanuvchi saqlandi. Chiptalari soni:", savedUser.tickets.length);

        return res.json({ 
          received: true,
          message: "Chipta muvaffaqiyatli qo'shildi",
          ticketCount: savedUser.tickets.length
        });
      } catch (dbError) {
        console.error("Database xatosi:", dbError);
        return res.status(500).json({ error: "Database xatosi", details: dbError.message });
      }
    }

    // Boshqa eventlar uchun
    res.json({ received: true });

  } catch (error) {
    console.error("Webhook xatosi:", error);
    return res.status(400).json({ 
      message: "Webhook xatosi", 
      error: error.message 
    });
  }
});

// Boshqa routelar uchun JSON parser
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

// === SERVERNI ISHGA TUSHIRISH ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ${PORT}-portda ishlayapti! 🔥`));
