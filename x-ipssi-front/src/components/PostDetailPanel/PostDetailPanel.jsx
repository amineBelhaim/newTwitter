// src/components/PostDetailPanel/PostDetailPanel.jsx
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPostById,
  addLike,
  unlikePost,
  addBookmark,
  unBookmarkPost,
} from '../../redux/post/postThunk';

import CommentList from '../Comment/CommentList';
import CommentForm from '../Comment/CommentForm';

import {
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  ShareIcon,
  BookmarkSlashIcon,
} from '@heroicons/react/24/outline';

import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.API_URL || 'http://localhost:8000';

export default function PostDetailPanel({ postId, onClose }) {
  const dispatch = useDispatch();
  const { selectedPost: post, status, likedPosts, bookmarksPosts } = useSelector((state) => state.post);
  const { user } = useSelector((state) => state.auth);

  const [showFullImage, setShowFullImage] = useState(false);
  const isVideo = post?.media && post.media.match(/\.(mp4|mov|webm)$/);

  const isLiked = likedPosts?.some((likedPost) => likedPost._id === post?._id);
  const isBookmark = bookmarksPosts?.some((bookmark) => bookmark._id === post?._id);

  useEffect(() => {
    dispatch(getPostById(postId));
  }, [dispatch, postId]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (user && post) {
      if (isLiked) {
        dispatch(unlikePost({ postId: post._id, userId: user.id }));
      } else {
        dispatch(addLike({ postId: post._id, userId: user.id, username: user.username }));
      }
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (user && post) {
      if (isBookmark) {
        dispatch(unBookmarkPost({ postId: post._id, userId: user.id }));
      } else {
        dispatch(addBookmark({ postId: post._id, userId: user.id }));
      }
    }
  };

  // --- AJOUT : fonction de retweet
  const handleRetweet = (e) => {
    e.stopPropagation();
    if (user && post) {
      dispatch(retweetPost({ postId: post._id, userId: user.id }));
    }
  };

  if (status === 'loading') {
    return <div className="p-4 text-center text-black">Chargement...</div>;
  }
  if (!post) {
    return <div className="p-4 text-center text-black">Post non trouvé</div>;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md">
      <div
        className="border border-gray-200 rounded-2xl shadow-xl w-11/12 max-w-2xl max-h-full overflow-y-auto p-4"
        style={{ backgroundColor: 'white' }}
      >
        {/* En-tête du panel */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold text-black">Détails du post</h2>
          <button onClick={onClose} className="text-black hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu du post */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {post.name ? post.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-black">{post.name}</span>
                <span className="text-black">@{post.author}</span>
                <span className="text-black">·</span>
                <span className="text-black">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-black">{post.content}</p>
              {post.media && (
                <div className="mt-2 relative">
                  {isVideo ? (
                    <video
                      className="w-full max-h-48 object-cover rounded-lg cursor-pointer"
                      controls
                      onClick={() => setShowFullImage(true)}
                    >
                      <source src={`${API_URL}${post.media}`} type="video/mp4" />
                      Votre navigateur ne supporte pas la vidéo.
                    </video>
                  ) : (
                    <img
                      src={`${API_URL}${post.media}`}
                      alt="Post media"
                      className="w-full max-h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setShowFullImage(true)}
                    />
                  )}
                </div>
              )}

              {/* Barre d’icônes (commentaires, retweet, like, bookmark, share) */}
              <div className="flex justify-between mt-3 max-w-md">
                
                {/* Commentaires */}
                <button
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                  <span className="text-sm">Commentaires</span>
                </button>
                
                {/* Retweet */}
                <button
                  onClick={handleRetweet}
                  className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
                >
                  <ArrowPathRoundedSquareIcon className="h-5 w-5" />
                  <span className="text-sm">Retweet</span>
                </button>
                
                {/* Like */}
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1"
                >
                  {isLiked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  )}
                  <span className="text-sm">J'aime</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className="flex items-center space-x-1"
                >
                  {isBookmark ? (
                    <BookmarkIconSolid className="h-5 w-5 text-black-500" />
                  ) : (
                    <BookmarkSlashIcon className="h-5 w-5 text-gray-500 hover:text-black-500" />
                  )}
                </button>

                {/* Partager */}
                <ShareIcon className="h-5 w-5 text-gray-500 hover:text-blue-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Section des commentaires */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-black mb-2">Commentaires</h3>
          <CommentList postId={post._id} />
          <CommentForm postId={post._id} />
        </div>
      </div>

      {/* Modal pour l'image/vidéo en plein écran */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full"
            onClick={() => setShowFullImage(false)}
          >
            ✖
          </button>
          {!isVideo ? (
            <img
              src={`${API_URL}${post.media}`}
              alt="Full size post media"
              className="max-w-full max-h-full rounded-lg"
            />
          ) : (
            <video
              className="max-w-full max-h-full rounded-lg"
              controls
              autoPlay
            >
              <source src={`${API_URL}${post.media}`} type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          )}
        </div>
      )}
    </div>
  );
}
