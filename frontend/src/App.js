import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Miners from './pages/Miners';
import MinerDetailNew from './pages/MinerDetailNew';
import Locations from './pages/Locations';
import Profitability from './pages/Profitability';
import Calculator from './pages/Calculator';
import Vendors from './pages/Vendors';
import Tools from './pages/Tools';
import Comparison from './pages/Comparison';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSync from './pages/AdminSync';
import Navigation from './components/Navigation';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Navigation isLoggedIn={!!token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/miners" element={<Miners />} />
        <Route path="/miner/:slug" element={<MinerDetailNew />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/profitability" element={<Profitability />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/tools" element={<Tools />} />
        
        <Route path="/vendor/login" element={<VendorLogin onLogin={handleLogin} />} />
        <Route path="/vendor/register" element={<VendorRegister onLogin={handleLogin} />} />
        <Route 
          path="/vendor/dashboard" 
          element={token ? <VendorDashboard onLogout={handleLogout} /> : <Navigate to="/vendor/login" />} 
        />
        
        <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route 
          path="/admin/dashboard" 
          element={token ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/sync" 
          element={token ? <AdminSync /> : <Navigate to="/admin/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
