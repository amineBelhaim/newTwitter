import { createSlice } from '@reduxjs/toolkit';
import { getConversation } from './messageThunk';

export const messageSlice = createSlice({
    name: 'message',
    initialState: {
        conversations: [],
        currentConversation: [],
        status: 'idle',
        error: null,
        messages: [],
        onlineUsers: [],
        isTyping: false,
        notifications: []
    },
    reducers: {
        clearConversation: (state) => {
            state.conversations = [];
            state.status = 'idle';
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        addMessage: (state, action) => {
            // Vérifier si le message existe déjà
            const messageExists = state.messages.some(
                msg => msg.id === action.payload.id || 
                      (msg.content === action.payload.content && 
                       msg.senderId === action.payload.senderId &&
                       Math.abs(new Date(msg.timestamp) - new Date(action.payload.timestamp)) < 1000)
            );
            
            if (!messageExists) {
                state.messages.push(action.payload);
            }
        },
        setMessages: (state, action) => {
            state.messages = action.payload.map(msg => ({
                ...msg,
                sender: msg.senderId
              }));
        },
        setTyping: (state, action) => {
            state.isTyping = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        clearNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        }
    },

    extraReducers: (builder) => {
        builder.addCase(getConversation.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(getConversation.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.currentConversation = action.payload;
        });
        builder.addCase(getConversation.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || null;
        });
    }
});

export const { 
    clearConversation, 
    setOnlineUsers, 
    addMessage, 
    setMessages, 
    setTyping,
    addNotification,
    clearNotification 
} = messageSlice.actions;
export default messageSlice.reducer;
export { getConversation };