const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// === UNIVERSAL REGISTER (EMAIL YOKI GOOGLE) ===
const registerUser = async (req, res) => {
    const { name, email, password, idToken, provider } = req.body;
  
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ message: "Bu email allaqachon ishlatilgan" });
      }
  
      let hashedPassword;
      let googleId = null;
      let avatar = null;
  
      if (provider === "google") {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        googleId = decodedToken.uid;
        name = decodedToken.name;
        email = decodedToken.email;
        avatar = decodedToken.picture;
      } else {
        hashedPassword = await hashPassword(password);
      }
  
      const verifyToken = crypto.randomBytes(32).toString("hex");
      console.log("Yangi verifyToken:", verifyToken);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        googleId,
        avatar,
        verifyToken,
        isVerified: provider === "google" ? true : false,
      });
      console.log("Bazaga saqlangan token:", user.verifyToken);

      if (provider !== "google") {
        const verifyLink = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify-email/${verifyToken}`;
        const emailContent = `
          <html>
            <head>
              <title>Email Tasdiqlash</title>
            </head>
            <body style="text-align: center; padding: 50px;">
              <h2>Emailingizni tasdiqlang</h2>
              <p>Hisobingizni faollashtirish uchun quyidagi tugmani bosing:</p>
              <a href="${verifyLink}" 
                style="background-color: blue; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Emailni Tasdiqlash
              </a>
            </body>
          </html>
        `;
  
        await sendEmail(email, "Email Tasdiqlash", emailContent);
      }
  
      res.status(201).json({ message: "Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi! Emailingizni tekshiring." });
    } catch (error) {
      res.status(500).json({ message: "Server xatosi", error });
    }
  };
  

// === UNIVERSAL LOGIN (EMAIL YOKI GOOGLE) ===
const loginUser = async (req, res) => {
  const { email, password, idToken, provider } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    if (provider === "google") {
      // Google orqali kirish
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.email !== user.email) {
        return res.status(401).json({ message: "Google foydalanuvchisi mos kelmadi" });
      }
    } else {
      // Oddiy login
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Noto‘g‘ri parol" });
      }
    }

    // JWT token yaratish
    const token = generateToken(user._id);

    res.json({ message: "Muvaffaqiyatli tizimga kirdingiz!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verifyToken: token });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Tasdiqlash tokeni noto‘g‘ri yoki muddati tugagan!" });
    }

    // Email tasdiqlandi
    user.isVerified = true;
    user.verifyToken = null;
    await user.save();
// c9007b706f5beb3a90eef99fdcdc1741767e584a46b4274153629bfe2660de75
    res.json({ message: "Email muvaffaqiyatli tasdiqlandi! Endi tizimga kirishingiz mumkin." });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};
module.exports = { registerUser, loginUser, verifyEmail };
