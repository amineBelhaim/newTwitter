import { createSlice } from "@reduxjs/toolkit";
import { followUser, unfollowUser } from "./followerThunk";

const initialState = {
  isFollowing: false,
  status: "idle",
  error: null,
};

const followerSlice = createSlice({
  name: "follower",
  initialState,
  reducers: {
    // Optionnel : on peut forcer manuellement l'état via cette action
    setFollowing(state, action) {
      state.isFollowing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(followUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(followUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.isFollowing = true;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(unfollowUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.isFollowing = false;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setFollowing } = followerSlice.actions;
export default followerSlice.reducer;
