import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postReducer from "./post/postSlice";
import authPersistMiddleware from "./middleware/authPersistMiddleware";
import messageReducer from "./message/messageSlice";
import commentReducer from "./comment/commentSlice";
import followerReducer from "./follower/followerSlice";

export const store = configureStore({
  reducer: {
    post: postReducer,
    message: messageReducer,
    auth: authReducer,
    comment: commentReducer,
    follower: followerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authPersistMiddleware),
});

export default store;
