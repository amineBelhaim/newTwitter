const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
	name: { type: String, required: true },
	content: { type: String, required: true },
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // L'utilisateur qui like
		required: true,
	},
	author: { type: String, required: true },
	media: { type: String },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
