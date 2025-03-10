import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../assets/styles/pages/Messages.css";
import { getUsers } from "../redux/authSlice/authSlice";
import { getConversation } from "../redux/messageSlice/messageThunk";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, users, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Récupérer les users
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // Mettre à jour les conversations quand les users changent
  useEffect(() => {
    if (status === "success" && users) {
      // Filtrer et trier les utilisateurs
      const filteredUsers = users
        .filter(u => u.id !== user.id) // Exclure l'utilisateur connecté
        .map(u => ({
          ...u,
          online: onlineUsers.some(online => online.userId === u.id),
          lastSeen: new Date(u.lastSeen).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
            }),
        }))
        .sort((a, b) => {
          // Trier: en ligne d'abord, puis par ordre alphabétique
          if (a.online && !b.online) return -1;
          if (!a.online && b.online) return 1;
          return a.username.localeCompare(b.username);
        });

      setConversations(filteredUsers);
    }
  }, [status, users, onlineUsers, user.id]);

  console.log('online', onlineUsers);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  // Gestion de la connexion WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8070");
    
    socket.onopen = () => {
      console.log("WebSocket connecté");
      // Authentification initiale
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        username: user.username
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message reçu:", data);

        switch(data.type) {
          case 'user_list':
            setOnlineUsers(data.users);
            break;
          
          case 'private_message':
            setMessagesList(prev => [...prev, {
              id: data.messageId,
              sender: data.senderId,
              content: data.content,
              timestamp: data.timestamp,
              status: data.status
            }]);

            // Mise à jour du dernier message dans les conversations
            setConversations(prev => prev.map(conv => {
              // Mettre à jour pour l'expéditeur et le destinataire
              if (conv.id === data.senderId || conv.id === data.recipientId) {
                return {
                  ...conv,
                  lastMessage: data.content,
                  lastMessageTime: new Date(data.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                };
              }
              return conv;
            }));
            break;

          case 'message_history':
            setMessagesList(data.messages.reverse());
            break;

          case 'typing':
            if (data.senderId === selectedUser?.id) {
              setIsTyping(data.isTyping);
            }
            break;

          case 'error':
            console.error("Erreur WebSocket:", data.content);
            // Gérer l'affichage de l'erreur à l'utilisateur
            break;
        }
      } catch (error) {
        console.error("Erreur parsing message:", error);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user.id, user.username]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (ws && selectedUser && messageInput.trim() !== "") {
      const messageData = {
        type: 'private_message',
        recipientId: selectedUser.id,
        content: messageInput
      };

      ws.send(JSON.stringify(messageData));
      setMessageInput("");
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

  // Ajouter cette fonction pour charger les messages
  const loadConversationMessages = async (userId) => {
    if (userId) {
      try {
        const result = await dispatch(getConversation(userId)).unwrap();
        setMessagesList(result);
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    }
  };

  // Modifier la fonction de sélection d'utilisateur
  const handleUserSelect = (conv) => {
    setSelectedUser(conv);
    loadConversationMessages(conv.id);
  };

  if (status === "loading") return <div>Chargement...</div>;
  if (status === "failed") return <div>Erreur de chargement</div>;

  return (
    <div className="messages-container">
      <div className="users-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="online-status-info">
            <span className="online-count">
              {conversations.filter(u => u.online).length} utilisateurs en ligne
            </span>
          </div>
          <input
            type="search"
            placeholder="Rechercher une conversation..."
            className="search-input"
          />
        </div>
        <div className="users-list">
          {/* Section des utilisateurs en ligne */}
          {conversations.some(conv => conv.online) && (
            <div className="users-section">
              <div className="section-header">En ligne</div>
              {conversations
                .filter(conv => conv.online)
                .map((conv) => (
                  <div
                    key={conv.id}
                    className={`user-item ${selectedUser?.id === conv.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(conv)} // Modifier ici
                  >
                    <div className="user-avatar">
                      <span>{conv.username[0].toUpperCase()}</span>
                      <span className="status-indicator online"></span>
                    </div>
                    <div className="user-info">
                      <div className="user-name-time">
                        <h4>{conv.username}</h4>
                        {conv.lastMessageTime && (
                          <span className="message-time">{conv.lastMessageTime}</span>
                        )}
                      </div>
                      {conv.lastMessage && conv.id !== selectedUser?.id && (
                        <div className="notification-badge">
                          <span className="notification-dot"></span>
                          <p className="notification-preview">
                            {conv.lastMessage.length > 25 
                              ? conv.lastMessage.substring(0, 25) + '...' 
                              : conv.lastMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Section des utilisateurs hors ligne */}
          {conversations.some(conv => !conv.online) && (
            <div className="users-section">
              <div className="section-header">Hors ligne</div>
              {conversations
                .filter(conv => !conv.online)
                .map((conv) => (
                  <div
                    key={conv.id}
                    className={`user-item ${selectedUser?.id === conv.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(conv)}
                  >
                    <div className="user-avatar">
                      <span>{conv.username[0].toUpperCase()}</span>
                      <span className="status-indicator offline"></span>
                    </div>
                    <div className="user-info">
                      <div className="user-name-time">
                        <h4>{conv.username}</h4>
                      </div>
                      <p className="last-message">
                        {conv.lastMessage || "Hors ligne"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <h3>{selectedUser.username}</h3>
                <span className={`status-text ${
                  onlineUsers.some(u => u.userId === selectedUser.id) ? 'online' : 'offline'
                }`}>
                  {onlineUsers.some(u => u.userId === selectedUser.id) ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              {/* Indicateur de frappe déplacé et amélioré */}
              {isTyping && (
                <div className="typing-indicator-container">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{selectedUser.username} écrit...</span>
                </div>
              )}
            </div>
            <div className="messages-list">
              {messagesList.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${message.sender === user.id ? "sent" : "received"}`}
                >
                  <div className="message-bubble">
                    <div className="message-content">
                      <p>{message.content}</p>
                    </div>
                    <div className="message-info">
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.sender === user.id && (
                        <span className={`message-status ${message.status}`}>
                          {message.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-input-container">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleTyping}
                placeholder= {isTyping ? "En train d'écrire... Humm👀" : "Tapez un message..."}
              />
              <button type="submit">Envoyer</button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <i className="fas fa-comments"></i>
              <h3>Vos messages</h3>
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;