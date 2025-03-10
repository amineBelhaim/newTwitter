const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Récupérer les notifications d'un utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marquer une notification comme lue
router.post("/mark-as-read", async (req, res) => {
  try {
    const { notificationId } = req.body;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    res.status(200).json({ message: "Notification marquée comme lue." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
