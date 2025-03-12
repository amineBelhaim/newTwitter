// src/components/PostCard/PostCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon, // outline pour le cœur non liké
  ShareIcon,
  BookmarkSlashIcon, // outline pour le bookmark non actif
  EllipsisHorizontalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, addLike, unBookmarkPost, addBookmark, unlikePost } from '../../redux/post/postSlice';
import CommentList from '../Comment/CommentList';
import CommentForm from '../Comment/CommentForm';
import PostDetailPanel from '../PostDetailPanel/PostDetailPanel';
const API_URL = import.meta.env.API_URL || 'http://localhost:8000';

// Import des icônes pleines depuis solid pour le cœur liké et le signet activé
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status, deletingPostId } = useSelector((state) => state.post);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const { likedPosts } = useSelector(state => state.post);
  const { bookmarksPosts } = useSelector(state => state.post);

  // Vérifie si ce post est dans la liste des posts likés ou bookmarkés par l'utilisateur
  const isLiked = likedPosts.some(likedPost => likedPost._id === post._id);
  const isBookmark = bookmarksPosts.some(bookmark => bookmark._id === post._id);
  const [showFullImage, setShowFullImage] = useState(false);
  const isVideo = post.media && post.media.match(/\.(mp4|mov|webm)$/);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');
  const isAuthor = user?.username === post.author;

  const handleDeletePost = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      dispatch(deletePost(post._id));
    }
    setShowOptions(false);
  };

  const handleLike = () => {
    if (user) {
      if (isLiked) {
        dispatch(unlikePost({ postId: post._id, userId: user.id }));
      } else {
        dispatch(addLike({ postId: post._id, userId: user.id, username: user.username }));
      }
    }
  };

  const handleBookmark = () => {
    if (user) {
      if (isBookmark) {
        dispatch(unBookmarkPost({ postId: post._id, userId: user.id }));
      } else {
        dispatch(addBookmark({ postId: post._id, userId: user.id }));
      }
    }
  };

  const toggleComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  if (status === 'success' && deletingPostId === post._id) {
    return null;
  }

  return (
    <div className="relative">
      {/* Tout le conteneur ouvre le détail du post */}
      <div onClick={() => setShowDetailPanel(true)} className="cursor-pointer">
        <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
          <div className="flex space-x-3">
            {/* L'avatar redirige vers le profil */}
            <div onClick={(e) => e.stopPropagation()}>
              <Link to={`/profile/${post.authorId || post.author}`}>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {getInitial(post?.name)}
                </div>
              </Link>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold">
                    <Link to={`/profile/${post.authorId || post.author}`}>{post.name}</Link>
                  </span>
                  <span className="text-gray-500">@{post.author}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                {isAuthor && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(!showOptions);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-full"
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    {showOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                        <button
                          onClick={handleDeletePost}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                        >
                          <TrashIcon className="h-5 w-5 mr-2" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1">{post.content}</p>
              {/* 📌 Afficher une image OU une vidéo selon le type de média */}
              {post.media && (
                      <div className="mt-2 relative">
                        {isVideo ? (
                          <video 
                            className="w-full max-h-48 object-cover rounded-lg cursor-pointer"
                            controls
                            onClick={() => setShowFullMedia(true)}
                          >
                            <source src={`${API_URL}${post.media}`} type="video/mp4" />
                            Votre navigateur ne supporte pas la vidéo.
                          </video>
                        ) : (
                          <img 
                            src={`${post.media}`} 
                            alt="Post media" 
                            className="w-full max-h-48 object-cover rounded-lg cursor-pointer"
                            onClick={() => setShowFullMedia(true)}
                          />
                        )}
                      </div>
                    )}

              <div className="flex justify-between mt-3 max-w-md">
                <button onClick={toggleComments} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                </button>
                <ArrowPathRoundedSquareIcon className="h-5 w-5 text-gray-500 hover:text-green-500 cursor-pointer" />
                <button
  onClick={(e) => {
    e.stopPropagation();
    handleLike();
  }}
  className="flex items-center space-x-1"
>
  {isLiked ? (
    <HeartIconSolid className="h-5 w-5 text-red-500" />
  ) : (
    <HeartIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
  )}
  {/* Affichage du nombre total de likes */}
  <span>{post.likes?.length || 0}</span>
</button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark();
                  }}
                  className="flex items-center space-x-1"
                >
                  {isBookmark ? (
                    <BookmarkIconSolid className="h-5 w-5 text-black-500" />
                  ) : (
                    <BookmarkSlashIcon className="h-5 w-5 text-gray-500 hover:text-black-500" />
                  )}
                </button>
                <ShareIcon className="h-5 w-5 text-gray-500 hover:text-blue-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <CommentList postId={post._id} />
          <CommentForm postId={post._id} />
        </div>
      )}
      {showDetailPanel && (
        <PostDetailPanel postId={post._id} onClose={() => setShowDetailPanel(false)} />
      )}
    </div>
  );
}
