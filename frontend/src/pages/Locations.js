import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../api';
import './Pages.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      setLocations(response.data.locations);
    } catch (err) {
      setError('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (location) => {
    setSelectedLocation(selectedLocation?.id === location.id ? null : location);
  };

  return (
    <div className="container">
      <h1>Mining Hosting Locations</h1>
      <p>Find verified mining hosting providers with the best electricity rates</p>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="loading">No hosting locations available</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Location</th>
                <th>Cooling</th>
                <th>Rate (/kWh)</th>
                <th>Setup Fee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <React.Fragment key={location.id}>
                  <tr>
                    <td><strong>{location.company_name}</strong></td>
                    <td>{location.city}, {location.country}</td>
                    <td>{location.cooling_type || 'N/A'}</td>
                    <td className="price">${location.hosting_fee_per_kwh.toFixed(4)}</td>
                    <td>{location.setup_fee ? `$${location.setup_fee}` : 'Free'}</td>
                    <td>
                      <button 
                        className="secondary"
                        onClick={() => handleViewDetails(location)}
                      >
                        {selectedLocation?.id === location.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  
                  {selectedLocation?.id === location.id && (
                    <tr>
                      <td colSpan="6" style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
                        <div>
                          <h4>Facility Details</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px' }}>
                            {location.available_power_kw && (
                              <div>
                                <strong>Available Power:</strong> {location.available_power_kw} kW
                              </div>
                            )}
                            
                            {location.bandwidth_included_mbps && (
                              <div>
                                <strong>Bandwidth:</strong> {location.bandwidth_included_mbps} Mbps
                              </div>
                            )}
                            
                            {location.power_cost_per_kwh && (
                              <div>
                                <strong>Power Cost:</strong> ${location.power_cost_per_kwh}/kWh
                              </div>
                            )}
                          </div>
                          
                          {location.description && (
                            <div style={{ marginTop: '15px' }}>
                              <strong>Description:</strong>
                              <p>{location.description}</p>
                            </div>
                          )}
                          
                          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            {location.contact_email && (
                              <div>
                                <strong>Email:</strong> <a href={`mailto:${location.contact_email}`}>{location.contact_email}</a>
                              </div>
                            )}
                            
                            {location.contact_phone && (
                              <div>
                                <strong>Phone:</strong> {location.contact_phone}
                              </div>
                            )}
                            
                            {location.website && (
                              <div>
                                <strong>Website:</strong> <a href={location.website} target="_blank" rel="noopener noreferrer">{location.website}</a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Locations;
