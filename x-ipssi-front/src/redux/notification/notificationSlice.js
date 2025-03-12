// src/redux/notification/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { fetchNotifications, markNotificationAsRead } from "./notificationThunk";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
  },
  reducers: {
    addNotification: (state, action) => {
            // 📌 Affiche un toast dès qu'une nouvelle notification arrive
            toast.info(`🔔 ${action.payload.message}`, {
              position: "top-right",
              autoClose: 3000, // Durée d'affichage
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
      state.list.unshift(action.payload);
    },

    
    setNotifications: (state, action) => {
      state.list = action.payload;
    },
  },
  extraReducers: (builder) => {

    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const index = state.list.findIndex(notif => notif.id === action.payload);
      state.list = state.list.map((notif) =>
        notif._id === action.payload ? { ...notif, isRead: true } : notif
      );

      
    });
  },
});

export const { addNotification,  setNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
