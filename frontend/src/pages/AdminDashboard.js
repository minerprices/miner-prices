import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './Pages.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedVendor, setExpandedVendor] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await adminAPI.getPendingVendors();
        setPendingVendors(response.data.vendors);
      } else if (activeTab === 'vendors') {
        const response = await adminAPI.getAllVendors();
        setAllVendors(response.data.vendors);
      } else if (activeTab === 'stats') {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } else if (activeTab === 'logs') {
        const response = await adminAPI.getSyncLogs();
        setSyncLogs(response.data.logs);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      const reason = prompt('Approval reason (optional):');
      if (reason !== null) {
        await adminAPI.approveVendor(vendorId, reason);
        fetchData();
      }
    } catch (err) {
      setError('Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId) => {
    try {
      const reason = prompt('Rejection reason:');
      if (reason) {
        await adminAPI.rejectVendor(vendorId, reason);
        fetchData();
      }
    } catch (err) {
      setError('Failed to reject vendor');
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="danger" onClick={onLogout}>Logout</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending Vendors
        </button>
        <button 
          className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          👥 All Vendors
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          🔄 Sync Logs
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="stats">
              <div className="stat-card">
                <div className="stat-value">{stats.vendors.total}</div>
                <div className="stat-label">Total Vendors</div>
                <div className="stat-label">({stats.vendors.approved} approved)</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.miners.total}</div>
                <div className="stat-label">Active Miners</div>
                <div className="stat-label">({stats.miners.algorithms} algorithms)</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.locations.total}</div>
                <div className="stat-label">Hosting Locations</div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <>
              {pendingVendors.length === 0 ? (
                <div className="card">No pending vendor approvals</div>
              ) : (
                <div>
                  {pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h3>{vendor.company_name}</h3>
                          <p><strong>Email:</strong> {vendor.email}</p>
                          {vendor.contact_name && <p><strong>Contact:</strong> {vendor.contact_name}</p>}
                          {vendor.contact_phone && <p><strong>Phone:</strong> {vendor.contact_phone}</p>}
                          {vendor.website && <p><strong>Website:</strong> <a href={vendor.website} target="_blank" rel="noopener noreferrer">{vendor.website}</a></p>}
                          <p><strong>Locations:</strong> {vendor.locations_count || 0}</p>
                          <p><strong>Registered:</strong> {new Date(vendor.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          <button 
                            onClick={() => handleApprove(vendor.id)}
                            style={{ backgroundColor: '#388e3c' }}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="danger"
                            onClick={() => handleReject(vendor.id)}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'vendors' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Locations</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td><strong>{vendor.company_name}</strong></td>
                    <td>{vendor.email}</td>
                    <td>
                      <span className={`badge ${vendor.approved ? 'approved' : 'pending'}`}>
                        {vendor.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>{vendor.locations_count || 0}</td>
                    <td>{new Date(vendor.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="secondary"
                        onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                      >
                        {expandedVendor === vendor.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'logs' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Added</th>
                  <th>Updated</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.sync_type}</td>
                    <td>{log.miners_added}</td>
                    <td>{log.miners_updated}</td>
                    <td>{log.miners_total}</td>
                    <td>
                      <span className={`badge ${log.status === 'success' ? 'approved' : 'rejected'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.error_message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
