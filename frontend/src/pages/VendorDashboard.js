import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../api';
import './Pages.css';

const VendorDashboard = ({ onLogout }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('locations');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    coolingType: '',
    hostingFeePerKwh: '',
    setupFee: '',
    bandwidthIncludedMbps: '',
    availablePowerKw: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getVendorLocations();
      setLocations(response.data.locations);
    } catch (err) {
      setError('Failed to load your locations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await locationsAPI.create(formData);
      setFormData({
        name: '',
        city: '',
        country: '',
        coolingType: '',
        hostingFeePerKwh: '',
        setupFee: '',
        bandwidthIncludedMbps: '',
        availablePowerKw: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
      });
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      setError('Failed to create location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await locationsAPI.delete(id);
        fetchLocations();
      } catch (err) {
        setError('Failed to delete location');
      }
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <button className="danger" onClick={onLogout}>Logout</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          My Locations ({locations.length})
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
      </div>

      {activeTab === 'locations' && (
        <>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{ marginBottom: '20px' }}>
              + Add Hosting Location
            </button>
          ) : (
            <form className="card" onSubmit={handleAddLocation} style={{ marginBottom: '20px' }}>
              <h3>Add New Hosting Location</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Location Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cooling Type</label>
                  <input
                    type="text"
                    name="coolingType"
                    value={formData.coolingType}
                    onChange={handleInputChange}
                    placeholder="e.g., Immersion, Air-cooled"
                  />
                </div>

                <div className="form-group">
                  <label>Hosting Fee ($/kWh) *</label>
                  <input
                    type="number"
                    name="hostingFeePerKwh"
                    value={formData.hostingFeePerKwh}
                    onChange={handleInputChange}
                    step="0.0001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Setup Fee ($)</label>
                  <input
                    type="number"
                    name="setupFee"
                    value={formData.setupFee}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Available Power (kW)</label>
                  <input
                    type="number"
                    name="availablePowerKw"
                    value={formData.availablePowerKw}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Bandwidth Included (Mbps)</label>
                  <input
                    type="number"
                    name="bandwidthIncludedMbps"
                    value={formData.bandwidthIncludedMbps}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell miners about your hosting facility..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit">Create Location</button>
                <button 
                  type="button" 
                  className="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="loading">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="card">
              <p>No hosting locations added yet. Create one to start accepting miners!</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>City, Country</th>
                  <th>Rate ($/kWh)</th>
                  <th>Power Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td><strong>{loc.name}</strong></td>
                    <td>{loc.city}, {loc.country}</td>
                    <td className="price">${loc.hosting_fee_per_kwh.toFixed(4)}</td>
                    <td>{loc.available_power_kw ? `${loc.available_power_kw} kW` : 'N/A'}</td>
                    <td>
                      <button 
                        className="danger"
                        onClick={() => handleDeleteLocation(loc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === 'account' && (
        <div className="card">
          <h3>Account Information</h3>
          <p>Account management features coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
