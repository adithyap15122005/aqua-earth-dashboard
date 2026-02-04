import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getLocalitiesByRisk } from '../../services/censusApi';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(10, 22, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minWidth: '180px'
            }}>
                <p style={{ fontWeight: 700, marginBottom: '8px', color: '#fff', fontSize: '0.95rem' }}>{data.name}</p>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Risk Score:</span>
                        <span style={{ color: data.vulnerability_score >= 8 ? '#ef4444' : data.vulnerability_score >= 7 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{data.vulnerability_score}</span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Population:</span>
                        <span style={{ fontWeight: 500 }}>{data.population?.toLocaleString()}</span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>BWSSB:</span>
                        <span style={{ fontWeight: 500 }}>{data.bwssb_coverage}%</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const LocalityCompareChart = () => {
    const data = getLocalitiesByRisk().slice(0, 8);

    const getBarColor = (score) => {
        if (score >= 8) return '#ef4444';
        if (score >= 7) return '#f59e0b';
        return '#22c55e';
    };

    return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        domain={[0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="vulnerability_score" radius={[0, 6, 6, 0]} barSize={24}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.vulnerability_score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LocalityCompareChart;
