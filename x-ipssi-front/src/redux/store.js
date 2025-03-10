import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postReducer from "./post/postSlice";
import authPersistMiddleware from "./middleware/authPersistMiddleware";
import messageReducer from "./message/messageSlice";

export const store = configureStore({
    reducer: {
        post: postReducer,
        message : messageReducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authPersistMiddleware)
});

export default store;