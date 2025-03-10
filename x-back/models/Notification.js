const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // L'utilisateur qui reçoit la notification
    required: true,
  },
  type: {
    type: String, // Exemple: 'like', 'follow', 'comment', 'retweet'
    required: true,
  },
  message: {
    type: String, // Contenu textuel de la notification
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
