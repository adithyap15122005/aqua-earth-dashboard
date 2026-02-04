import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({
    title,
    value,
    suffix = '',
    prefix = '',
    trend = null,
    trendValue = null,
    icon: Icon,
    color = 'aqua',
    delay = 0
}) => {
    const colorClasses = {
        aqua: 'from-aqua to-aqua/50 text-aqua',
        mint: 'from-mint to-mint/50 text-mint',
        low: 'from-low to-low/50 text-low',
        med: 'from-med to-med/50 text-med',
        high: 'from-high to-high/50 text-high',
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={14} />;
        if (trend === 'down') return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-low';
        if (trend === 'down') return 'text-high';
        return 'text-text-muted';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="glass-card stat-card rounded-2xl p-6 relative overflow-hidden"
        >
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />

            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-20 flex items-center justify-center`}>
                    {Icon && <Icon className={colorClasses[color].split(' ').pop()} size={24} />}
                </div>

                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-text-muted text-sm font-medium">{title}</h3>
                <div className="text-3xl font-bold text-white">
                    <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
