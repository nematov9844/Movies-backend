const User = require("../models/User");

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).send(`<div style="display: flex; justify-content: center; text-align: center; padding: 50px;background-color:#f5f5f5;text-decoration: none;height:100vh"><h2 style='text-align: center; padding: 50px;text-decoration: none;'>Token noto‘g‘ri yoki muddati tugagan!</h2></div>`);
    }

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    res.send(`
      <html>
        <head>
          <title>Email Tasdiqlandi</title>
        </head>
        <body style="text-align: center; padding: 50px;background-color: #f5f5f5;text-decoration: none;height:100vh">
          <h2>Emailingiz muvaffaqiyatli tasdiqlandi!</h2>
          <p>Endi <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">saytga qaytishingiz</a> mumkin.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("<h2>Server xatosi</h2>");
  }
};

module.exports = { verifyEmail };
