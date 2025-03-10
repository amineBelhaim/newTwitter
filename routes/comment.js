const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// Ajouter un commentaire
router.post("/add", async (req, res) => {
  try {
    const { userId, postId, content } = req.body;

    const newComment = new Comment({ user: userId, post: postId, content });
    await newComment.save();

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
