import { Link } from 'react-router-dom';
import { HomeIcon, HashtagIcon, BellIcon, InboxIcon, BookmarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Fonction pour générer l'avatar avec la première lettre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-blue-500">
          <svg className="h-8 w-8" viewBox="0 0 24 24">
            <path fill="currentColor" d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
          </svg>
        </Link>
        {isAuthenticated && (
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-500">
              <HomeIcon className="h-6 w-6" />
            </Link>
             <Link to="/notifications" className="hover:text-blue-500">
              <BellIcon className="h-6 w-6" />
            </Link> 
            <Link to="/messages" className="hover:text-blue-500">
              <InboxIcon className="h-6 w-6" />
            </Link>
            <Link to="/profile" className="hover:text-blue-500">
              <UserIcon className="h-6 w-6" />
            </Link>
           
          </nav>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {getInitial(user?.username)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-xs text-gray-500">@{user?.username}</div>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
              Tweet
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Se connecter
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}