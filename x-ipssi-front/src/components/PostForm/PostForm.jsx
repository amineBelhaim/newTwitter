import { useState, useEffect } from 'react';
import { PhotoIcon, GifIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../redux/post/postSlice';

export default function PostForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status } = useSelector((state) => state.post);
  const [content, setContent] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (status === 'loading') {
      showNotification('loading', 'Envoi du tweet en cours...');
    } else if (status === 'success') {
      showNotification('success', 'Tweet publié avec succès !');
    } else if (status === 'failed') {
      showNotification('error', 'Erreur lors de la publication');
    }
  }, [status]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch(addPost({
      name : user.name || user.username,
      content,
      author: user.username
    }));
    setContent('');
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {getInitial(user?.username)}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 text-xl placeholder-gray-500 focus:outline-none"
                placeholder="Quoi de neuf ?"
                rows="2"
                maxLength={280}
              />
              <div className="flex justify-between items-center pt-4">
                <div className="flex space-x-4">
                  <button type="button" className="hover:bg-blue-50 rounded-full p-2">
                    <PhotoIcon className="h-6 w-6 text-blue-500" />
                  </button>
                  <button type="button" className="hover:bg-blue-50 rounded-full p-2">
                    <GifIcon className="h-6 w-6 text-blue-500" />
                  </button>
                  <button type="button" className="hover:bg-blue-50 rounded-full p-2">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  </button>
                  <span className="text-sm text-gray-500 self-center">
                    {content.length}/280
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!content.trim() || status === 'loading'}
                  className={`
                    px-4 py-2 rounded-full font-bold
                    ${!content.trim() || status === 'loading'
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                    }
                    text-white transition-colors
                  `}
                >
                  {status === 'loading' ? 'Envoi...' : 'Tweet'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className={`
            rounded-lg shadow-lg px-6 py-4 max-w-sm
            ${notification.type === 'loading' && 'bg-blue-500 text-white'}
            ${notification.type === 'success' && 'bg-green-500 text-white'}
            ${notification.type === 'error' && 'bg-red-500 text-white'}
            transform transition-all duration-300 ease-in-out
          `}>
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}
    </>
  );
}