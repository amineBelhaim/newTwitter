const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const Post = require("../models/Post"); // Pour récupérer l'auteur du post
const Notification = require("../models/Notification");
const { sendNotification } = require("../notificationService");
const User = require("../models/User");

// ✅ Liker un post
router.post("/", async (req, res) => {
  try {
    const { userId, postId, username } = req.body;

    const alreadyLiked = await Like.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
      return res.status(400).json({ message: "Vous avez déjà liké ce post." });
    }

    const newLike = new Like({ user: userId, post: postId });
    await newLike.save();

    // Récupérer le post pour obtenir l'auteur
    const post = await Post.findById(postId);
    if (post && post.author.toString() !== userId) {
      // Récupérer le document utilisateur correspondant au username stocké dans post.author
      const userAuthor = await User.findOne({ username: post.author });
      if (userAuthor) {
        // Créer la notification avec l'ObjectId de l'utilisateur
        const newNotification = new Notification({
          user: userAuthor._id, // Utiliser l'ObjectId, pas le nom
          type: "like",
          message: `L'utilisateur ${
            username || "quelqu'un"
          } a liké votre post.`,
        });
        await newNotification.save();

        sendNotification(userAuthor._id.toString(), {
          id: newNotification._id,
          type: newNotification.type,
          message: newNotification.message,
          createdAt: newNotification.createdAt,
        });
      }
    }

        // On récupère la liste mise à jour des likes pour ce post
        const updatedLikes = await Like.find({ post: postId });
 
        // On renvoie la liste complète des likes
        res.status(201).json({
          message: "Post liké avec succès.",
          likes: updatedLikes, // <--- Le front en a besoin
        });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Supprimer un like
router.delete("/unlike", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    await Like.findOneAndDelete({ user: userId, post: postId });

    // Liste mise à jour
    const updatedLikes = await Like.find({ post: postId });
    res.status(200).json({
      message: "Like retiré avec succès.",
      likes: updatedLikes,
    });
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
