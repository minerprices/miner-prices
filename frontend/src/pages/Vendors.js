import React, { useState, useEffect } from 'react';
import './Pages.css';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [countryFilter, setCountryFilter] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendors();
  }, [countryFilter, maxFee]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      
      // Mock data - would call actual API
      const mockVendors = [
        {
          id: 1,
          name: 'Hashrate Host',
          locations: 2,
          lowest_fee: '0.0500',
        },
        {
          id: 2,
          name: 'MiningCo',
          locations: 1,
          lowest_fee: '0.0400',
        },
        {
          id: 3,
          name: 'ASIC Center',
          locations: 1,
          lowest_fee: '0.0300',
        },
        {
          id: 4,
          name: 'Global Host Mining',
          locations: 1,
          lowest_fee: '0.0600',
        },
        {
          id: 5,
          name: 'CryptoFarm Pro',
          locations: 1,
          lowest_fee: '0.0200',
        },
      ];

      const mockLocations = [
        { vendor_id: 1, vendor: 'Hashrate Host', name: 'Texas Facility (500MW)', country: 'US', fee: 0.05 },
        { vendor_id: 2, vendor: 'MiningCo', name: 'Reykjavik Geothermal', country: 'Iceland', fee: 0.04 },
        { vendor_id: 3, vendor: 'ASIC Center', name: 'Beijing Complex', country: 'China', fee: 0.03 },
        { vendor_id: 4, vendor: 'Global Host', name: 'Vancouver Hydro', country: 'Canada', fee: 0.06 },
        { vendor_id: 5, vendor: 'CryptoFarm', name: 'Almaty Power', country: 'Kazakhstan', fee: 0.02 },
      ];

      let filtered = mockLocations;
      if (countryFilter) {
        filtered = filtered.filter(l => l.country === countryFilter);
      }
      if (maxFee) {
        filtered = filtered.filter(l => l.fee <= parseFloat(maxFee));
      }

      setVendors(mockVendors);
      setLocations(filtered);
      setError(null);
    } catch (err) {
      setError('Failed to load vendors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const countries = ['US', 'Iceland', 'China', 'Canada', 'Kazakhstan'];

  return (
    <div className="page-container">
      <h1>🌍 Mining Hosting Vendors</h1>
      <p className="subtitle">Find the best hosting solutions for your mining operation</p>

      <div className="vendors-container">
        {/* Filters */}
        <div className="filters-card">
          <div className="filter-group">
            <label>Filter by Country:</label>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Hosting Fee ($/kWh):</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g., 0.08"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading vendors...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {/* Vendors Grid */}
            <div className="vendors-grid">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  className={`vendor-card ${selectedVendor?.id === vendor.id ? 'active' : ''}`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <h3>{vendor.name}</h3>
                  <div className="vendor-info">
                    <div className="info-item">
                      <span className="label">Locations</span>
                      <span className="value">{vendor.locations}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Starting From</span>
                      <span className="value">${vendor.lowest_fee}/kWh</span>
                    </div>
                  </div>
                  <button className="view-btn">View Details →</button>
                </div>
              ))}
            </div>

            {/* Locations Table */}
            <div className="locations-section">
              <h2>Hosting Locations</h2>
              {locations.length === 0 ? (
                <div className="no-data">No locations match your filters</div>
              ) : (
                <div className="locations-table-wrapper">
                  <table className="locations-table">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Location</th>
                        <th>Country</th>
                        <th>Fee ($/kWh)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location, idx) => (
                        <tr key={idx}>
                          <td className="vendor-cell">{location.vendor}</td>
                          <td>{location.name}</td>
                          <td>{location.country}</td>
                          <td className="fee-cell">${location.fee.toFixed(4)}</td>
                          <td>
                            <button className="action-btn">Contact</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .subtitle {
          color: #6c757d;
          margin-bottom: 30px;
        }

        .vendors-container {
          margin-top: 20px;
        }

        .filters-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 600;
          font-size: 14px;
        }

        .filter-group select,
        .filter-group input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          width: 250px;
        }

        .vendors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .vendor-card {
          background: white;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .vendor-card:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0,123,255,0.15);
        }

        .vendor-card.active {
          border-color: #007bff;
          background: #f0f7ff;
        }

        .vendor-card h3 {
          margin: 0 0 15px 0;
          color: #212529;
        }

        .vendor-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .info-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .info-item .label {
          display: block;
          font-size: 12px;
          color: #6c757d;
          font-weight: 600;
        }

        .info-item .value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #007bff;
          margin-top: 5px;
        }

        .view-btn {
          width: 100%;
          padding: 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }

        .view-btn:hover {
          background: #0056b3;
        }

        .locations-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .locations-section h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #212529;
        }

        .locations-table-wrapper {
          overflow-x: auto;
        }

        .locations-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .locations-table thead {
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }

        .locations-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
        }

        .locations-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #dee2e6;
        }

        .locations-table tbody tr:hover {
          background: #f8f9fa;
        }

        .vendor-cell {
          font-weight: 600;
          color: #007bff;
        }

        .fee-cell {
          font-weight: 600;
          color: #28a745;
        }

        .action-btn {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.3s;
        }

        .action-btn:hover {
          background: #0056b3;
        }

        @media (max-width: 768px) {
          .filters-card {
            flex-direction: column;
          }

          .filter-group select,
          .filter-group input {
            width: 100%;
          }

          .vendors-grid {
            grid-template-columns: 1fr;
          }

          .locations-table {
            font-size: 12px;
          }

          .locations-table th,
          .locations-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Vendors;
