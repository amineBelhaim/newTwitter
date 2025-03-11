// src/pages/UserProfile.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import myAxios from '../../utils/interceptor';
import PostCard from '../../components/PostCard/PostCard';
import { getPostsBefore } from '../../redux/post/postSlice';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { followUser, unfollowUser } from '../../redux/follower/followerThunk';
import FollowPanel from './followPanel';

export default function UserProfile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { posts, loading, hasMore } = useSelector((state) => state.post);
  const currentUser = useSelector((state) => state.auth.user);

  const [profileUser, setProfileUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const observer = useRef();

  // États pour le panneau de suivi
  const [showFollowPanel, setShowFollowPanel] = useState(false);
  const [panelType, setPanelType] = useState(null);

  // Récupérer les infos du profil visité
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await myAxios.get(`/api/users/${userId}`);
        setProfileUser(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil", error);
      } finally {
        setLocalLoading(false);
      }
    }
    if (userId) fetchUser();
  }, [userId]);

  // Charger les posts globalement
  useEffect(() => {
    dispatch(getPostsBefore());
  }, [dispatch]);

  // Filtrer les posts pour ne garder que ceux du profil visité
  const userPosts = posts.filter(post => post.author === profileUser?.username);

  // Récupérer les abonnés (followers) une fois le profil chargé
  useEffect(() => {
    if (!profileUser) return;
    async function fetchFollowers() {
      try {
        const response = await myAxios.get(`/api/followers/${profileUser._id}/followers`);
        setFollowersCount(response.data.length);
        if (currentUser && response.data.some(f => f.follower._id.toString() === currentUser.id)) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnés", error);
      }
    }
    fetchFollowers();
  }, [profileUser, currentUser]);

  // Récupérer les abonnements (following) une fois le profil chargé
  useEffect(() => {
    if (!profileUser) return;
    async function fetchFollowing() {
      try {
        const response = await myAxios.get(`/api/followers/${profileUser._id}/following`);
        setFollowingCount(response.data.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnements", error);
      }
    }
    fetchFollowing();
  }, [profileUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !currentUser.id) {
      console.error("Utilisateur non authentifié ou id manquant.");
      return;
    }
    try {
      if (!isFollowing) {
        await dispatch(followUser({ 
          followerId: currentUser.id, 
          followedId: profileUser._id 
        }));
      } else {
        await dispatch(unfollowUser({ 
          followerId: currentUser.id, 
          followedId: profileUser._id 
        }));
      }
      // Recharger les compteurs
      fetchFollowers();
      fetchFollowing();
    } catch (error) {
      console.error("Erreur lors de l'action follow/unfollow", error);
    }
  };

  async function fetchFollowers() {
    try {
      const response = await myAxios.get(`/api/followers/${profileUser._id}/followers`);
      setFollowersCount(response.data.length);
      if (currentUser && response.data.some(f => f.follower._id.toString() === currentUser.id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés", error);
    }
  }
  
  async function fetchFollowing() {
    try {
      const response = await myAxios.get(`/api/followers/${profileUser._id}/following`);
      setFollowingCount(response.data.length);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements", error);
    }
  }

  // Infinite scroll pour les posts
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

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  if (localLoading) return <div>Chargement...</div>;
  if (!profileUser) return <div>Profil non trouvé</div>;

  return (
    <div>
      {/* Bannière et Photo de profil */}
      <div className="relative">
        <div className="h-48 bg-blue-100"></div>
        <div className="absolute -bottom-16 left-4">
          <div className="w-32 h-32 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-white text-4xl font-semibold">
            {getInitial(profileUser.username)}
          </div>
        </div>
      </div>

      {/* Informations du profil */}
      <div className="px-4 pt-16">
        <h2 className="font-bold text-xl">{profileUser.name}</h2>
        <p className="text-gray-500">@{profileUser.username}</p>
        <div className="flex items-center space-x-2 mt-3 text-gray-500">
          <CalendarIcon className="h-5 w-5" />
          <span>
            A rejoint Twitter en {new Date(profileUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        {currentUser.id !== profileUser._id && (
          <div className="mt-4">
            <button
              onClick={handleFollowToggle}
              className="px-4 py-2 rounded-full font-bold border hover:bg-gray-50"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        )}
        <div className="flex space-x-5 mt-4">
          <button className="hover:underline">
            <span className="font-bold text-black">{userPosts.length}</span>{' '}
            <span className="text-gray-500">posts</span>
          </button>
          <button onClick={() => { setPanelType('followers'); setShowFollowPanel(true); }} className="hover:underline">
            <span className="font-bold text-black">{followersCount}</span>{' '}
            <span className="text-gray-500">Abonnés</span>
          </button>
          <button onClick={() => { setPanelType('following'); setShowFollowPanel(true); }} className="hover:underline">
            <span className="font-bold text-black">{followingCount}</span>{' '}
            <span className="text-gray-500">Abonnements</span>
          </button>
        </div>
      </div>

      {/* Affichage des posts du profil visité */}
      <div className="px-4 mt-6">
        {userPosts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userPosts.map((post, index) => (
              <div key={`${post._id}-${post.createdAt}`} ref={index === userPosts.length - 1 ? lastPostElementRef : null}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <h3 className="font-bold text-xl mb-2">Aucun post pour le moment</h3>
            <p>Ce profil n'a pas encore publié de contenu.</p>
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <Link to="/" className="text-blue-500 hover:underline">Retour à la timeline</Link>
      </div>

      {showFollowPanel && (
        <FollowPanel
          userId={profileUser._id}
          type={panelType}
          onClose={() => setShowFollowPanel(false)}
        />
      )}
    </div>
  );
}
