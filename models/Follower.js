const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // L'utilisateur qui suit
    required: true,
  },
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // L'utilisateur suivi
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Follower", followerSchema);
