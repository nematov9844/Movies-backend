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
  
      // Token va uning muddatini yaratish
      const verifyToken = crypto.randomBytes(32).toString("hex");
      console.log("Yaratilgan token:", verifyToken);
      const verifyTokenExpiry = new Date();
      verifyTokenExpiry.setHours(verifyTokenExpiry.getHours() + 24); // 24 soatlik muddat
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        googleId,
        avatar,
        verifyToken,
        verifyTokenExpiry, // Token muddatini saqlash
        isVerified: provider === "google" ? true : false,
      });
      console.log("Yaratilgan user:", user);

      if (provider !== "google") {
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
        const emailContent = `
          <html>
            <head>
              <title>Email Tasdiqlash</title>
            </head>
            <body style="text-align: center; padding: 50px;">
              <h2>Emailingizni tasdiqlang</h2>
              <p>Hurmatli ${name},</p>
              <p>Hisobingizni faollashtirish uchun quyidagi tugmani bosing:</p>
              <a href="${verifyLink}" 
                style="background-color: #4CAF50; color: white; 
                padding: 10px 20px; text-decoration: none; 
                border-radius: 5px; display: inline-block; 
                margin: 20px 0;">
                Emailni Tasdiqlash
              </a>
              <p style="color: #666; margin-top: 20px;">
                Bu havola 24 soat davomida amal qiladi.
              </p>
              <p style="font-size: 12px; color: #999;">
                Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
              </p>
            </body>
          </html>
        `;
  
        await sendEmail(email, "Email Tasdiqlash", emailContent);
      }
  
      res.status(201).json({ 
        success: true,
        message: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! Emailingizni tekshiring.",
        verifyToken // Test uchun token qaytarilmoqda (production'da olib tashlash kerak)
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Server xatosi", 
        error: error.message 
      });
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
        return res.status(401).json({ message: "Noto'g'ri parol" });
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
  console.log("Kelgan token:", token);

  try {
    // Avval token bilan foydalanuvchini topish
    const user = await User.findOne({ verifyToken: token });
    console.log("Topilgan user:", user);

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Tasdiqlash tokeni topilmadi!" 
      });
    }

    // Token muddatini tekshirish
    if (user.verifyTokenExpiry && user.verifyTokenExpiry < Date.now()) {
      return res.status(400).json({ 
        success: false,
        message: "Token muddati tugagan!" 
      });
    }

    // Email tasdiqlandi
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    // Avtomatik tizimga kirish
    const jwtToken = generateToken(user._id);

    res.json({ 
      success: true,
      message: "Email muvaffaqiyatli tasdiqlandi!",
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    });
  } catch (error) {
    console.error("Verify xatosi:", error);
    res.status(500).json({ 
      success: false,
      message: "Server xatosi", 
      error: error.message 
    });
  }
};

// === FOYDALANUVCHI MA'LUMOTLARINI OLISH ===
const getMe = async (req, res) => {
  try {
    // req.user middleware'dan keladi
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        tickets: user.tickets
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};


const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, avatar } = req.body;

        // Foydalanuvchini bazadan topamiz
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }

        // Faqat ruxsat berilgan maydonlarni yangilash
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;

        // Email o‘zgartirilsa, tasdiqlashni qaytadan talab qilish
        if (email && email !== user.email) {
            user.email = email;
            user.isVerified = false; // Qayta tasdiqlash kerak
            user.verifyToken = Math.random().toString(36).substring(2); // Yangi token generatsiya qilish
            user.verifyTokenExpiry = Date.now() + 3600000; // 1 soat
        }

        // **Parolni bu funksiya orqali o‘zgartirishga ruxsat yo‘q!**
        if (req.body.password) {
            return res.status(400).json({ message: "Parolni bu yerdan o‘zgartirib bo‘lmaydi" });
        }

        await user.save(); // Yangilangan ma'lumotlarni saqlaymiz

        res.json({ message: "Profil yangilandi", user });
    } catch (error) {
        res.status(500).json({ message: "Serverda xatolik", error: error.message });
    }
};



module.exports = { registerUser, loginUser, verifyEmail, getMe, updateProfile};
