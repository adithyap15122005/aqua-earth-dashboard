import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Forecast from './pages/Forecast';
import Analytics from './pages/Analytics';
import TankerServices from './pages/TankerServices';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Forecast is now the first/home page */}
          <Route path="/" element={<Forecast />} />
          <Route path="/forecast" element={<Navigate to="/" replace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tankers" element={<TankerServices />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
