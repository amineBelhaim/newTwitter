const express = require("express");
const router = express.Router();
const Bookmark = require("../models/Bookmark");

// ✅ Ajouter un post aux favoris (bookmark)
router.post("/", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    // Vérifier si le post est déjà dans les favoris
    const alreadyBookmarked = await Bookmark.findOne({
      user: userId,
      post: postId,
    });
    if (alreadyBookmarked) {
      return res
        .status(400)
        .json({ message: "Ce post est déjà dans vos favoris." });
    }

    // Ajouter aux favoris
    const newBookmark = new Bookmark({ user: userId, post: postId });
    await newBookmark.save();

    res.status(201).json({ message: "Post ajouté aux favoris avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Supprimer un post des favoris
router.delete("/remove", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    await Bookmark.findOneAndDelete({ user: userId, post: postId });

    res.status(200).json({ message: "Post retiré des favoris avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtenir tous les posts favoris d'un utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const bookmarks = await Bookmark.find({ user: userId })
      .populate("post") // Facultatif : récupérer les détails du post
      .lean();

    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
