import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Calendar from './pages/Calendar';
import Friends from './pages/Friends';

function App() {
  return (
    <Router>
      {/* Global Toast Container for minor feedback */}
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
            zIndex: 9999
          },
        }}
      />
      
      <Routes>
        {/* Auth routes (No sidebar/notifications here) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* STEP 1: Wrap all protected pages inside MainLayout */}
        {/* Everything inside this Route will share the Sidebar & Global Engine */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="calendar" element={<Calendar />} /> 
          <Route path="friends" element={<Friends />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;