import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from "../../utils/interceptor";

// 📌 Marquer une notification comme lue via l'API
export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
        console.log('notificationId', notificationId);
      await myAxios.post("/api/notifications/mark-as-read", { notificationId });
      return notificationId; // Retourne l'ID de la notification mise à jour
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Erreur serveur" });
    }
  }
);


// ✅ Récupérer les notifications d'un utilisateur depuis l'API
export const fetchNotifications = createAsyncThunk(
    "notification/fetchNotifications",
    async (userId, { rejectWithValue }) => {
      try {
        const response = await myAxios.get(`/api/notifications/${userId}`);
        return response.data; // Retourne les notifications
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Erreur serveur" });
      }
    }
  );
