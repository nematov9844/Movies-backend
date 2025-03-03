const express = require("express");
const { registerUser, loginUser } = require("../controllers/auth.Controller");
const { verifyEmail } = require("../controllers/verifyEmail");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Emailni tasdiqlash marshruti
router.get("/verify-email/:token", verifyEmail);

module.exports = router;
