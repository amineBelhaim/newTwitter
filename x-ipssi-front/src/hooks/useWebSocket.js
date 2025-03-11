// src/hooks/useWebSocket.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/notification/notificationSlice";

export default function useWebSocket(userId, username) {
  const dispatch = useDispatch();
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8070");

    ws.current.onopen = () => {
      // Envoyer les infos d'authentification
      ws.current.send(JSON.stringify({ type: "auth", userId, username }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        // Met à jour le store avec la notification reçue
        dispatch(addNotification(message.data));
      }
      // Gérer d'autres types de messages si besoin
    };

    ws.current.onerror = (error) => {
      console.error("Erreur WS:", error);
    };

    return () => {
      ws.current.close();
    };
  }, [userId, username, dispatch]);

  return ws.current;
}
