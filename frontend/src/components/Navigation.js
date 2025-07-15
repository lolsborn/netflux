import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="bg-black border-b border-gray-800 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors">
            NETFLUX
          </Link>
          <span className="text-gray-400">CaseMark Blitz Chronicles</span>
        </div>
        
        <button
          onClick={() => navigate('/submit')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>New Episode</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;