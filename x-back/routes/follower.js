const express = require("express");
const router = express.Router();
const Follower = require("../models/Follower");

// Suivre un utilisateur
router.post("/", async (req, res) => {
  console.log("Corps de la requête :", req.body);

  try {
    const { followerId, followedId } = req.body;

    if (followerId === followedId) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas vous suivre vous-même." });
    }

    const alreadyFollowing = await Follower.findOne({
      follower: followerId,
      followed: followedId,
    });
    if (alreadyFollowing) {
      return res
        .status(400)
        .json({ message: "Vous suivez déjà cet utilisateur." });
    }

    const newFollow = new Follower({
      follower: followerId,
      followed: followedId,
    });
    await newFollow.save();

    res.status(201).json({ message: "Utilisateur suivi avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Se désabonner
router.post("/unfollow", async (req, res) => {
  try {
    const { followerId, followedId } = req.body;

    await Follower.findOneAndDelete({
      follower: followerId,
      followed: followedId,
    });

    res.status(200).json({ message: "Utilisateur désabonné avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir les abonnés d'un utilisateur
router.get("/:userId/followers", async (req, res) => {
  try {
    const followers = await Follower.find({
      followed: req.params.userId,
    }).populate("follower", "username name");
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les abonnements d'un utilisateur
router.get("/:userId/following", async (req, res) => {
  try {
    const following = await Follower.find({
      follower: req.params.userId,
    }).populate("followed", "username name");
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
