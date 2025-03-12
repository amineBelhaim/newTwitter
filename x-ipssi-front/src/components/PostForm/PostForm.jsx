import { useState, useEffect } from 'react';
import { PhotoIcon, GifIcon, ChartBarIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../redux/post/postSlice';

export default function PostForm() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { status } = useSelector((state) => state.post);
  
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (status === 'loading') {
      showNotification('loading', 'Envoi du tweet en cours...');
    } else if (status === 'success') {
      showNotification('success', 'Tweet publié avec succès !');
      setContent('');
      setMedia(null);
      setPreview(null);
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

  // 📌 Gérer l'upload des images/vidéos
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file)); // 📌 Aperçu de l'image ou vidéo
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
  
    let mediaBase64 = null;
  
    // 📌 Convertir l’image en Base64 si un fichier est sélectionné
    if (media) {
      const reader = new FileReader();
      reader.readAsDataURL(media);
      reader.onload = () => {
        mediaBase64 = reader.result; // 📌 Contient l’image en Base64
  
        // 📌 Construire l’objet à envoyer
        const postData = {
          name: user.name || user.username,
          content,
          author: user.username,
          user: user.id, // 📌 L'ObjectId de l'utilisateur
          media: mediaBase64, // 📌 Stocker l’image en Base64
        };
  
        dispatch(addPost(postData));
      };
    } else {
      // 📌 Si pas d’image, envoyer directement
      const postData = {
        name: user.name || user.username,
        content,
        author: user.username,
        user: user.id,
        media: null, // 📌 Pas d’image
      };
  
      dispatch(addPost(postData));
    }
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

              {/* 📌 Afficher un aperçu de l'image ou de la vidéo sélectionnée */}
              {preview && (
                <div className="mt-2 relative">
                  {media && media.type.startsWith("video/") ? (
                    <video className="w-full max-h-48 rounded-lg" controls>
                      <source src={preview} type={media.type} />
                    </video>
                  ) : (
                    <img src={preview} alt="Aperçu" className="w-full max-h-48 rounded-lg" />
                  )}
                  <button 
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => {
                      setMedia(null);
                      setPreview(null);
                    }}
                  >
                    ✖
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <div className="flex space-x-4">
                  {/* 📌 Bouton pour sélectionner une image ou une vidéo */}
                  <button
                    type="button"
                    className="hover:bg-blue-50 rounded-full p-2"
                    onClick={() => document.getElementById("mediaInput").click()}
                  >
                    <PhotoIcon className="h-6 w-6 text-blue-500" />
                  </button>
                  <input
                    id="mediaInput"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaChange}
                  />

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
                  className={`px-4 py-2 rounded-full font-bold ${!content.trim() || status === 'loading'
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'}
                      text-white transition-colors`}
                >
                  {status === 'loading' ? 'Envoi...' : 'Tweet'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
