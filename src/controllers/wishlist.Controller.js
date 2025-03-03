const Wishlist = require("../models/Wishlist");

const addToWishlist = async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    
    // Foydalanuvchi uchun wishlistni qidiring
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      // Agar mavjud bo‘lmasa, yangi yarating
      wishlist = await Wishlist.create({ user: userId, movies: [] });
    }
    
    // Agar kino allaqachon wishlistda bo‘lsa
    if (wishlist.movies.includes(movieId)) {
      return res.status(400).json({ message: "Kino allaqachon wishlistda mavjud" });
    }
    
    wishlist.movies.push(movieId);
    await wishlist.save();
    res.status(200).json({ message: "Kino wishlistga qo‘shildi", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist topilmadi" });
    }
    
    wishlist.movies = wishlist.movies.filter(
      (m) => m.toString() !== movieId
    );
    await wishlist.save();
    res.status(200).json({ message: "Kino wishlistdan o‘chirildi", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ user: userId }).populate("movies");
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist topilmadi" });
    }
    res.status(200).json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error });
  }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
