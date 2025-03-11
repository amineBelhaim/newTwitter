// src/components/PostCard/PostCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, likePost } from '../../redux/post/postSlice';
import CommentList from '../Comment/CommentList';
import CommentForm from '../Comment/CommentForm';
import PostDetailPanel from '../PostDetailPanel/PostDetailPanel';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status, deletingPostId } = useSelector((state) => state.post);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const isLiked = post.likes?.includes(user?.username);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');
  const isAuthor = user?.username === post.author;
  const isDeleting = deletingPostId === post._id;

  const handleDeletePost = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      dispatch(deletePost(post._id));
    }
    setShowOptions(false);
  };

  const handleLike = () => {
    if (user) {
      dispatch(likePost(post._id));
    }
  };

  const toggleComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  // Si le post est supprimé, ne pas le rendre
  if (status === 'success' && deletingPostId === post._id) {
    return null;
  }

  return (
    <div className="relative">
      {/* On rend le post cliquable pour ouvrir le détail */}
      <div onClick={() => setShowDetailPanel(true)} className="cursor-pointer">
        <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
          <div className="flex space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {getInitial(post?.name)}
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
              <div className="flex justify-between mt-3 max-w-md">
                <button onClick={toggleComments} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                  <span className="text-sm">Commentaires</span>
                </button>
                <ArrowPathRoundedSquareIcon className="h-5 w-5 text-gray-500 hover:text-green-500 cursor-pointer" />
                <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex items-center space-x-1">
                  {isLiked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  )}
                  {post.likes?.length > 0 && (
                    <span className="text-sm text-gray-500">{post.likes.length}</span>
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
