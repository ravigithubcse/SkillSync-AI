import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/hooks/useAuth';
import { useEffect } from 'react';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import JobsPage from '@/pages/JobsPage';
import JobDetailPage from '@/pages/JobDetailPage';
import MentorPage from '@/pages/MentorPage';
import InterviewsPage from '@/pages/InterviewsPage';
import MarketPage from '@/pages/MarketPage';
import ProfilePage from '@/pages/ProfilePage';
import MessagesPage from '@/pages/MessagesPage';
import ResumePage from '@/pages/ResumePage';
import SkillsPage from '@/pages/SkillsPage';
import Layout from '@/components/Layout';

function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<MessagesPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/skills" element={<SkillsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
