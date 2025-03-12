import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import myAxios from "../utils/interceptor"; // Assurez-vous que votre interceptor est configuré
import { setNotifications } from "../redux/notification/notificationSlice";
import { BellIcon, HeartIcon, ChatBubbleOvalLeftIcon, BookmarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { fetchNotifications, markNotificationAsRead } from "../redux/notification/notificationThunk";

export default function Notifications() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.notification);
  const { user } = useSelector((state) => state.auth);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  // ✅ Charger les notifications au montage
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [user, dispatch]);



  // 📌 Déterminer l'icône en fonction du type de notification
  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <HeartIcon className="h-6 w-6 text-red-500" />;
      case "comment":
        return <ChatBubbleOvalLeftIcon className="h-6 w-6 text-blue-500" />;
      case "bookmark":
        return <BookmarkIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">📨 Notifications</h2>

      {list.length > 0 ? (
        list.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center p-4 mb-3 rounded-lg shadow-md transition ${
              notif.isRead ? "bg-gray-100" : "bg-white border border-gray-300"
            }`}
          >
            {/* Icône de notification */}
            <div className="flex-shrink-0">{getIcon(notif.type)}</div>

            {/* Contenu de la notification */}
            <div className="flex-1 ml-4">
              <p className="text-gray-800 font-medium">{notif.message}</p>
              <small className="text-gray-500">{new Date(notif.createdAt).toLocaleString()}</small>
            </div>

            {/* Bouton "Marquer comme lu" */}
            {!notif.isRead && (
              <button
                onClick={() => handleMarkAsRead(notif._id)}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center"
              >
                <CheckIcon className="h-5 w-5 mr-1" /> Lu
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">📭 Aucune notification pour le moment.</p>
      )}
    </div>
  );
}
