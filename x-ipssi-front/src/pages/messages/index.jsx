import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../redux/auth/authSlice';
import { 
  setOnlineUsers, 
  addMessage, 
  setMessages, 
  setTyping,
  addNotification 
} from '../../redux/message/messageSlice';
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export default function Messages() {
  const dispatch = useDispatch();
  const { users, user } = useSelector((state) => state.auth); // Ajout de user depuis le state
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);
  const { onlineUsers, messages, isTyping } = useSelector(state => state.message);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    // WebSocket connection
    const socket = new WebSocket('ws://localhost:8070');
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      // On envoie immédiatement l'authentification
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        username: user.username
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message reçu:', data);
      
      switch(data.type) {
        case 'user_list':
          console.log('Liste des utilisateurs en ligne:', data.users);
          dispatch(setOnlineUsers(data.users));
          break;
        case 'message_history':
          dispatch(setMessages(data.messages));
          break;
        case 'private_message':
          dispatch(addMessage({
            id: data.messageId,
            content: data.content,
            sender: data.senderId,
            timestamp: data.timestamp,
            status: data.status || 'sent'
          }));
          if (data.senderId !== selectedUser?.id) {
            dispatch(addNotification({
              id: Date.now(),
              userId: data.senderId,
              message: data.content
            }));
          }
          break;
        case 'typing':
          if (data.senderId === selectedUser?.id) {
            dispatch(setTyping(data.isTyping));
          }
          break;
        default:
          console.log('Type de message non géré:', data.type);
      }
    };

    setWs(socket);
    return () => socket.close();
  }, [user.id, dispatch, selectedUser]);

  // Log des changements d'utilisateurs en ligne
  useEffect(() => {
    console.log('Utilisateurs en ligne mis à jour:', onlineUsers);
  }, [onlineUsers]);

  // Filtrer et organiser les utilisateurs
  const filteredAndSortedUsers = users
    .filter(u => u.id !== user?.id) // Exclure l'utilisateur actuel
    .filter(u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aOnline = onlineUsers.some(ou => ou.userId === a.id);
      const bOnline = onlineUsers.some(ou => ou.userId === b.id);
      // Trier d'abord par statut en ligne, puis par nom
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return a.username.localeCompare(b.username);
    });

  // Séparer les utilisateurs en ligne et hors ligne
  const onlineFilteredUsers = filteredAndSortedUsers.filter(u => 
    onlineUsers.some(ou => ou.userId === u.id)
  );
  
  const offlineFilteredUsers = filteredAndSortedUsers.filter(u => 
    !onlineUsers.some(ou => ou.userId === u.id)
  );

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !ws) return;

    const messageData = {
      type: 'private_message',
      recipientId: selectedUser.id,
      content: messageInput
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
      
      // Optimistic update
      dispatch(addMessage({
        id: `temp-${Date.now()}`,
        content: messageInput,
        sender: user.id,
        timestamp: new Date().toISOString(),
        status: 'sent'
      }));
      
      setMessageInput('');
    }
  };

  const handleTyping = () => {
    if (ws && selectedUser) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      ws.send(JSON.stringify({
        type: 'typing',
        recipientId: selectedUser.id,
        isTyping: true
      }));

      typingTimeoutRef.current = setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'typing',
          recipientId: selectedUser.id,
          isTyping: false
        }));
      }, 2000);
    }
  };

  const loadMessageHistory = async (userId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'get_message_history',
        recipientId: userId
      }));
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    loadMessageHistory(user.id);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Liste des conversations avec indicateurs en ligne */}
      <div className="w-96 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {/* Section des utilisateurs en ligne */}
          {onlineFilteredUsers.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-500">En ligne - {onlineFilteredUsers.length}</h3>
              {onlineFilteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`relative w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {getInitial(user.username)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      onlineUsers.some(u => u.userId === user.id) ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{user.username}</div>
                    <p className="text-gray-500 text-sm truncate">{user.lastMessage}</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Section des utilisateurs hors ligne */}
          {offlineFilteredUsers.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-500">Hors ligne - {offlineFilteredUsers.length}</h3>
              {offlineFilteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`relative w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {getInitial(user.username)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      onlineUsers.some(u => u.userId === user.id) ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{user.username}</div>
                    <p className="text-gray-500 text-sm truncate">{user.lastMessage}</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Message si aucun utilisateur trouvé */}
          {filteredAndSortedUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {getInitial(selectedUser.username)}
                </div>
                <div>
                  <div className="font-bold">{selectedUser.username}</div>
                  <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[70%] rounded-lg px-4 py-2
                      ${message.sender === user.id 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-gray-100 mr-auto'
                      }
                    `}
                  >
                    <p className="break-words">{message.content}</p>
                    <div className={`
                      flex items-center justify-end text-xs mt-1
                      ${message.sender === user.id ? 'text-blue-100' : 'text-gray-500'}
                    `}>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.sender === user.id && (
                        <span className="ml-1">
                          {message.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg max-w-[200px] animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {selectedUser.username} est en train d'écrire...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder={isTyping ? "En train d'écrire..." : "Écrivez un message..."}
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Vos messages</h2>
              <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
