const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { sendNotification } = require("../notificationService");
const User = require("../models/User");

// Ajouter un commentaire
router.post("/add", async (req, res) => {
  try {
    const { userId, postId, content, username } = req.body;

    const newComment = new Comment({ user: userId, post: postId, content });
    await newComment.save();

    // Récupérer le post pour connaître son auteur
    const post = await Post.findById(postId);
    if (post && post.author.toString() !== userId) {
      const userAuthor = await User.findOne({ username: post.author });
      if (userAuthor) {
        const newNotification = new Notification({
          user: userAuthor._id,
          type: "comment",
          message: `L'utilisateur ${
            username || "quelqu'un"
          } a commenté votre post.`,
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

    res.status(201).json({ message: "Commentaire ajouté avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un commentaire
router.delete("/:commentId", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);

    res.status(200).json({ message: "Commentaire supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir les commentaires d'un post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate(
      "user",
      "username name"
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
