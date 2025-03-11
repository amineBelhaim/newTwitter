import PostForm from '../../components/PostForm/PostForm';
import PostCard from '../../components/PostCard/PostCard';
import SidebarRight from '../../components/SidebarRight/SidebarRight';
import { getPostsBefore, clearStatus } from '../../redux/post/postSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import Login from '../auth/login';

export default function Home() {
    const dispatch = useDispatch();
    const { posts, loading, hasMore } = useSelector((state) => state.post);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const loadMore = useCallback(() => {
        if (hasMore && !loading) {
            dispatch(getPostsBefore());
        }
    }, [hasMore, loading, dispatch]);

    useEffect(() => {
        loadMore();
    }, []);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50) {
            loadMore();
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    useEffect(() => {
        return () => {
            dispatch(clearStatus());
        };
    }, [dispatch]);

    return (
        <>
            {isAuthenticated ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <div className="col-span-2">
                        <PostForm />
                        <div className="divide-y divide-gray-200">
                            {posts.map((post, index) => (
                                <div key={`${post._id}-${post.createdAt}`}>
                                    <PostCard post={post} />
                                </div>
                            ))}
                            {loading && (
                                <div className="p-4 text-center text-gray-500">
                                    Chargement...
                                </div>
                            )}
                        </div>
                    </div>
                    <SidebarRight />
                </div>
            ) : (
                <Login />
            )}
        </>
    );
}
