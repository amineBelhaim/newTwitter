// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const WebSocket = require("ws");
const cors = require("cors");
const {
  sendNotification,
  setConnectedUsers,
} = require("./notificationService");

// Import des routes
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/message");
const forumRoutes = require("./routes/forum");
const followerRoutes = require("./routes/follower");
const likeRoutes = require("./routes/like");
const commentRoutes = require("./routes/comment");
const retweetRoutes = require("./routes/retweet");
const notificationRoutes = require("./routes/notification");
const bookmarksRoutes = require("./routes/bookmark");
const userRoutes = require("./routes/user");

// Import des modèles
const Message = require("./models/Message");
const User = require("./models/User");
const Follower = require("./models/Follower");
const Like = require("./models/Like");
const Comment = require("./models/Comment");
const Retweet = require("./models/Retweet");
const Notification = require("./models/Notification");

dotenv.config();

const app = express();
// Création du serveur WebSocket
const wss = new WebSocket.Server({ port: 8070 });
const connectedUsers = new Map();

wss.on("connection", function connection(ws) {
  let userId = null;
  let userInfo = null;

  ws.on("message", async function incoming(data) {
    try {
      const messageData = JSON.parse(data);

      switch (messageData.type) {
        case "auth":
          userId = messageData.userId;
          userInfo = {
            ws: ws,
            username: messageData.username,
            status: "online",
          };
          connectedUsers.set(userId, userInfo);
          setConnectedUsers(connectedUsers); // Mise à jour dans le service
          broadcastUserList();
          // Envoyer l’historique, etc.
          break;

        // ... (vos autres cas de messages)
      }
    } catch (error) {
      console.error("Erreur WebSocket:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          content: "Erreur de traitement du message",
        })
      );
    }
  });

  ws.on("close", () => {
    if (userId) {
      connectedUsers.delete(userId);
      setConnectedUsers(connectedUsers);
      broadcastUserList();
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    if (userId) {
      connectedUsers.delete(userId);
      setConnectedUsers(connectedUsers);
      broadcastUserList();
    }
  });
});
async function sendMessageHistory(ws, userId) {
  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ timestamp: 1 })
      .limit(50)
      .populate("sender", "username name")
      .lean();

    const formattedMessages = messages.map((msg) => ({
      messageId: msg._id,
      content: msg.content,
      senderId: msg.sender._id.toString(),
      senderName: msg.sender.username,
      timestamp: msg.timestamp.toISOString(),
    }));

    ws.send(
      JSON.stringify({
        type: "message_history",
        messages: formattedMessages,
      })
    );
  } catch (error) {
    console.error("Erreur historique:", error);
  }
}

function broadcastUserList() {
  const userList = Array.from(connectedUsers.entries()).map(([id, user]) => ({
    userId: id,
    username: user.username,
    status: user.status,
  }));

  const message = JSON.stringify({
    type: "user_list",
    users: userList,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Configuration des middlewares
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
// Connexion à MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.log(err));

// Utilisation des routes
app.use("/api/forum", forumRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/followers", followerRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/retweets", retweetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = 8000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
