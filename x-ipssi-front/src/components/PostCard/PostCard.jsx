import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    ChatBubbleOvalLeftIcon, 
    ArrowPathRoundedSquareIcon, 
    HeartIcon, 
    ShareIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/outline';
import { deletePost, getPostsBefore, clearStatus, likePost } from '../../redux/post/postSlice';

export default function PostCard({ post }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { status, deletingPostId } = useSelector((state) => state.post);
    const [showOptions, setShowOptions] = useState(false);
    const isLiked = post.likes?.includes(user?.username);

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

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

    // Nouvelle fonction pour formatter le texte avec les hashtags
    const formatContent = (content) => {
        const words = content.split(/(\s+)/);
        return words.map((word, index) => {
            if (word.startsWith('#')) {
                return (
                    <span 
                        key={index} 
                        className="text-blue-500 hover:underline cursor-pointer"
                    >
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    // Gestion des notifications uniquement pour ce post spécifique
    useEffect(() => {
        if (isDeleting) {
           if (status === 'success') {
                setTimeout(() => {
                    dispatch(clearStatus());
                }, 3000);
            } 
        }
    }, [status, isDeleting, dispatch]);

    // Si le post est supprimé avec succès, ne pas le rendre
    if (status === 'success' && deletingPostId === post._id) {
        return null;
    }

    return (
        <div className="relative">
            <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="flex space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {getInitial(post?.name)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="font-bold">{post.name}</span>
                                <span className="text-gray-500">@{post.author}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500">
                                    {new Date(post.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {isAuthor && (
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowOptions(!showOptions)}
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
                        <p className="mt-1">{formatContent(post.content)}</p>
                        <div className="flex justify-between mt-3 max-w-md">
                            <ChatBubbleOvalLeftIcon className="h-5 w-5 text-gray-500 hover:text-blue-500 cursor-pointer" />
                            <ArrowPathRoundedSquareIcon className="h-5 w-5 text-gray-500 hover:text-green-500 cursor-pointer" />
                            <button 
                                onClick={handleLike}
                                className="flex items-center space-x-1"
                            >
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
    );
}