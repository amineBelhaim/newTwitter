// src/redux/post/postThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from "../../utils/interceptor";

export const addPost = createAsyncThunk(
  "post/addPost",
  async (data, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("api/forum/", data);
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
