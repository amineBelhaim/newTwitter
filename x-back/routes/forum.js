const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

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



router.get('/before/:timestamp', async (req, res) => {
	try {
		const posts = await Post.find({ createdAt: { $lt: req.params.timestamp } }).sort({ createdAt: -1 }).limit(10);
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


router.get('/', auth, async (req, res) => {
	try {
	const limit = 10;
	const posts = await Post.find().sort({ createdAt: -1 }).limit(limit);
	res.json(posts);

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ message: 'Post non trouvé' });
		res.json(post);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.put('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post non trouvé' });

        const index = post.likes.indexOf(req.user.username);
        if (index === -1) {
            post.likes.push(req.user.username);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
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
