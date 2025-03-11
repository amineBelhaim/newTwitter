// src/components/Comment/CommentForm.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment } from "../../redux/comment/commentThunk";

export default function CommentForm({ postId }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const commentStatus = useSelector((state) => state.comment.status);
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    dispatch(addComment({ postId, userId: user.id, content }));
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        className="w-full p-2 border rounded focus:outline-none"
        rows="2"
      />
      <button
        type="submit"
        disabled={!content.trim() || commentStatus === "loading"}
        className={`mt-1 px-4 py-2 rounded-full font-bold transition-colors 
          ${!content.trim() || commentStatus === "loading"
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
      >
        {commentStatus === "loading" ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
