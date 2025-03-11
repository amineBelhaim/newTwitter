// src/redux/post/postSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getPosts, addPost, deletePost, getPostsBefore, likePost, getUserLikedPosts } from './postThunk';

export const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        likedPosts: [],
        hasMore: true,
        loading: false,
        lastTimestamp: null,
        status: 'idle',
        error: null,
        deletingPostId: null
    },
    reducers: {
        resetPosts: (state) => {
            state.posts = [];
            state.hasMore = true;
            state.loading = false;
            state.lastTimestamp = null;
            state.status = 'idle';
            state.error = null;
        },
        clearStatus: (state) => {
            state.status = 'idle';
            state.error = null;
            state.deletingPostId = null;
        }
    },
    extraReducers: (builder) => {
        // Add Post
        builder.addCase(addPost.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(addPost.fulfilled, (state, action) => {
            state.status = 'success';
            state.posts.unshift(action.payload);
        });
        builder.addCase(addPost.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message || null;
        });

        // Get User Liked Posts
        builder.addCase(getUserLikedPosts.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getUserLikedPosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        builder.addCase(getUserLikedPosts.fulfilled, (state, action) => {
            console.log("✅ Données des posts likés reçues:", action.payload);
        
            state.loading = false;
        
            // Vérifie si le payload est un tableau et qu'il contient des posts valides
            if (!Array.isArray(action.payload)) {
                console.error("❌ action.payload n'est pas un tableau valide.");
                state.likedPosts = [];
                return;
            }
        
            // Corrige la structure des posts likés
            state.likedPosts = action.payload.map(like => {
                const post = like.post || {}; // Récupère l'objet post, ou {} s'il est manquant
        
                console.log("🔍 Vérification du post:", post);
        
                return {
                    _id: post._id || "", // Empêche une erreur si _id est manquant
                    author: post.author || "Utilisateur inconnu",
                    content: post.content || "", // Évite l'erreur split() si content est absent
                    likes: post.likes || [], // Assure que likes est un tableau
                    name: post.name || "Sans nom",
                    createdAt: post.createdAt || new Date().toISOString() // Évite une erreur de date
                };
            });
        
            console.log("✅ likedPosts mis à jour:", state.likedPosts);
        });
        
        
        


        // Get Posts
        builder.addCase(getPosts.pending, (state) => {
            state.status = 'loading';
            state.loading = true;
        });
        builder.addCase(getPosts.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.posts = action.payload;
            state.loading = false;
            state.hasMore = action.payload.length === 10;
        });
        builder.addCase(getPosts.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
            state.loading = false;
        });

        // Delete Post
        builder.addCase(deletePost.pending, (state, action) => {
            state.status = 'loading';
            state.deletingPostId = action.meta.arg; // Stocke l'ID du post en cours de suppression
        });
        builder.addCase(deletePost.fulfilled, (state, action) => {
            state.status = 'success';
            state.posts = state.posts.filter(post => post._id !== action.payload);
            state.deletingPostId = null;
        });
        builder.addCase(deletePost.rejected, (state) => {
            state.status = 'failed';
            state.deletingPostId = null;
        });

        // Get Posts Before
        builder.addCase(getPostsBefore.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getPostsBefore.fulfilled, (state, action) => {
            const newPosts = action.payload.filter(newPost => 
                !state.posts.some(existingPost => existingPost._id === newPost._id)
            );
        
            state.posts = [...state.posts, ...newPosts];
            state.loading = false;
            state.hasMore = action.payload.length === 10; 
        
            if (newPosts.length > 0) {
                state.lastTimestamp = newPosts[newPosts.length - 1].createdAt;
            }

            console.log("Mise à jour de hasMore:", state.hasMore, "Nouveaux posts:", newPosts.length, "Total reçu:", action.payload.length);
        });
        
        builder.addCase(getPostsBefore.rejected, (state, action) => {
            state.error = action.payload;
            state.loading = false;
        });

        // Like Post
        // builder.addCase(likePost.fulfilled, (state, action) => {
        //     const { postId, likes } = action.payload;
        //     const post = state.posts.find(p => p._id === postId);
        //     if (post) {
        //         post.likes = likes;
        //     }
        // });
    }
});

export const { clearStatus } = postSlice.actions;
export default postSlice.reducer;
export {getPosts, addPost,  deletePost, getPostsBefore, likePost };