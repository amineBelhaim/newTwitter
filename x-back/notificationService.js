// services/notificationService.js

// On utilise une variable pour stocker la map des utilisateurs connectés
let connectedUsers = new Map();

// Permet de mettre à jour la map depuis le serveur
function setConnectedUsers(map) {
  connectedUsers = map;
}

// Fonction pour envoyer une notification au destinataire s'il est connecté
function sendNotification(targetUserId, notificationData) {
  const targetUser = connectedUsers.get(targetUserId);
  if (targetUser && targetUser.ws.readyState === targetUser.ws.OPEN) {
    targetUser.ws.send(
      JSON.stringify({
        type: "notification",
        data: notificationData,
      })
    );
  }
}

module.exports = { sendNotification, setConnectedUsers };
