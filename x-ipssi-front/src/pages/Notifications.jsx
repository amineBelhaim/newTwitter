// src/pages/Notifications.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import myAxios from "../utils/interceptor"; // Assurez-vous que votre interceptor est configuré
import { setNotifications, markAsRead } from "../redux/notification/notificationSlice";

export default function Notifications() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.notification);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await myAxios.get(`/api/notifications/${user.id}`);
        dispatch(setNotifications(response.data));
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications", error);
      }
    }
    if (user?.id) fetchNotifications();
  }, [user, dispatch]);

  const handleMarkAsRead = (notificationId) => {
    // Vous pouvez appeler votre API pour marquer la notification comme lue et mettre à jour le store
    dispatch(markAsRead(notificationId));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {list.length > 0 ? (
        list.map((notif) => (
          <div
            key={notif.id}
            className={`p-2 border-b ${notif.isRead ? "bg-gray-100" : "bg-white"}`}
            onClick={() => handleMarkAsRead(notif.id)}
          >
            <p>{notif.message}</p>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </div>
        ))
      ) : (
        <p>Aucune notification pour le moment.</p>
      )}
    </div>
  );
}
