import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { day: 'Mon', supply: 420, demand: 480, saved: 40 },
    { day: 'Tue', supply: 380, demand: 450, saved: 30 },
    { day: 'Wed', supply: 450, demand: 420, saved: 70 },
    { day: 'Thu', supply: 390, demand: 510, saved: 20 },
    { day: 'Fri', supply: 430, demand: 470, saved: 45 },
    { day: 'Sat', supply: 520, demand: 580, saved: 60 },
    { day: 'Sun', supply: 480, demand: 530, saved: 50 }
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{
                        color: entry.color,
                        fontSize: '0.85rem',
                        margin: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px'
                    }}>
                        <span>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>{entry.value}L</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const WaterUsageChart = () => {
    return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="supply"
                        name="Supply"
                        stroke="#00d4ff"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSupply)"
                    />
                    <Area
                        type="monotone"
                        dataKey="demand"
                        name="Demand"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDemand)"
                    />
                    <Area
                        type="monotone"
                        dataKey="saved"
                        name="Saved"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSaved)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WaterUsageChart;
