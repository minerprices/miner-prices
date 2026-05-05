import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          ⛏️ Miner Prices
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/miners">Miners</Link></li>
          <li><Link to="/locations">Locations</Link></li>
          
          {!isLoggedIn ? (
            <>
              <li><Link to="/vendor/login">Vendor Login</Link></li>
              <li><Link to="/admin/login">Admin</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/vendor/dashboard">Dashboard</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
