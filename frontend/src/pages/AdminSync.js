import React, { useState, useEffect } from 'react';
import './AdminSync.css';

const AdminSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [logs, setLogs] = useState([]);
  const [minerCount, setMinerCount] = useState(0);

  useEffect(() => {
    loadSyncInfo();
  }, []);

  const loadSyncInfo = async () => {
    try {
      // Get sync logs
      const response = await fetch('https://miner-prices.onrender.com/api/admin/sync-logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.logs && data.logs.length > 0) {
        setLogs(data.logs.slice(0, 10)); // Last 10 syncs
        setLastSync(data.logs[0].created_at);
        setMinerCount(data.logs[0].miners_added);
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus('Starting sync...');

    try {
      const response = await fetch('https://miner-prices.onrender.com/api/admin/sync-comprehensive', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus(`✅ Success! Synced ${data.miners_synced} miners and updated prices`);
        setLastSync(new Date().toISOString());
        setMinerCount(data.miners_synced);
        
        // Reload sync logs after a short delay
        setTimeout(loadSyncInfo, 2000);
      } else {
        setSyncStatus(`❌ Error: ${data.error || 'Sync failed'}`);
      }
    } catch (error) {
      setSyncStatus(`❌ Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="admin-sync-container">
      <h1>🔄 Miner Data Sync</h1>
      <p className="subtitle">Sync ASIC miners from WhattoMine API + OneMiriers metadata + Coin prices</p>

      {/* Sync Control Panel */}
      <div className="sync-panel">
        <div className="sync-info">
          <div className="info-card">
            <h3>Last Sync</h3>
            <p className="value">{lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</p>
          </div>
          <div className="info-card">
            <h3>Miners in Database</h3>
            <p className="value">{minerCount}</p>
          </div>
          <div className="info-card">
            <h3>Data Sources</h3>
            <p className="sources">
              ✅ WhattoMine API<br/>
              ✅ CoinGecko API<br/>
              ✅ OneMiriers Metadata
            </p>
          </div>
        </div>

        <button
          className={`sync-button ${syncing ? 'syncing' : ''}`}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
        </button>

        {syncStatus && (
          <div className={`sync-message ${syncStatus.includes('✅') ? 'success' : 'error'}`}>
            {syncStatus}
          </div>
        )}
      </div>

      {/* Sync History */}
      <div className="sync-history">
        <h2>📋 Sync History</h2>
        {logs.length === 0 ? (
          <p className="no-data">No sync history yet. Click "Sync Now" to start.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Miners</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.miners_added}</td>
                  <td className={log.status === 'success' ? 'success' : 'error'}>
                    {log.status === 'success' ? '✅' : '❌'} {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Data Structure Info */}
      <div className="data-info">
        <h2>📊 Synced Data</h2>
        <div className="fields-grid">
          <div className="field">
            <strong>Basic Info:</strong> Name, Algorithm, Power, Hashrate, Efficiency
          </div>
          <div className="field">
            <strong>Manufacturer:</strong> Bitmain, MicroBT, Canaan, etc.
          </div>
          <div className="field">
            <strong>Cooling Type:</strong> Air, Hydro, Immersion
          </div>
          <div className="field">
            <strong>Images:</strong> Product photos from OneMiriers
          </div>
          <div className="field">
            <strong>Tutorial Video:</strong> YouTube video ID (oneminers channel)
          </div>
          <div className="field">
            <strong>Tutorial PDF:</strong> Setup guides and manuals
          </div>
          <div className="field">
            <strong>Firmware:</strong> Latest firmware downloads
          </div>
          <div className="field">
            <strong>Apps:</strong> Control software and monitoring tools
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSync;
