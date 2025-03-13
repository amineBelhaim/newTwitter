import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postReducer from "./post/postSlice";
import authPersistMiddleware from "./middleware/authPersistMiddleware";
import messageReducer from "./message/messageSlice";
import commentReducer from "./comment/commentSlice";
import followerReducer from "./follower/followerSlice";
import notificationReducer from "./notification/notificationSlice";
import searchReducer from "./search/searchSlice";

export const store = configureStore({
  reducer: {
    post: postReducer,
    message: messageReducer,
    auth: authReducer,
    comment: commentReducer,
    follower: followerReducer,
    notification: notificationReducer,
    search: searchReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authPersistMiddleware),
});

export default store;
