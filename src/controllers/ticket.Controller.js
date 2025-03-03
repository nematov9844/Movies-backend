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
};

module.exports = { buyTicket, stripeWebhook };
