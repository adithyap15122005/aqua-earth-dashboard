import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Droplets, Building2, ThermometerSun, CloudRain, TrendingUp, ArrowRight, AlertTriangle, Shield } from 'lucide-react';
import LocalityCompareChart from '../components/charts/LocalityCompareChart';
import { getLocalityNames, getLocalitiesByRisk, CENSUS_LOCALITY_DATA, BWSSB_STATS, getLocalitySummary } from '../services/censusApi';
import { fetchCurrentWeather, getWeatherRiskFactors } from '../services/weatherApi';

const Dashboard = () => {
    const [selectedLocality, setSelectedLocality] = useState('Whitefield');
    const [weather, setWeather] = useState(null);
    const [weatherHistory, setWeatherHistory] = useState(null);
    const [localityInfo, setLocalityInfo] = useState(null);
    const localities = getLocalityNames();
    const highRiskAreas = getLocalitiesByRisk().filter(l => l.vulnerability_score >= 8);

    useEffect(() => {
        // Fetch weather for selected locality
        const locData = CENSUS_LOCALITY_DATA[selectedLocality];
        if (locData) {
            fetchCurrentWeather(locData.lat, locData.lon).then(setWeather);
            getWeatherRiskFactors().then(setWeatherHistory);
            setLocalityInfo(getLocalitySummary(selectedLocality));
        }
    }, [selectedLocality]);

    return (
        <div className="space-y-8">
            {/* Header with Locality Selector */}
            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '4px' }}>
                        Water Dashboard
                    </h1>
                    <p className="text-secondary">Real-time water management for Bengaluru</p>
                </div>

                {/* Locality Selector */}
                <div className="flex items-center gap-3">
                    <MapPin style={{ color: 'var(--aqua)' }} />
                    <select
                        value={selectedLocality}
                        onChange={(e) => setSelectedLocality(e.target.value)}
                        className="form-select"
                        style={{ minWidth: '200px' }}
                    >
                        {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
            </div>

            {/* Selected Locality Info Card */}
            {localityInfo && (
                <div className="card animate-fadeIn">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
                        {/* Locality Details */}
                        <div style={{ flex: '1', minWidth: '280px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin style={{ color: 'var(--aqua)' }} />
                                {selectedLocality}
                                <span className={`risk-badge ${localityInfo.riskLevel === 'High' ? 'risk-high' : localityInfo.riskLevel === 'Medium' ? 'risk-medium' : 'risk-low'}`}>
                                    {localityInfo.riskLevel} Risk
                                </span>
                            </h2>

                            <div className="grid-3" style={{ gap: '16px' }}>
                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users size={18} style={{ color: 'var(--aqua)' }} />
                                        <span className="text-sm text-muted">Population</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{localityInfo.population}</div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={18} style={{ color: 'var(--mint)' }} />
                                        <span className="text-sm text-muted">Households</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{localityInfo.households}</div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={18} style={{ color: 'var(--warning)' }} />
                                        <span className="text-sm text-muted">Density</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{localityInfo.density}</div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets size={18} style={{ color: 'var(--aqua)' }} />
                                        <span className="text-sm text-muted">Water Source</span>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{localityInfo.waterSource}</div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={18} style={{ color: 'var(--success)' }} />
                                        <span className="text-sm text-muted">BWSSB Coverage</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: parseInt(localityInfo.bwssbCoverage) >= 80 ? 'var(--success)' : parseInt(localityInfo.bwssbCoverage) >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                        {localityInfo.bwssbCoverage}
                                    </div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets size={18} style={{ color: 'var(--danger)' }} />
                                        <span className="text-sm text-muted">Avg Tanker Price</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--aqua)' }}>{localityInfo.avgTankerPrice}</div>
                                </div>
                            </div>
                        </div>

                        {/* Weather Info */}
                        <div style={{ minWidth: '280px', padding: '24px', background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 255, 200, 0.05))', borderRadius: '16px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <ThermometerSun style={{ color: 'var(--warning)' }} />
                                Current Weather
                            </h3>

                            {weather ? (
                                <div className="space-y-4">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 800 }}>{weather.temp}°C</span>
                                        <div>
                                            <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>{weather.description}</div>
                                            <div className="text-sm text-muted">Humidity: {weather.humidity}%</div>
                                        </div>
                                    </div>

                                    {weatherHistory && (
                                        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                                            <h4 className="text-sm font-semibold mb-3 text-muted">Past 30 Days</h4>
                                            <div className="grid-2" style={{ gap: '12px' }}>
                                                <div>
                                                    <CloudRain size={16} style={{ color: 'var(--aqua)', marginBottom: '4px' }} />
                                                    <div className="text-sm text-muted">Rainfall</div>
                                                    <div className="font-bold">{weatherHistory.rainfall_30d_mm} mm</div>
                                                </div>
                                                <div>
                                                    <ThermometerSun size={16} style={{ color: 'var(--danger)', marginBottom: '4px' }} />
                                                    <div className="text-sm text-muted">Heatwave Days</div>
                                                    <div className="font-bold">{weatherHistory.heatwave_days_30d}</div>
                                                </div>
                                                <div>
                                                    <Droplets size={16} style={{ color: 'var(--warning)', marginBottom: '4px' }} />
                                                    <div className="text-sm text-muted">Dry Spell</div>
                                                    <div className="font-bold">{weatherHistory.dry_spell_days_30d} days</div>
                                                </div>
                                                <div>
                                                    <TrendingUp size={16} style={{ color: 'var(--mint)', marginBottom: '4px' }} />
                                                    <div className="text-sm text-muted">Avg Temp</div>
                                                    <div className="font-bold">{weatherHistory.avg_temp_30d}°C</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-muted">Loading weather...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid-4">
                {[
                    { label: 'Run Forecast', path: '/forecast', icon: CloudRain, desc: 'Predict shortage risk' },
                    { label: 'Usage Budget', path: '/timetable', icon: Droplets, desc: 'Water saving timetable' },
                    { label: 'Find Tankers', path: '/tankers', icon: TrendingUp, desc: 'Compare prices' },
                    { label: 'Analytics', path: '/analytics', icon: AlertTriangle, desc: 'View trends' },
                ].map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            to={action.path}
                            className="card"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <div className="flex items-center gap-3">
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 200, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={22} style={{ color: 'var(--aqua)' }} />
                                </div>
                                <div>
                                    <div className="font-semibold">{action.label}</div>
                                    <div className="text-xs text-muted">{action.desc}</div>
                                </div>
                            </div>
                            <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
                        </Link>
                    );
                })}
            </div>

            {/* Two Column Section */}
            <div className="grid-2">
                {/* Locality Risk Chart */}
                <div className="card animate-fadeIn delay-1">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Locality Risk Comparison</h3>
                            <p className="card-subtitle">Top 8 high-risk areas by vulnerability score</p>
                        </div>
                    </div>
                    <LocalityCompareChart />
                </div>

                {/* High Risk Areas List */}
                <div className="card animate-fadeIn delay-2">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">High Risk Localities</h3>
                            <p className="card-subtitle">{highRiskAreas.length} areas with vulnerability ≥ 8.0</p>
                        </div>
                        <Link to="/forecast" style={{ color: 'var(--aqua)', fontSize: '0.875rem', textDecoration: 'none' }}>
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {highRiskAreas.map((loc, index) => (
                            <div
                                key={loc.name}
                                style={{
                                    padding: '14px 16px',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedLocality(loc.name)}
                            >
                                <div>
                                    <div className="font-semibold">{loc.name}</div>
                                    <div className="text-xs text-muted">BWSSB: {loc.bwssb_coverage}% | Pop: {loc.population?.toLocaleString()}</div>
                                </div>
                                <span className="risk-badge risk-high" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                                    {loc.vulnerability_score.toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BWSSB Stats Footer */}
            <div className="card animate-fadeIn delay-3" style={{ padding: '24px 32px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                    <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>BWSSB Bengaluru Official Data</h4>
                        <p className="text-muted text-sm">Bangalore Water Supply and Sewerage Board statistics</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--aqua)' }}>{BWSSB_STATS.total_daily_supply_mld}</div>
                            <div className="text-xs text-muted">MLD Supply</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mint)' }}>{BWSSB_STATS.coverage_percentage}%</div>
                            <div className="text-xs text-muted">Coverage</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)' }}>{BWSSB_STATS.avg_supply_lpcd}</div>
                            <div className="text-xs text-muted">LPCD Avg</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{(BWSSB_STATS.total_connections / 1000000).toFixed(1)}M</div>
                            <div className="text-xs text-muted">Connections</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{localities.length}</div>
                            <div className="text-xs text-muted">Localities</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
