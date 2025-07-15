import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Calendar, User } from 'lucide-react';
import ApiService from '../api';

const EpisodeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEpisode = useCallback(async () => {
    try {
      setLoading(true);
      try {
        // Try to get the specific episode first
        const episode = await ApiService.getEpisode(id);
        setEpisode(episode);
        setError('');
      } catch (specificError) {
        // If the specific endpoint doesn't exist, fall back to getting all episodes
        const episodes = await ApiService.getEpisodes();
        const foundEpisode = episodes.find(ep => ep.id === parseInt(id));
        
        if (foundEpisode) {
          setEpisode(foundEpisode);
          setError('');
        } else {
          setError('Episode not found');
        }
      }
    } catch (err) {
      setError(`Error loading episode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEpisode();
  }, [loadEpisode]);

  const generatePreviewImage = (episode) => {
    // If episode has an image_url, use it
    if (episode.image_url) {
      return (
        <img 
          src={`${process.env.REACT_APP_API_BASE_URL || 'https://netflux-production.up.railway.app'}${episode.image_url}`} 
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
      <div className={`w-full h-full bg-gradient-to-br ${randomColor} flex items-center justify-center p-8`}>
        <div className="text-white text-center">
          <h3 className="text-2xl font-bold mb-4">CaseMark Blitz Chronicles</h3>
          <p className="text-lg opacity-90">{episode.title}</p>
        </div>
      </div>
    );
  };

  const generateMetadata = (episode) => {
    return {
      rating: (Math.random() * 2 + 3).toFixed(1),
      duration: Math.floor(Math.random() * 30 + 15) + 'm',
      year: new Date(episode.timestamp).getFullYear(),
      maturityRating: 'PG-13'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Loading episode...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Back to Episodes
          </button>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Episode not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Back to Episodes
          </button>
        </div>
      </div>
    );
  }

  const metadata = generateMetadata(episode);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Episodes</span>
        </button>
      </div>

      {/* Episode Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Episode Thumbnail */}
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {generatePreviewImage(episode)}
          {/* Fallback gradient (hidden by default, shown on image error) */}
          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center p-8" style={{display: 'none'}}>
            <div className="text-white text-center">
              <h3 className="text-2xl font-bold mb-4">CaseMark Blitz Chronicles</h3>
              <p className="text-lg opacity-90">{episode.title}</p>
            </div>
          </div>
        </div>

        {/* Episode Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{episode.title}</h1>
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-500" />
              <span>{metadata.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{metadata.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={16} />
              <span>{metadata.year}</span>
            </div>
            <span className="bg-gray-700 px-2 py-1 rounded text-xs">
              {metadata.maturityRating}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Episode Description</h3>
            <p className="text-gray-300 leading-relaxed">{episode.description}</p>
          </div>

          {/* Submitted By */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User size={16} />
            <span>Submitted by {episode.submitted_by}</span>
          </div>

          {/* Submission Date */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar size={16} />
            <span>Submitted on {formatDate(episode.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Episode Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Technical Information</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Episode ID: {episode.id}</div>
              <div>Season: 6</div>
              <div>Runtime: {metadata.duration}</div>
              <div>Rating: {metadata.rating}/5.0</div>
              <div>Content Rating: {metadata.maturityRating}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Submission Information</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Submitted by: {episode.submitted_by}</div>
              <div>Submission Date: {formatDate(episode.timestamp)}</div>
              <div>Status: Published</div>
              <div>Type: Engineering Issue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold"
        >
          Back to All Episodes
        </button>
      </div>
    </div>
  );
};

export default EpisodeDetails;