import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Generate 7-day forecast data
const generateForecastData = () => {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
        const temp = 28 + Math.random() * 8;
        const rainfall = index === 2 || index === 3 ? Math.random() * 15 : Math.random() * 3;
        const baseRisk = 50 + (temp - 30) * 3 - rainfall * 2;
        const riskScore = Math.max(20, Math.min(90, baseRisk + Math.random() * 15));

        return {
            day,
            temp: Math.round(temp),
            rainfall: Math.round(rainfall * 10) / 10,
            riskScore: Math.round(riskScore),
            risk: riskScore >= 70 ? 'High' : riskScore >= 45 ? 'Medium' : 'Low'
        };
    });
};

const data = generateForecastData();

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minWidth: '160px'
            }}>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{d.day}</p>
                <div style={{ fontSize: '0.8rem' }}>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: d.risk === 'High' ? '#ef4444' : d.risk === 'Medium' ? '#f59e0b' : '#22c55e' }}>
                        <span>Risk:</span>
                        <span style={{ fontWeight: 600 }}>{d.risk} ({d.riskScore}%)</span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'rgba(255,255,255,0.7)' }}>
                        <span>Temp:</span>
                        <span>{d.temp}°C</span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}>
                        <span>Rainfall:</span>
                        <span>{d.rainfall}mm</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const RiskTimelineChart = ({ data = [] }) => {
    return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />
                    <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
                    <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#00d4ff"
                        strokeWidth={3}
                        dot={(props) => {
                            const { cx, cy, payload } = props;
                            const color = payload.risk === 'High' ? '#ef4444' : payload.risk === 'Medium' ? '#f59e0b' : '#22c55e';
                            return (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={8}
                                    fill={color}
                                    stroke="#0a1628"
                                    strokeWidth={3}
                                    filter="drop-shadow(0 0 6px rgba(0,0,0,0.3))"
                                />
                            );
                        }}
                        activeDot={{ r: 10, strokeWidth: 3, stroke: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span>
                    Low Risk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                    Medium Risk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                    High Risk
                </span>
            </div>
        </div>
    );
};

export default RiskTimelineChart;
