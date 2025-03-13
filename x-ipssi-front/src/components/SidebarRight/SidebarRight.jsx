import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSelector , useDispatch  } from "react-redux";
import { useState, useEffect } from "react";
import { setSearchTerm, clearSearchTerm } from "../../redux/search/searchSlice";

export default function SidebarRight({ setSearchTerm }) {
  const dispatch = useDispatch();
  const reduxSearchTerm = useSelector((state) => state.search.searchTerm);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  useEffect(() => {
    setLocalSearchTerm(reduxSearchTerm);
  }, [reduxSearchTerm]);

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
    dispatch(setSearchTerm(e.target.value));
  };

  const clearSearch = () => {
    setLocalSearchTerm("");
    dispatch(clearSearchTerm());
    
  };
  return (
    <div className="hidden lg:block w-80 ml-8">
      <div className="sticky top-0 bg-white">
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-gray-100 rounded-full py-2 pl-12 pr-10 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            value={localSearchTerm}
            onChange={handleInputChange}
          />
          {localSearchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h2 className="font-bold text-xl mb-4">Tendances pour vous</h2>
          {/* Liste des tendances */}
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-bold text-xl mb-4">Suggestions à suivre</h2>
          {/* Liste des suggestions */}
        </div>
      </div>
    </div>
  );
}