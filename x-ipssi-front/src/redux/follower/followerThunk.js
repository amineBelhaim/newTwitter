import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from "../../utils/interceptor";

export const followUser = createAsyncThunk(
  "follower/followUser",
  async ({ followerId, followedId }, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("/api/followers", {
        followerId,
        followedId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "follower/unfollowUser",
  async ({ followerId, followedId }, { rejectWithValue }) => {
    try {
      const response = await myAxios.post("/api/followers/unfollow", {
        followerId,
        followedId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
