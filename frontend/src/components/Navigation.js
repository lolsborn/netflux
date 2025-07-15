import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-black border-b border-gray-800 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors">
            NETFLUX
          </Link>
          <span className="text-gray-400">CaseMark Blitz Chronicles</span>
        </div>
        
      </div>
    </nav>
  );
};

export default Navigation;