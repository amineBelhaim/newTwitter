// src/components/Notifications/NotificationList.jsx
import React, { useEffect, useState } from 'react';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8070");

    socket.onopen = () => {
      console.log("Connecté au WebSocket pour les notifications");
      // Vous pouvez envoyer ici un message d'authentification si besoin :
      // socket.send(JSON.stringify({ type: "auth", userId: votreUserId, username: votreUsername }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification" && data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
        }
      } catch (error) {
        console.error("Erreur lors du traitement d'une notification :", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="notification-list p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Notifications</h2>
      {notifications.length === 0 && <p>Aucune notification</p>}
      {notifications.map((notif) => (
        <div key={notif._id} className="notification-item p-2 border-b">
          {notif.message}
        </div>
      ))}
    </div>
  );
}
