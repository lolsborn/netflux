import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Episodes from './components/Episodes';
import EpisodeDetails from './components/EpisodeDetails';
import Admin from './components/Admin';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Episodes />} />
          <Route path="/submit" element={<Home />} />
          <Route path="/episodes/:id" element={<EpisodeDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;