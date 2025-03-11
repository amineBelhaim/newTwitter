// src/redux/comment/commentThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from "../../utils/interceptor";

export const getComments = createAsyncThunk(
  "comment/getComments",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await myAxios.get(`/api/comments/${postId}`);
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addComment = createAsyncThunk(
  "comment/addComment",
  async ({ postId, userId, content }, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("/api/comments/add", {
        userId,
        postId,
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
