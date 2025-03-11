// src/pages/Profile.jsx
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeftIcon, CalendarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/auth/authSlice';
import PostCard from '../../components/PostCard/PostCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPostsBefore , getUserLikedPosts , getUserBookmarkPosts} from '../../redux/post/postSlice';
import myAxios from '../../utils/interceptor';
import FollowPanel from './followPanel';

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, hasMore } = useSelector((state) => state.post);
  const { likedPosts } = useSelector(state => state.post);
  const { bookmarksPosts } = useSelector(state => state.post);
  const [activeTab, setActiveTab] = useState('posts');
  const observer = useRef();

  // États pour les compteurs
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // États pour le panneau de suivi
  const [showFollowPanel, setShowFollowPanel] = useState(false);
  const [panelType, setPanelType] = useState(null);

  // Charger les posts au montage
  useEffect(() => {
    dispatch(getPostsBefore());
  }, [dispatch]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await myAxios.get(`/api/followers/${user.id}/followers`);
        setFollowersCount(response.data.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnés", error);
      }
    };
    if (user?.id) fetchFollowers();
  }, [user]);
  
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await myAxios.get(`/api/followers/${user.id}/following`);
        setFollowingCount(response.data.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnements", error);
      }
    };
    if (user?.id) fetchFollowing();
  }, [user]);

      // Charger les posts aimés de l'utilisateur au montage
      useEffect(() => {
        if (user) {
          dispatch(getUserLikedPosts(user.id));
        }
      }, [dispatch, user]);
    
      // Charger les posts bookamark de l'utilisateur au montage
      useEffect(() => {
        if (user) {
          dispatch(getUserBookmarkPosts(user.id));
        }
      }, [dispatch, user]);

  // Filtrer les posts de l'utilisateur
  const userPosts = posts.filter(post => post.author === user?.username);

  // Calculer le total de likes
  const totalLikes = userPosts.reduce((total, post) => total + (post.likes?.length || 0), 0);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'likes', label: 'J\'aime' },
    { id: 'bookmarks', label: 'Signet' },

  ];

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(getPostsBefore());
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, dispatch]);

  return (
    <div>
      {/* Bannière et Photo de profil */}
      <div className="relative">
        <div className="h-48 bg-blue-100"></div>
        <div className="absolute -bottom-16 left-4">
          <div className="w-32 h-32 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-white text-4xl font-semibold">
            {getInitial(user?.username)}
          </div>
        </div>
        <div className="flex justify-end p-4 space-x-3">
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-red-300 text-red-500 rounded-full font-bold hover:bg-red-50 flex items-center space-x-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Se déconnecter</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-full font-bold hover:bg-gray-50">
            Éditer le profil
          </button>
        </div>
      </div>

      {/* Informations du profil */}
      <div className="px-4 pt-16">
        <h2 className="font-bold text-xl">{user?.name || user?.username}</h2>
        <p className="text-gray-500">@{user?.username}</p>
        <div className="flex items-center space-x-2 mt-3 text-gray-500">
          <CalendarIcon className="h-5 w-5" />
          <span>A rejoint Twitter en {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="flex space-x-5 mt-4">
          <button className="hover:underline">
            <span className="font-bold text-black">{userPosts.length}</span>{' '}
            <span className="text-gray-500">posts</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold text-black">{totalLikes}</span>{' '}
            <span className="text-gray-500">likes reçus</span>
          </button>
          <button onClick={() => { setPanelType('followers'); setShowFollowPanel(true); }} className="hover:underline">
            <span className="font-bold text-black">{followersCount}</span>{' '}
            <span className="text-gray-500">Abonnées</span>
          </button>
          <button onClick={() => { setPanelType('following'); setShowFollowPanel(true); }} className="hover:underline">
            <span className="font-bold text-black">{followingCount}</span>{' '}
            <span className="text-gray-500">Abonnements</span>
          </button>
        </div>
      </div>

      {/* Onglets avec compteur de posts */}
      <div className="flex border-b border-gray-200 mt-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 hover:bg-gray-50 relative ${activeTab === tab.id ? 'font-bold' : ''}`}
          >
            {tab.label}
            {tab.id === 'posts' && ` (${userPosts.length})`}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Liste des posts avec état de chargement */}
      <div className="divide-y divide-gray-200">
        {activeTab === 'posts' && userPosts.map((post, index) => (
          <div key={`${post._id}-${post.createdAt}`} ref={index === userPosts.length - 1 ? lastPostElementRef : null}>
            <PostCard post={post} />
          </div>
        ))}

        {loading && (
          <div className="p-4 text-center text-gray-500">
            Chargement des posts...
          </div>
        )}
        
        {activeTab === 'posts' && !loading && userPosts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <h3 className="font-bold text-xl mb-2">Aucun post pour le moment</h3>
            <p>Lorsque vous posterez quelque chose, cela apparaîtra ici.</p>
          </div>
        )}

        

        
      {activeTab === 'likes' && likedPosts.length > 0 && (
        likedPosts.map((post) => (
          <div key={`${post._id}-${post.createdAt}`}>
            <PostCard post={post} />
          </div>
        ))
      )}
              
        {activeTab === 'likes' && !loading && likedPosts.length === 0 && (
          console.log("likedPosts", likedPosts),
          <div className="p-8 text-center text-gray-500">
            <h3 className="font-bold text-xl mb-2">Aucun post pour le moment</h3>
            <p>Lorsque vous posterez quelque chose, cela apparaîtra ici.</p>
          </div>
        )}


      {activeTab === 'bookmarks' && bookmarksPosts.length > 0 && (
          bookmarksPosts.map((post) => (
          <div key={`${post._id}-${post.createdAt}`}>
            <PostCard post={post} />
          </div>
        ))
      )}

        {activeTab === 'bookmarks' && !loading && bookmarksPosts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <h3 className="font-bold text-xl mb-2">Aucun post pour le moment</h3>
            <p>Lorsque vous posterez quelque chose, cela apparaîtra ici.</p>
          </div>
        )}
      </div>

      {showFollowPanel && (
        <FollowPanel
          userId={user.id}
          type={panelType}
          onClose={() => setShowFollowPanel(false)}
        />
      )}
    </div>
  );
}
