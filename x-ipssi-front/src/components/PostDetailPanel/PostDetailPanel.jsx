// src/components/PostDetailPanel/PostDetailPanel.jsx
import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { getPostById } from '../../redux/post/postThunk';
import CommentList from '../Comment/CommentList';
import CommentForm from '../Comment/CommentForm';

export default function PostDetailPanel({ postId, onClose }) {
  const dispatch = useDispatch();
  const { selectedPost: post, status } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(getPostById(postId));
  }, [dispatch, postId]);

  if (status === "loading")
    return <div className="p-4 text-center text-black">Chargement...</div>;
  if (!post)
    return <div className="p-4 text-center text-black">Post non trouvé</div>;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md">
      <div className="border border-gray-200 rounded-2xl shadow-xl w-11/12 max-w-2xl max-h-full overflow-y-auto p-4" style={{backgroundColor: 'white'}}>
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
                <span className="text-black">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-black">{post.content}</p>
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
    </div>
  );
}
