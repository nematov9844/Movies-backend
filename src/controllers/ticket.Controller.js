const User = require("../models/User");
const Movie = require("../models/Movie");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const buyTicket = async (req, res) => {
    const { userId, movieId, seatNumber } = req.body; // `price`ni foydalanuvchidan olmaymiz
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  
      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ message: "Kino topilmadi" });
  
      const price = movie.ticketPrice; // Narxni kinodan olish
  
      // Stripe to‘lov sessiyasi yaratish
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: movie.title },
              unit_amount: price * 100, // Stripe sent bilan ishlaydi
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        metadata: {
          userId: userId,
          movieId: movieId,
          seatNumber: seatNumber,
          price: price,
        },
      });
  
      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ message: "To‘lov jarayonida xatolik yuz berdi", error });
    }
  };
  

// === Stripe Webhook - To‘lov tasdiqlanganda chiptani saqlash ===
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const { userId, movieId, seatNumber, price } = event.data.object.metadata;

      console.log("✅ Webhook metadata:", userId, movieId, seatNumber, price);

      // Userni bazadan topamiz
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

      // **1. Ticket modelida yangi chipta yaratamiz**
      const ticket = new Ticket({
        user: userId,
        movie: movieId,
        seatNumber,
        price,
        status: "paid",
      });
      await ticket.save();
      console.log("🎟️ Yangi Ticket yaratildi:", ticket);

      // **2. User modeliga ham chipta qo‘shamiz**
      user.tickets.push({
        movie: movieId,
        seatNumber,
        price,
        paymentStatus: "paid",
      });
      await user.save();
      console.log("✅ Userga chipta qo‘shildi:", user.tickets);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook xatosi:", error);
    res.status(400).json({ message: "Webhook xatosi", error });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const { movieId, seatNumber, price } = req.body;
    const userId = req.user._id;

    console.log("Checkout ma'lumotlari:", { movieId, seatNumber, price, userId });

    // Metadata obyektini yaratamiz
    const metadata = {
      userId: userId.toString(),
      movieId: movieId.toString(),
      seatNumber: seatNumber.toString(),
      price: price.toString()
    };

    console.log("Metadata:", metadata);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // Payment Intent ma'lumotlarini qo'shamiz
      payment_intent_data: {
        metadata: metadata // Metadata payment intent'ga qo'shiladi
      },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Chipta: ${seatNumber}`,
            metadata: metadata // Product ma'lumotlariga ham qo'shamiz
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      }],
      metadata: metadata, // Session ma'lumotlariga ham qo'shamiz
      success_url: `${process.env.FRONTEND_URL}/tickets/success`,
      cancel_url: `${process.env.FRONTEND_URL}/tickets/cancel`,
    });

    console.log("Yaratilgan session:", {
      id: session.id,
      metadata: session.metadata,
      payment_intent: session.payment_intent
    });

    res.json({ 
      sessionId: session.id,
      metadata: metadata // Response'da ham qaytaramiz
    });
  } catch (error) {
    console.error("Checkout session xatosi:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { buyTicket, stripeWebhook, createCheckoutSession };
