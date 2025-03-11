const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");

router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;
    // Vérifie si l'identifiant est un ObjectId valide
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).select("-password");
    } else {
      user = await User.findOne({ username: identifier }).select("-password");
    }
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
