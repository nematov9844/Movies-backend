const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Metadata bilan ishlash uchun alohida funksiya
async function handlePaymentSuccess(metadata, res) {
  console.log("Metadata:", metadata);

  if (!metadata || !metadata.userId || !metadata.movieId || !metadata.seatNumber || !metadata.price) {
    console.error("Metadata to'liq emas:", metadata);
    return res.status(400).json({ error: "Metadata to'liq emas" });
  }

  const { userId, movieId, seatNumber, price } = metadata;

  try {
    const User = require("../models/User");
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

// Webhook handler
const stripeWebhookHandler = async (req, res) => {
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
      console.log("Checkout session:", session);
      const metadata = session.metadata;
      handlePaymentSuccess(metadata, res);
    }
    else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("PaymentIntent:", paymentIntent);
      const metadata = paymentIntent.metadata;
      handlePaymentSuccess(metadata, res);
    } else {
      res.json({ received: true });
    }

  } catch (error) {
    console.error("Webhook xatosi:", error);
    return res.status(400).json({ 
      message: "Webhook xatosi", 
      error: error.message 
    });
  }
};

module.exports = stripeWebhookHandler; 