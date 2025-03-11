// src/components/Comment/CommentList.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getComments } from "../../redux/comment/commentThunk";

export default function CommentList({ postId }) {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.comment.commentsByPost[postId] || []);
  const commentStatus = useSelector((state) => state.comment.status);

  useEffect(() => {
    // Si le status est idle ou si vous souhaitez forcer le rafraîchissement
    dispatch(getComments(postId));
  }, [dispatch, postId]);

  if (commentStatus === "loading")
    return <div className="text-gray-500 text-sm">Chargement des commentaires...</div>;
  if (comments.length === 0)
    return <div className="text-gray-500 text-sm">Aucun commentaire.</div>;

  return (
    <ul className="space-y-2">
      {comments.map((comment) => (
        <li key={comment._id} className="p-2 border rounded">
          <p className="font-bold text-sm">{comment.user.name} (@{comment.user.username})</p>
          <p className="text-sm">{comment.content}</p>
          <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
