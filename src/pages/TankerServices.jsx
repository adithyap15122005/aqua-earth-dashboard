import React, { useState, useMemo } from 'react';
import { MapPin, Star, Phone, Clock, Shield, Truck, BadgeCheck, ArrowUpDown, Droplets } from 'lucide-react';
import { getAllTankers, getTankersByLocality, getRecommendedTanker } from '../services/tankerService';
import { getLocalityNames, CENSUS_LOCALITY_DATA } from '../services/censusApi';

const TankerServices = () => {
    const [selectedLocality, setSelectedLocality] = useState('All');
    const [sortBy, setSortBy] = useState('price');
    const localities = ['All', ...getLocalityNames()];

    const tankers = useMemo(() => {
        if (selectedLocality === 'All') {
            const all = getAllTankers();
            switch (sortBy) {
                case 'rating': return all.sort((a, b) => b.rating - a.rating);
                case 'reliability': return all.sort((a, b) => b.reliability_score - a.reliability_score);
                case 'speed': return all.sort((a, b) => parseInt(a.delivery_time) - parseInt(b.delivery_time));
                default: return all.sort((a, b) => a.price_5000L - b.price_5000L);
            }
        }
        return getTankersByLocality(selectedLocality, sortBy);
    }, [selectedLocality, sortBy]);

    const recommended = useMemo(() => selectedLocality !== 'All' ? getRecommendedTanker(selectedLocality) : null, [selectedLocality]);
    const localityData = selectedLocality !== 'All' ? CENSUS_LOCALITY_DATA[selectedLocality] : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '4px' }}>
                    Tanker Services
                </h1>
                <p className="text-secondary">Find reliable and affordable water tankers near you</p>
            </div>

            {/* Filter Bar */}
            <div className="card animate-fadeIn" style={{ padding: '16px 24px' }}>
                <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
                    {/* Locality Filter */}
                    <div className="flex items-center gap-3" style={{ flex: 1, minWidth: '200px' }}>
                        <MapPin style={{ color: 'var(--aqua)', flexShrink: 0 }} />
                        <select value={selectedLocality} onChange={(e) => setSelectedLocality(e.target.value)} className="form-select" style={{ flex: 1 }}>
                            {localities.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>

                    <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }} />

                    {/* Sort By */}
                    <div className="flex items-center gap-3">
                        <ArrowUpDown style={{ color: 'var(--mint)' }} size={18} />
                        <span className="text-sm text-muted">Sort:</span>
                        <div className="flex gap-2">
                            {[{ key: 'price', label: 'Price' }, { key: 'rating', label: 'Rating' }, { key: 'reliability', label: 'Reliable' }, { key: 'speed', label: 'Speed' }].map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setSortBy(option.key)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: sortBy === option.key ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                                        color: sortBy === option.key ? 'var(--aqua)' : 'var(--text-secondary)',
                                        border: sortBy === option.key ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Locality Info & Recommended */}
            {localityData && (
                <div className="grid-2">
                    <div className="card animate-fadeIn delay-1" style={{ padding: '20px' }}>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <MapPin style={{ color: 'var(--aqua)' }} size={18} />
                            {selectedLocality} Water Info
                        </h3>
                        <div className="grid-2 text-sm">
                            <div><span className="text-muted">BWSSB Coverage:</span> <span className="font-bold" style={{ color: localityData.bwssb_coverage >= 80 ? 'var(--success)' : localityData.bwssb_coverage >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{localityData.bwssb_coverage}%</span></div>
                            <div><span className="text-muted">Water Source:</span> <span>{localityData.water_source}</span></div>
                            <div><span className="text-muted">Avg Tanker Price:</span> <span className="font-bold" style={{ color: 'var(--aqua)' }}>₹{localityData.avg_tanker_price}</span></div>
                            <div><span className="text-muted">Risk Score:</span> <span className="font-bold" style={{ color: localityData.vulnerability_score >= 8 ? 'var(--danger)' : localityData.vulnerability_score >= 7 ? 'var(--warning)' : 'var(--success)' }}>{localityData.vulnerability_score}/10</span></div>
                        </div>
                    </div>

                    {recommended && (
                        <div className="card animate-fadeIn delay-2" style={{ padding: '20px', borderLeft: '4px solid var(--success)' }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✨ Best Match</span>
                                    <h3 className="font-bold text-lg mt-1">{recommended.name}</h3>
                                    <p className="text-sm text-muted">{recommended.type} • {recommended.delivery_time}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{recommended.price_5000L}</div>
                                    <div className="text-xs text-muted">for 5000L</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <a href={`tel:${recommended.phone}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
                                    📞 Call Now
                                </a>
                                <div className="flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                                    <Star size={16} fill="currentColor" />
                                    <span className="font-bold">{recommended.rating}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tanker Cards Grid */}
            <div className="grid-3">
                {tankers.map((tanker, index) => (
                    <div key={tanker.id} className="card animate-fadeIn" style={{ animationDelay: `${index * 0.05}s`, padding: 0, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{tanker.name}</h3>
                                        {tanker.verified && <BadgeCheck style={{ color: 'var(--aqua)' }} size={18} />}
                                    </div>
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '4px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: tanker.type === 'Government' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                                        color: tanker.type === 'Government' ? 'var(--success)' : 'var(--text-muted)',
                                        border: tanker.type === 'Government' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--glass-border)'
                                    }}>
                                        {tanker.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                                    <Star size={16} fill="currentColor" />
                                    <span className="font-bold">{tanker.rating}</span>
                                    <span className="text-xs text-muted">({tanker.reviews})</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.15)' }}>
                            <div className="grid-3 text-center">
                                <div><div className="text-xs text-muted">5000L</div><div className="font-bold" style={{ color: 'var(--aqua)' }}>₹{tanker.price_5000L}</div></div>
                                <div><div className="text-xs text-muted">8000L</div><div className="font-bold">₹{tanker.price_8000L}</div></div>
                                <div><div className="text-xs text-muted">12000L</div><div className="font-bold">₹{tanker.price_12000L}</div></div>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '20px' }} className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-muted" />
                                <span className="text-muted">Delivery:</span>
                                <span>{tanker.delivery_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-muted" />
                                <span className="text-muted">Reliability:</span>
                                <span className="risk-badge risk-low" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                                    {tanker.reliability} ({tanker.reliability_score}%)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck size={16} className="text-muted" />
                                <span className="text-muted">Coverage:</span>
                                <span className="text-xs">{tanker.coverage.slice(0, 2).join(', ')}</span>
                            </div>

                            {/* Features */}
                            <div className="flex gap-2" style={{ flexWrap: 'wrap', paddingTop: '8px' }}>
                                {tanker.features.map((feature, i) => (
                                    <span key={i} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)' }}>
                            <a href={`tel:${tanker.phone}`} className="btn btn-secondary w-full" style={{ padding: '12px', textAlign: 'center' }}>
                                <Phone size={16} /> {tanker.contact}
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* BWSSB Info */}
            <div className="card animate-fadeIn delay-3" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Droplets style={{ color: 'var(--success)' }} size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 className="font-bold mb-1">BWSSB Sanchari Cauvery</h4>
                    <p className="text-sm text-secondary mb-4">
                        For government-rate water delivery, call the official BWSSB tanker service.
                        Lowest rates guaranteed with quality Cauvery water.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="tel:1916" className="btn btn-primary" style={{ padding: '12px 24px' }}>📞 Call 1916</a>
                        <span className="text-muted text-sm">or 080-22945500</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TankerServices;
