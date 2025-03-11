// src/redux/notification/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
    },
    markAsRead: (state, action) => {
      state.list = state.list.map((notification) =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
    },
    setNotifications: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { addNotification, markAsRead, setNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
