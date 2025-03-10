const express = require("express");
const router = express.Router();
const Like = require("../models/Like");

// ✅ Liker un post
router.post("/", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    const alreadyLiked = await Like.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
      return res.status(400).json({ message: "Vous avez déjà liké ce post." });
    }

    const newLike = new Like({ user: userId, post: postId });
    await newLike.save();

    res.status(201).json({ message: "Post liké avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Supprimer un like
router.post("/unlike", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    await Like.findOneAndDelete({ user: userId, post: postId });

    res.status(200).json({ message: "Like retiré avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtenir les likes d'un post
router.get("/:postId", async (req, res) => {
  try {
    const likes = await Like.find({ post: req.params.postId })
      .populate("user", "username name")
      .lean();

    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtenir tous les posts likés par un utilisateur
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const likedPosts = await Like.find({ user: userId })
      .populate("post") // Facultatif : récupérer les détails des posts likés
      .lean();

    res.status(200).json(likedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
