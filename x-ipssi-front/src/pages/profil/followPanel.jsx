// src/components/FollowPanel/FollowPanel.jsx
import React, { useEffect, useState } from 'react';
import myAxios from '../../utils/interceptor';

export default function FollowPanel({ userId, type, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer la liste selon le type ("followers" ou "following")
  useEffect(() => {
    async function fetchData() {
      try {
        const endpoint =
          type === 'followers'
            ? `/api/followers/${userId}/followers`
            : `/api/followers/${userId}/following`;
        const response = await myAxios.get(endpoint);
        setList(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de la liste:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, type]);

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-md">
      <div className="rounded-2xl shadow-xl w-96 max-h-full overflow-y-auto p-4 border border-gray-200" style={{ backgroundColor: 'white' }}>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">
            {type === 'followers' ? 'Abonnés' : 'Abonnements'}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>
          {loading ? (
            <p className="text-center text-gray-300">Chargement...</p>
          ) : list.length === 0 ? (
            <p className="text-center text-gray-300">Aucun utilisateur trouvé.</p>
          ) : (
            <ul>
              {list.map((item) => (
                <li key={item._id} className="py-2 px-2 hover:bg-gray-800 rounded transition-colors">
                  {type === 'followers'
                    ? `${item.follower.name} (@${item.follower.username})`
                    : `${item.followed.name} (@${item.followed.username})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
