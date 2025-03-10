const mongoose = require("mongoose");

const retweetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // L'utilisateur qui retweete
    required: true,
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Le post (ou Tweet) original
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Retweet", retweetSchema);
