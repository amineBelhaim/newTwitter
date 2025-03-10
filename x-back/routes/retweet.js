const express = require("express");
const router = express.Router();
const Retweet = require("../models/Retweet");

// Retweeter un post
router.post("/", async (req, res) => {
  try {
    const { userId, originalPostId } = req.body;

    const alreadyRetweeted = await Retweet.findOne({
      user: userId,
      originalPost: originalPostId,
    });
    if (alreadyRetweeted) {
      return res
        .status(400)
        .json({ message: "Vous avez déjà retweeté ce post." });
    }

    const newRetweet = new Retweet({
      user: userId,
      originalPost: originalPostId,
    });
    await newRetweet.save();

    res.status(201).json({ message: "Post retweeté avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un retweet
router.post("/unretweet", async (req, res) => {
  try {
    const { userId, originalPostId } = req.body;

    await Retweet.findOneAndDelete({
      user: userId,
      originalPost: originalPostId,
    });

    res.status(200).json({ message: "Retweet supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Récupérer la liste des retweets d'un utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const retweets = await Retweet.find({ user: userId })
      .populate("originalPost") // Facultatif, pour récupérer les détails du post original
      .lean();

    res.status(200).json(retweets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
