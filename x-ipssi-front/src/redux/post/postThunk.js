// src/redux/post/postThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from "../../utils/interceptor";

export const addPost = createAsyncThunk(
  "post/addPost",
  async (data, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("api/forum/", data, {
        headers: { "Content-Type": "application/json" }, // 📌 JSON pur
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await myAxios.delete(`api/forum/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getPosts = createAsyncThunk(
  "post/getPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await myAxios.get("/api/posts");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Une erreur est survenue" }
      );
    }
  }
);

export const getPostsBefore = createAsyncThunk(
  "post/getPostsBefore",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const lastTimestamp = state.post.lastTimestamp || Date.now();

      const response = await myAxios.get(
        `/api/forum/before/${lastTimestamp}  `
      );

      console.log("Réponse API:", response.data); // Debug pour vérifier la structure

      return response.data; // Assurez-vous que c'est un tableau de posts
    } catch (error) {
      return rejectWithValue(error.response.data || "Erreur inconnue");
    }
  }
);

export const likePost = createAsyncThunk(
  "post/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await myAxios.put(`api/forum/${postId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Une erreur est survenue" }
      );
    }
  }
);

export const addLike = createAsyncThunk(
  "post/addLike",
  async ({ postId, userId, username }, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("/api/likes", {
        userId,
        postId,
        username,
      });
      return { postId, likes: response.data.likes }; // Retourne la liste mise à jour des likes
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Erreur lors de l'ajout du like" }
      );
    }
  }
);

export const unlikePost = createAsyncThunk(
  "post/unlikePost",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const response = await myAxios.delete("/api/likes/unlike", {
        data: { userId, postId }, // Envoie `userId` et `postId` dans le body
      });
      return { postId, likes: response.data.likes }; // Retourne la liste mise à jour des likes
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Erreur lors du retrait du like" }
      );
    }
  }
);

export const getUserLikedPosts = createAsyncThunk(
  "post/getUserLikedPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await myAxios.get(`api/likes/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Une erreur est survenue" }
      );
    }
  }
);

export const addBookmark = createAsyncThunk(
  "post/addBookmark",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("/api/bookmarks", { userId, postId });
      return { postId, likes: response.data.likes }; // Retourne la liste mise à jour des likes
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Erreur lors de l'ajout du like" }
      );
    }
  }
);

export const unBookmarkPost = createAsyncThunk(
  "post/unBookmarkPost",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const response = await myAxios.delete("/api/bookmarks/remove", {
        data: { userId, postId }, // Envoie `userId` et `postId` dans le body
      });
      return { postId, likes: response.data.likes }; // Retourne la liste mise à jour des likes
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Erreur lors du retrait du like" }
      );
    }
  }
);

export const getUserBookmarkPosts = createAsyncThunk(
  "post/getUserBookmarkPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await myAxios.get(`api/bookmarks/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Une erreur est survenue" }
      );
    }
  }
);

export const getPostById = createAsyncThunk(
  "post/getPostById",
  async (postId, { rejectWithValue }) => {
    try {
      // Remarquez que l'endpoint est basé sur "api/forum" (selon vos autres appels)
      const response = await myAxios.get(`/api/forum/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
