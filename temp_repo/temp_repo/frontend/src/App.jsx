import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/core/AppShell.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SimulatePage from './pages/SimulatePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import GraphPage from './pages/GraphPage.jsx';
import { useAuthStore } from './store/authStore.js';

export default function App() {
  const setDemoUser = useAuthStore((s) => s.setDemoUser);

  // Auto-login for hackathon demo
  useEffect(() => {
    const token = localStorage.getItem('nexus_demo_token');
    if (!token) setDemoUser();
  }, [setDemoUser]);

  return (
    <AppShell>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/simulate" element={<SimulatePage />} />
        <Route path="/history"  element={<HistoryPage />} />
        <Route path="/graph"    element={<GraphPage />} />
      </Routes>
    </AppShell>
  );
}
