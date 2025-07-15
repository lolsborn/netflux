import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Sparkles, ImageIcon, Database } from 'lucide-react';
import ApiService from '../api';

const Home = () => {
  const navigate = useNavigate();
  const [newEpisode, setNewEpisode] = useState({
    description: '',
    submittedBy: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submissionStep, setSubmissionStep] = useState(0); // 0: idle, 1: creating, 2: generating image, 3: complete


  const handleSubmit = async () => {
    if (newEpisode.description && newEpisode.submittedBy) {
      setIsSubmitting(true);
      setSubmitMessage('');
      
      try {
        // Step 1: Creating episode
        setSubmissionStep(1);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
        // Step 2: Generating AI image
        setSubmissionStep(2);
        console.log('Submitting episode:', newEpisode);
        await ApiService.createEpisode(newEpisode);
        
        // Step 3: Complete
        setSubmissionStep(3);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Show success state
        
        setNewEpisode({ description: '', submittedBy: '' });
        setSubmitMessage('Episode submitted successfully!');
        
        // Reset after showing success and redirect
        setTimeout(() => {
          setSubmissionStep(0);
          setSubmitMessage('');
          navigate('/');
        }, 2000);
        
      } catch (error) {
        setSubmissionStep(0);
        setSubmitMessage(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Submit Your Episode</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your biggest challenge experienced <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newEpisode.description}
              onChange={(e) => setNewEpisode({...newEpisode, description: e.target.value})}
              placeholder="Tell us about your biggest challenge - what happened, how did you handle it, what did you learn?"
              className={`w-full p-3 bg-gray-800 border rounded focus:outline-none h-32 transition-colors ${
                newEpisode.description.trim() === '' ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-red-500'
              }`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newEpisode.submittedBy}
              onChange={(e) => setNewEpisode({...newEpisode, submittedBy: e.target.value})}
              placeholder="Enter your name (required)"
              className={`w-full p-3 bg-gray-800 border rounded focus:outline-none transition-colors ${
                newEpisode.submittedBy.trim() === '' ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-red-500'
              }`}
              required
            />
            {newEpisode.submittedBy.trim() === '' && (
              <p className="mt-1 text-xs text-red-400">Name is required to submit an episode</p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !newEpisode.description.trim() || !newEpisode.submittedBy.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-lg flex items-center space-x-2 text-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Episode'}</span>
            </button>
          </div>
        </div>


        {/* Animated Submission Flow */}
        {isSubmitting && (
          <div className="mt-4 p-4 bg-blue-900 bg-opacity-50 rounded border border-blue-700">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {/* Step 1: Creating Episode */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                  submissionStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {submissionStep > 1 ? (
                    <Check size={16} />
                  ) : submissionStep === 1 ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Database size={16} />
                  )}
                  <span>Creating Episode</span>
                </div>

                {/* Step 2: Generating AI Image */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                  submissionStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {submissionStep > 2 ? (
                    <Check size={16} />
                  ) : submissionStep === 2 ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  <span>Generating AI Image</span>
                </div>

                {/* Step 3: Complete */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                  submissionStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {submissionStep === 3 ? (
                    <div className="animate-bounce">
                      <Check size={16} />
                    </div>
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>Complete</span>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(submissionStep / 3) * 100}%`
                }}
              ></div>
            </div>
            
            {/* Status text */}
            <div className="mt-2 text-sm text-gray-300">
              {submissionStep === 1 && "Generating clickbait title and saving episode..."}
              {submissionStep === 2 && "Creating a stunning AI-generated thumbnail..."}
              {submissionStep === 3 && "🎉 Your episode is now live!"}
            </div>
          </div>
        )}

        {submitMessage && !isSubmitting && (
          <div className={`mt-4 p-4 rounded ${submitMessage.includes('Error') ? 'bg-red-900 bg-opacity-50 border-red-700' : 'bg-green-900 bg-opacity-50 border-green-700'} border`}>
            <p className="text-sm">{submitMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;