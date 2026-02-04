import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { month: 'Aug', shortage: 35, tankerTrips: 180, rainfall: 120 },
    { month: 'Sep', shortage: 28, tankerTrips: 150, rainfall: 80 },
    { month: 'Oct', shortage: 42, tankerTrips: 220, rainfall: 40 },
    { month: 'Nov', shortage: 55, tankerTrips: 280, rainfall: 20 },
    { month: 'Dec', shortage: 48, tankerTrips: 250, rainfall: 10 },
    { month: 'Jan', shortage: 62, tankerTrips: 320, rainfall: 5 },
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
                        fontSize: '0.8rem',
                        margin: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px'
                    }}>
                        <span>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>{entry.value}{entry.name === 'Shortage' ? '%' : entry.name === 'Rainfall' ? 'mm' : ''}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const TrendChart = () => {
    return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '12px' }}
                        formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{value}</span>}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="shortage"
                        name="Shortage"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="tankerTrips"
                        name="Tanker Trips"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="rainfall"
                        name="Rainfall"
                        stroke="#00d4ff"
                        strokeWidth={2}
                        dot={{ fill: '#00d4ff', r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
