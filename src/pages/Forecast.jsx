import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Users, Droplets, Zap, CloudRain, Calendar, Wind, Droplet, ThermometerSun } from 'lucide-react';
import RiskTimelineChart from '../components/charts/RiskTimelineChart';
import { CENSUS_LOCALITY_DATA, getLocalityNames, getLocalitySummary } from '../services/censusApi';
import { getWeatherRiskFactors, fetchCurrentWeather, getWeatherIcon } from '../services/weatherApi';

const Forecast = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [weather, setWeather] = useState(null);
    const [weatherHistory, setWeatherHistory] = useState(null);
    const localities = getLocalityNames();

    const [formData, setFormData] = useState({
        prediction_date: new Date().toISOString().split('T')[0],
        locality: 'Whitefield',
        household_size: 5,
        usage_per_person_lpd: 110,
        avg_demand_liters: 550,
        avg_supply_liters: 360,
        avg_supply_hours: 2.5,
        tanker_trips_30d: 12
    });

    // Get locality info when selected
    const localityInfo = useMemo(() => {
        return getLocalitySummary(formData.locality);
    }, [formData.locality]);

    // Fetch weather whenever locality changes
    useEffect(() => {
        const fetchLocalityWeather = async () => {
            const locData = CENSUS_LOCALITY_DATA[formData.locality];
            if (locData) {
                const current = await fetchCurrentWeather(locData.lat, locData.lon);
                setWeather(current);
                const history = await getWeatherRiskFactors();
                setWeatherHistory(history);
            }
        };
        fetchLocalityWeather();
    }, [formData.locality]);



    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const requestBody = {
            prediction_date: formData.prediction_date,
            locality: formData.locality,
            household_size: formData.household_size,
            usage_per_person_lpd: formData.usage_per_person_lpd,
            avg_demand_liters: formData.avg_demand_liters,
            avg_supply_liters: formData.avg_supply_liters,
            avg_supply_hours: formData.avg_supply_hours,
            tanker_trips_30d: formData.tanker_trips_30d,
            tanker_days_30d: 0
        };

        try {
            const [resPredict, resTimeline] = await Promise.all([
                fetch('/api/predict_week', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                }),
                fetch('/api/forecast_7day', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                })
            ]);

            if (!resPredict.ok || !resTimeline.ok) {
                const err = !resPredict.ok ? await resPredict.json() : await resTimeline.json();
                throw new Error(err.error || 'Backend returned an error');
            }

            const data = await resPredict.json();
            const timeline = await resTimeline.json();

            const risk_score = Math.round(data.probabilities[data.week_prediction] * 100);

            setResult({
                week_prediction: data.week_prediction,
                risk_score: risk_score,
                probabilities: data.probabilities,
                forecast_range: data.forecast_range,
                weather: data.weather_data
            });

            setTimelineData(timeline.map(item => ({
                day: item.day,
                temp: item.temp,
                rainfall: item.rain,
                riskScore: item.score,
                risk: item.risk
            })));
        } catch (error) {
            console.error('Prediction Error:', error);
            alert(`Error connecting to the AquaEarth AI backend: ${error.message}. Please ensure the service is reachable.`);
        } finally {
            setIsLoading(false);
        }
    };

    const supplyRatio = formData.avg_supply_liters / Math.max(formData.avg_demand_liters, 1);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Real-time Weather & Locality Overview Bar */}
            <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                {/* Weather Card */}
                <div className="card" style={{ flex: '1', minWidth: '300px', padding: '24px', background: 'linear-gradient(135deg, var(--bg-card), rgba(0, 212, 255, 0.05))' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <CloudRain className="text-aqua" />
                            <div>
                                <h3 className="font-bold">Weather Real-time</h3>
                                <p className="text-xs text-secondary">{formData.locality}, Bengaluru</p>
                            </div>
                        </div>
                        {weather && <img src={getWeatherIcon(weather.icon)} alt="weather" style={{ width: '48px' }} />}
                    </div>

                    {weather ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', alignItems: 'center', gap: '30px' }}>
                            {/* Temperature Cluster */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 0.9, letterSpacing: '-2px' }}>
                                        {Math.floor(weather.temp)}
                                        <span style={{ fontSize: '2.5rem', verticalAlign: 'top', marginTop: '10px', display: 'inline-block' }}>.{Math.round((weather.temp % 1) * 10)}°</span>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', paddingLeft: '4px' }}>
                                    <ThermometerSun size={14} className="text-muted" />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>{weather.feels_like}°C</span>
                                </div>
                            </div>

                            {/* Details Cluster */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid var(--glass-border)' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Droplet size={16} className="text-aqua" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Humidity</div>
                                        <div className="text-sm font-bold">{weather.humidity}%</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Wind size={16} className="text-mint" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Wind Speed</div>
                                        <div className="text-sm font-bold">{weather.wind_speed} <span className="text-[10px] font-normal opacity-70">km/h</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-pulse h-16 bg-white/5 rounded-lg"></div>
                    )}
                </div>

                {/* Locality Quick Stats */}
                <div className="card" style={{ flex: '2', minWidth: '400px', padding: '24px' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-mint" />
                            <div>
                                <h3 className="font-bold">Locality Profile</h3>
                                <p className="text-xs text-secondary">Census 2011 & BWSSB Data</p>
                            </div>
                        </div>
                        <span className={`risk-badge ${localityInfo?.riskLevel === 'High' ? 'risk-high' : 'risk-low'}`}>
                            {localityInfo?.riskLevel} Base Risk
                        </span>
                    </div>

                    <div className="grid-4" style={{ gap: '16px' }}>
                        <div>
                            <div className="text-xs text-muted mb-1">Population</div>
                            <div className="font-bold text-lg">{localityInfo?.population}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted mb-1">BWSSB %</div>
                            <div className="font-bold text-lg text-aqua">{localityInfo?.bwssbCoverage}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted mb-1">Tanker ₹</div>
                            <div className="font-bold text-lg text-mint">{localityInfo?.avgTankerPrice}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted mb-1">Density</div>
                            <div className="font-bold text-lg">{localityInfo?.density}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prediction Interface */}
            <div className="grid-3">
                {/* Form Card */}
                <div className="col-span-2">
                    <div className="card" style={{ height: '100%' }}>
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Forecast Generator</h3>
                                <p className="card-subtitle">Configure your usage parameters for AI analysis</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label"><MapPin size={16} /> Select Area</label>
                                    <select name="locality" value={formData.locality} onChange={handleChange} className="form-select">
                                        {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Calendar size={16} /> Date</label>
                                    <input type="date" name="prediction_date" value={formData.prediction_date} onChange={handleChange} className="form-input" />
                                </div>
                            </div>

                            <div className="grid-3">
                                <div className="form-group">
                                    <label className="form-label"><Users size={16} /> People</label>
                                    <input type="number" name="household_size" value={formData.household_size} onChange={handleChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Droplets size={16} /> Supply (L)</label>
                                    <input type="number" name="avg_supply_liters" value={formData.avg_supply_liters} onChange={handleChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Zap size={16} /> Demand (L)</label>
                                    <input type="number" name="avg_demand_liters" value={formData.avg_demand_liters} onChange={handleChange} className="form-input" />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="btn btn-primary w-full" style={{ padding: '18px' }}>
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="spinner"></div> Running ML Prediction...
                                    </span>
                                ) : 'Generate Shortage Forecast'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Score Panel */}
                <div className="card" style={{ height: '100%', background: result ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)' }}>
                    {result ? (
                        <div className="text-center space-y-8 animate-fadeIn">
                            <div>
                                <h3 className="text-secondary text-sm font-bold uppercase tracking-wider mb-4">Risk Probability</h3>
                                <div className={`risk-badge ${result.week_prediction === 'High' ? 'risk-high' : 'risk-low'}`} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
                                    {result.week_prediction} RISK
                                </div>
                            </div>

                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="var(--aqua)" strokeWidth="12"
                                        strokeDasharray="440" strokeDashoffset={440 - (440 * result.risk_score / 100)}
                                        strokeLinecap="round" style={{ transition: 'all 1s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{result.risk_score}</div>
                                    <div className="text-xs text-muted">SCORE</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(result.probabilities).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <span className="text-xs text-muted w-16 text-left">{key}</span>
                                        <div className="progress-bar" style={{ flex: 1 }}>
                                            <div className={`progress-fill ${key === 'High' ? 'danger' : 'aqua'}`} style={{ width: `${val * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted">
                            <Zap size={48} className="mb-4 opacity-20" />
                            <p>Select area and params to view predicted risk score</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline & Analysis */}
            {result && (
                <div className="grid-2">
                    <div className="card">
                        <h3 className="card-title mb-6">7-Day Risk Timeline</h3>
                        <RiskTimelineChart data={timelineData} />
                    </div>
                    <div className="card">
                        <h3 className="card-title mb-6">Environmental Factors</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Last 30 Days Rainfall</p>
                                    <p className="text-xs text-muted">Direct correlation with borewell levels</p>
                                </div>
                                <span className="text-aqua font-bold">{result.weather?.rainfall_30d_mm} mm</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Heatwave Incidents</p>
                                    <p className="text-xs text-muted">Increased evapotranspiration & demand</p>
                                </div>
                                <span className="text-danger font-bold">{result.weather?.heatwave_days_30d} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Dry Spell Duration</p>
                                    <p className="text-xs text-muted">Continuous days without precipitation</p>
                                </div>
                                <span className="text-warning font-bold">{result.weather?.dry_spell_days_30d} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Avg Environment Temp</p>
                                    <p className="text-xs text-muted">Past 30-day mean temperature</p>
                                </div>
                                <span className="text-mint font-bold">{result.weather?.temperature_avg_c}°C</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Forecast;
