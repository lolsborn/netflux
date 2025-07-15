import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Plus } from 'lucide-react';
import ApiService from '../api';

const Episodes = () => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getEpisodes();
      setEpisodes(data);
      setError('');
    } catch (err) {
      setError(`Error loading episodes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const generatePreviewImage = (episode) => {
    // If episode has an image_url, use it
    if (episode.image_url) {
      return (
        <img 
          src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${episode.image_url}`}
          alt={episode.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    // Fallback gradient background
    const colors = [
      'from-red-600 to-red-900',
      'from-blue-600 to-blue-900', 
      'from-green-600 to-green-900',
      'from-purple-600 to-purple-900',
      'from-yellow-600 to-yellow-900',
      'from-pink-600 to-pink-900'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${randomColor} flex items-center justify-center p-4`}>
        <div className="text-white text-center">
          <h3 className="text-lg font-bold mb-2">CaseMark Blitz Chronicles</h3>
          <p className="text-sm opacity-90 line-clamp-3">{episode.title}</p>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const generateMetadata = (episode) => {
    return {
      rating: (Math.random() * 2 + 3).toFixed(1),
      duration: Math.floor(Math.random() * 30 + 15) + 'm',
      year: new Date(episode.timestamp).getFullYear(),
      maturityRating: 'PG-13'
    };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Loading episodes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={loadEpisodes}
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/static/images/casemark-logo.svg`} 
            alt="CaseMark Logo" 
            style={{height: '42px'}}
          />
          <h2 className="text-2xl font-semibold">Chronicles - Season 6</h2>
        </div>
        <button
          onClick={() => navigate('/submit')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>New Episode</span>
        </button>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No episodes yet!</h2>
          <p className="text-gray-400">Check back later for new episodes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((episode, index) => {
            const metadata = generateMetadata(episode);
            return (
              <div 
                key={episode.id} 
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                onClick={() => navigate(`/episodes/${episode.id}`)}
              >
                {/* Episode Thumbnail */}
                <div className="h-48 bg-gray-800 relative overflow-hidden">
                  {generatePreviewImage(episode)}
                  {/* Fallback gradient (hidden by default, shown on image error) */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center p-4" style={{display: 'none'}}>
                    <div className="text-white text-center">
                      <h3 className="text-lg font-bold mb-2">CaseMark Blitz Chronicles</h3>
                      <p className="text-sm opacity-90 line-clamp-3">{episode.title}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    E{index + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {metadata.duration}
                  </div>
                </div>
                
                {/* Episode Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Episode {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-sm">{metadata.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{episode.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-3">{episode.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {episode.submitted_by}</span>
                    <span>{metadata.year} • {metadata.maturityRating}</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <span>Submitted: {formatDate(episode.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Episodes;