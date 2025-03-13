import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchTerm: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload; // ✅ Met à jour la recherche avec un hashtag ou saisie utilisateur
    },
    clearSearchTerm: (state) => {
      state.searchTerm = ""; // ✅ Permet d'effacer la recherche
    },
  },
});

export const { setSearchTerm, clearSearchTerm } = searchSlice.actions;
export default searchSlice.reducer;
