import { RouterProvider } from 'react-router-dom';
import { router } from './router';

import React from "react";
import { useSelector } from "react-redux";
import useWebSocket from "../src/hooks/useWebSocket";

function App() {
  const { user } = useSelector((state) => state.auth);
  
  // Initialiser la connexion WebSocket lorsque l'utilisateur est connecté
  useWebSocket(user?.id, user?.username);

  return <RouterProvider router={router} />;
}

export default App;