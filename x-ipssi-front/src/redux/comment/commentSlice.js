// src/redux/comment/commentSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getComments, addComment } from "./commentThunk";

const initialState = {
  // Un objet associant chaque post à sa liste de commentaires
  commentsByPost: {},
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Récupérer les commentaires d'un post
      .addCase(getComments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { postId, comments } = action.payload;
        state.commentsByPost[postId] = comments;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Ajouter un commentaire
      .addCase(addComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newComment = action.payload;
        const postId = newComment.post;
        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId].push(newComment);
        } else {
          state.commentsByPost[postId] = [newComment];
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default commentSlice.reducer;
