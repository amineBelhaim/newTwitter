const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const Like = require("../models/Like"); // <-- (1) IMPORTANT: importer le modèle Like
const path = require("path");
const multer = require("multer");

// 📌 Définir le dossier où les images seront stockées
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 📌 Nom unique
    }
});
// 📌 Vérification du type de fichier (accepter images et vidéos)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Seuls les fichiers images et vidéos sont autorisés"), false);
    }
};

const upload = multer({ storage });

router.post("/", async (req, res) => {
    try {
        const { name, content, author, user, media } = req.body;

        const newPost = new Post({
            name,
            content,
            author,
            user,
            media: media || null, // 📌 Stocker directement l’image en Base64
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get("/before/:timestamp", async (req, res) => {
	try {
	  // 1) Récupérer les posts
	  const posts = await Post.find({ createdAt: { $lt: req.params.timestamp } })
		.sort({ createdAt: -1 })
		.limit(10)
		.lean(); // <-- .lean() pour manipuler plus facilement l'objet JS
  
	  // 2) Pour chaque post, récupérer la liste de likes
	  const postsWithLikes = await Promise.all(
		posts.map(async (post) => {
		  const likesArray = await Like.find({ post: post._id }).lean();
		  return {
			...post,
			likes: likesArray,
		  };
		})
	  );
  
	  res.json(postsWithLikes);
	} catch (err) {
	  res.status(500).json({ message: err.message });
	}
  });


router.get("/", auth, async (req, res) => {
	try {
	  const limit = 10;
	  // 1) Récupérer les posts
	  const posts = await Post.find().sort({ createdAt: -1 }).limit(limit).lean();
  
	  // 2) Pour chaque post, on récupère la liste complète des likes
	  const postsWithLikes = await Promise.all(
		posts.map(async (post) => {
		  // Récupère tous les "Like" documents où `post: post._id`
		  const likesArray = await Like.find({ post: post._id }).lean();
  
		  // On fusionne l'objet "post" avec la propriété "likes"
		  return {
			...post,
			likes: likesArray,
		  };
		})
	  );
  
	  // 3) Retourne la liste de posts avec "likes"
	  res.json(postsWithLikes);
	} catch (err) {
	  res.status(500).json({ message: err.message });
	}
  });
  router.get("/:id", auth, async (req, res) => {
	try {
	  // 1) Récupère le post
	  const post = await Post.findById(req.params.id).lean();
	  if (!post) return res.status(404).json({ message: "Post non trouvé" });
  
	  // 2) Récupère la liste complète des "Like" pour ce post
	  const likesArray = await Like.find({ post: post._id }).lean();
  
	  // 3) Fusionner le post avec "likes" avant de renvoyer
	  res.json({
		...post,
		likes: likesArray,
	  });
	} catch (err) {
	  res.status(500).json({ message: err.message });
	}
  });

  router.put("/:id/like", auth, async (req, res) => {
	try {
	  // ⚠️ Cette logique de "like" / "unlike" stocke encore un tableau "likes" DANS Post
	  // Si tu utilises déjà le modèle Like séparé, tu peux soit l’enlever ici,
	  // soit le garder si c’est nécessaire dans ton code actuel.
  
	  const post = await Post.findById(req.params.id);
	  if (!post) return res.status(404).json({ message: "Post non trouvé" });
  
	  const index = post.likes.indexOf(req.user.username);
	  if (index === -1) {
		post.likes.push(req.user.username);
	  } else {
		post.likes.splice(index, 1);
	  }
  
	  await post.save();
  
	  // On renvoie la version "Post" après mise à jour,
	  // mais ça ne reflète pas forcément le "Like" model.
	  // Up to you de conserver ou supprimer ce put/like
	  res.json({ postId: post._id, likes: post.likes });
	} catch (err) {
	  res.status(500).json({ message: err.message });
	}
  });


router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findByIdAndDelete(req.params.id);
		if (!post) return res.status(404).json({ message: 'Post non trouvé' });
		res.json({ message: 'Post supprimé' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
