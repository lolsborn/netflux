const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://netflux-production.up.railway.app/';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Episode endpoints
  async createEpisode(episode) {
    return this.request('/api/episodes', {
      method: 'POST',
      body: JSON.stringify({
        description: episode.description,
        submitted_by: episode.submittedBy,
      }),
    });
  }

  async getEpisodes() {
    return this.request('/api/episodes');
  }

  async getEpisode(episodeId) {
    return this.request(`/api/episodes/${episodeId}`);
  }

  async deleteEpisode(episodeId) {
    return this.request(`/api/episodes/${episodeId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminSettings() {
    return this.request('/api/admin/settings');
  }

  async updateAdminSettings(settings) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async clearAllEpisodes() {
    return this.request('/api/admin/episodes', {
      method: 'DELETE',
    });
  }

  // Status endpoint
  async getStatus() {
    return this.request('/api/status');
  }
}

const apiService = new ApiService();
export default apiService;