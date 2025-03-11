const authPersistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    
    // Actions qui nécessitent une mise à jour du localStorage
    const persistActions = ['auth/login/fulfilled', 'auth/register/fulfilled', 'auth/logout'];
    
    if (persistActions.includes(action.type)) {
        const state = store.getState().auth;
        
        if (state.isAuthenticated && state.token) {
            localStorage.setItem('token', state.token);
            localStorage.setItem('user', JSON.stringify(state.user));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    return result;
};

export default authPersistMiddleware;