import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import ApiService from '../api';

const Admin = () => {
  const [settings, setSettings] = useState({ is_submission_open: true });
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, episodesData] = await Promise.all([
        ApiService.getAdminSettings(),
        ApiService.getEpisodes()
      ]);
      setSettings(settingsData);
      setEpisodes(episodesData);
      setError('');
    } catch (err) {
      setError(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmissions = async () => {
    try {
      const newSettings = await ApiService.updateAdminSettings({
        is_submission_open: !settings.is_submission_open
      });
      setSettings(newSettings);
    } catch (err) {
      setError(`Error updating settings: ${err.message}`);
    }
  };

  const clearAllEpisodes = async () => {
    if (window.confirm('Are you sure you want to delete all episodes? This cannot be undone.')) {
      try {
        await ApiService.clearAllEpisodes();
        setEpisodes([]);
      } catch (err) {
        setError(`Error clearing episodes: ${err.message}`);
      }
    }
  };

  const deleteEpisode = async (episodeId) => {
    try {
      await ApiService.deleteEpisode(episodeId);
      setEpisodes(episodes.filter(ep => ep.id !== episodeId));
    } catch (err) {
      setError(`Error deleting episode: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Loading admin panel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings size={24} />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-700 p-4 rounded-lg mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Submission Controls */}
      <div className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Submission Controls</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSubmissions}
            className={`px-4 py-2 rounded flex items-center space-x-2 ${
              settings.is_submission_open 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {settings.is_submission_open ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{settings.is_submission_open ? 'Close Submissions' : 'Open Submissions'}</span>
          </button>
          
          <div className="text-sm text-gray-400">
            Status: {settings.is_submission_open ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>

      {/* Episode Management */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Episode Management</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={clearAllEpisodes}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          Total Episodes: {episodes.length}
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No episodes submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <div key={episode.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{episode.title}</h3>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-3">{episode.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>by {episode.submitted_by}</span>
                      <span>•</span>
                      <span>{formatDate(episode.timestamp)}</span>
                      <span>•</span>
                      <span>ID: {episode.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEpisode(episode.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded ml-4"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;