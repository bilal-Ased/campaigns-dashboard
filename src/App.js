import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import CampaignsDashboard from './components/CampaignsDashboard';
import LoginPage from './components/Login';
import './App.css';

// Wrapper for LoginPage to handle navigation
const LoginPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleLogin = (token) => {
    console.log('Login successful, token:', token);
    navigate('/dashboard');
  };
  
  return <LoginPage onLogin={handleLogin} />;
};

// Wrapper for Dashboard to handle logout
const DashboardWrapper = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    navigate('/login');
  };
  
  return <CampaignsDashboard onLogout={handleLogout} />;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;