import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Thermometer, ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const RiskBadge = ({ risk }) => {
    const configs = {
        Low: { color: 'text-low bg-low/10 border-low/20', icon: ShieldCheck, label: 'LOW RISK' },
        Medium: { color: 'text-med bg-med/10 border-med/20', icon: AlertTriangle, label: 'MEDIUM RISK' },
        High: { color: 'text-high bg-high/10 border-high/20', icon: AlertCircle, label: 'HIGH RISK' },
    };

    const config = configs[risk] || configs.Low;
    const Icon = config.icon;

    return (
        <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${config.color}`}>
            <Icon size={14} />
            {config.label}
        </div>
    );
};

const ProbabilityBar = ({ label, percentage, colorClassName }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
            <span className="text-text-muted">{label}</span>
            <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${colorClassName}`}
            />
        </div>
    </div>
);

const ForecastResult = ({ result }) => {
    if (!result) {
        return (
            <div className="h-full glass rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 text-text-muted">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Info size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white">No Forecast Data</h4>
                    <p className="text-sm max-w-[200px]">Fill the form and click forecast to see the 7-day water risk analysis.</p>
                </div>
            </div>
        );
    }

    const { week_prediction, probabilities, auto_weather_used, locality_meta_used } = result;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2rem] p-8 space-y-8"
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">Analysis Results</h3>
                    <p className="text-text-muted text-sm">Based on ML model & real-time weather.</p>
                </div>
                <RiskBadge risk={week_prediction} />
            </div>

            {/* Main Risk Display */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${week_prediction === 'High' ? 'bg-high/20 text-high' :
                        week_prediction === 'Medium' ? 'bg-med/20 text-med' : 'bg-low/20 text-low'
                    }`}>
                    {week_prediction === 'High' ? '🚨' : week_prediction === 'Medium' ? '⚠️' : '✅'}
                </div>
                <div className="flex-1">
                    <h4 className={`text-2xl font-black ${week_prediction === 'High' ? 'text-high' :
                            week_prediction === 'Medium' ? 'text-med' : 'text-low'
                        }`}>
                        {week_prediction} Shortage Risk
                    </h4>
                    <p className="text-text-muted text-sm mt-1">
                        Prediction for {result.forecast_range?.start} to {result.forecast_range?.end}
                    </p>
                </div>
            </div>

            {/* Probabilities */}
            <div className="space-y-5">
                <ProbabilityBar label="Low Probability" percentage={probabilities.Low * 100} colorClassName="bg-low" />
                <ProbabilityBar label="Medium Probability" percentage={probabilities.Medium * 100} colorClassName="bg-med" />
                <ProbabilityBar label="High Probability" percentage={probabilities.High * 100} colorClassName="bg-high" />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-aqua text-sm font-bold">
                        <CloudRain size={16} /> Weather Feed
                    </div>
                    <div className="text-xs space-y-1.5 text-text-muted">
                        <div className="flex justify-between">
                            <span>Rain (30d):</span>
                            <span className="text-white">{auto_weather_used.rainfall_30d_mm}mm</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Heatwave:</span>
                            <span className="text-white">{auto_weather_used.heatwave_days_30d} days</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-mint text-sm font-bold">
                        <Thermometer size={16} /> Area Meta
                    </div>
                    <div className="text-xs space-y-1.5 text-text-muted">
                        <div className="flex justify-between">
                            <span>Density:</span>
                            <span className="text-white">{locality_meta_used.population_density_score}/10</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Const. Index:</span>
                            <span className="text-white">{locality_meta_used.construction_index}/10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Box */}
            <div className="p-5 rounded-2xl bg-aqua/5 border border-aqua/20 space-y-2">
                <h5 className="text-sm font-bold text-aqua flex items-center gap-2 font-['Outfit']">
                    💡 Conservation Strategy
                </h5>
                <p className="text-xs text-text-muted leading-relaxed">
                    {week_prediction === 'High'
                        ? "Immediate conservation required. Shift non-essential activities to next week. Check nearby tankers now."
                        : week_prediction === 'Medium'
                            ? "Possible supply irregularities. Avoid car washing and gardening. Store minimal fallback water."
                            : "Supply conditions are favorable. Maintain routine water saving habits to prevent future shortages."}
                </p>
            </div>
        </motion.div>
    );
};

export default ForecastResult;
