import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AiAssistant from './components/AiAssistant';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  // Show AI assistant only on the admin dashboard
  const showAiAssistant = user && user.role === 'Admin' && location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Protected Routes */}
        <Route 
          path="/teacher/*" 
          element={
            user?.role === 'Teacher' 
              ? <TeacherDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/student/*" 
          element={
            user?.role === 'Student' 
              ? <StudentDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            user?.role === 'Admin' 
              ? <AdminDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>

      {/* AI Assistant — available on all dashboard views */}
      {showAiAssistant && <AiAssistant userRole={user?.role} />}
    </>
  );
}

export default App;
