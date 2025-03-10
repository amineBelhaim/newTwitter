import { createAsyncThunk } from "@reduxjs/toolkit";
import myAxios from  '../../utils/interceptor';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
    try {
        const response = await myAxios.post('/api/auth/register', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data|| { message: "Une erreur est survenue" });
    }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
    try {
        const response = await myAxios.post('/api/auth/login', data);
        return response.data;
    } catch (error) {
        // Assurez-vous de renvoyer le message d'erreur du serveur
        return rejectWithValue(error.response?.data || { message: "Une erreur est survenue" });
    }
});

// Recupérer les users 
export const getUsers = createAsyncThunk('auth/getUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await myAxios.get('/api/auth/users');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});