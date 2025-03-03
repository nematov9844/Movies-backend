const stripe = require("../config/stripe");
const Ticket = require("../models/Ticket");

const createCheckoutSession = async (req, res) => {
  try {
    const { movieId, seatNumber, price } = req.body;

    const ticket = await Ticket.create({
      user: req.user._id,
      movie: movieId,
      seatNumber,
      price,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Kino Chipta (o‘rindiq: ${seatNumber})` },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?ticketId=${ticket._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled?ticketId=${ticket._id}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

// To‘lov natijasini tekshirish
const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ticketId = session.metadata.ticketId;

    await Ticket.findByIdAndUpdate(ticketId, { status: "paid" });
  }

  res.json({ received: true });
};

module.exports = { createCheckoutSession, webhookHandler };
