const express = require("express");
const router = express.Router();
const Retweet = require("../models/Retweet");
 
// ✅ Retweeter un post
router.post("/", async (req, res) => {
  try {
    const { userId, originalPostId } = req.body;
 
    // Vérifier si l'utilisateur a déjà retweeté ce post
    const alreadyRetweeted = await Retweet.findOne({
      user: userId,
      originalPost: originalPostId,
    });
 
    if (alreadyRetweeted) {
      return res
        .status(400)
        .json({ message: "Vous avez déjà retweeté ce post." });
    }
 
    // Création du retweet
    const newRetweet = new Retweet({
      user: userId,
      originalPost: originalPostId,
    });
    await newRetweet.save();
 
    // Récupérer la liste mise à jour des retweets
    const updatedRetweets = await Retweet.find({
      originalPost: originalPostId,
    });
 
    res.status(201).json({
      message: "Post retweeté avec succès.",
      retweets: updatedRetweets, // 🔥 Mise à jour pour le front
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ✅ Supprimer un retweet
router.delete("/unretweet", async (req, res) => {
  try {
    const { userId, originalPostId } = req.body;
 
    await Retweet.findOneAndDelete({
      user: userId,
      originalPost: originalPostId,
    });
 
    // Récupérer la liste mise à jour des retweets
    const updatedRetweets = await Retweet.find({
      originalPost: originalPostId,
    });
 
    res.status(200).json({
      message: "Retweet supprimé avec succès.",
      retweets: updatedRetweets, // 🔥 Mise à jour pour le front
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ✅ Récupérer tous les retweets d'un utilisateur
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
 
    const retweets = await Retweet.find({ user: userId })
      .populate("originalPost") // 🔥 Facultatif : Récupérer les détails du post original
      .lean();
 
    res.status(200).json(retweets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// ✅ Récupérer tous les retweets d'un post
router.get("/:postId", async (req, res) => {
  try {
    const retweets = await Retweet.find({ originalPost: req.params.postId })
      .populate("user", "username name") // 🔥 Récupérer les infos de l'utilisateur qui a retweeté
      .lean();
 
    res.status(200).json(retweets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 