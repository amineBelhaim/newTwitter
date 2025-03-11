import { createAsyncThunk } from '@reduxjs/toolkit';
import myAxios from '../../utils/interceptor';

export const getConversation = createAsyncThunk(
  'message/getConversation',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await myAxios.get(`/api/messages/conversation/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Une erreur est survenue" });
    }
  }
);