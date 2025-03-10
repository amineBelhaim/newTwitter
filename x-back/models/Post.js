const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
	name: { type: String, required: true },
	content: { type: String, required: true },
	author: { type: String, required: true },
	likes: { type: Array, default: [] },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
