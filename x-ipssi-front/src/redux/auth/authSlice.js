import { createSlice } from '@reduxjs/toolkit';
import { register, login, getUsers} from './authThunk';

const loadInitialState = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        isAuthenticated: !!token,
        isNew: false,
        user: user,
        token: token,
        status: 'idle',
        error: null,
        users: []
    };
};

export const authSlice = createSlice({
    name: 'auth',
    initialState: loadInitialState(),

    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.isNew = false;
            state.user = null;
            state.token = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Register
        builder.addCase(register.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.status = 'success';
            state.isAuthenticated = true;
            state.isNew = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || null;
        });

        // Login
        builder.addCase(login.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.status = 'success';
            state.isAuthenticated = true;
            state.isNew = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload?.message || "Une erreur est survenue";
        });


        // Get users
        builder.addCase(getUsers.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.status = 'success';
            state.users = action.payload;
        });
        builder.addCase(getUsers.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || null;
        });

    }
});

export const { logout, clearError } = authSlice.actions;
export {register, login, getUsers};
export default authSlice.reducer;
