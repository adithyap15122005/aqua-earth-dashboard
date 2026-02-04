import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Droplets, Clock, Zap, BarChart3 } from 'lucide-react';
import { getLocalityNames } from '../data/localityData';

const ForecastForm = ({ formData, setFormData, onSubmit, isLoading }) => {
    const localities = getLocalityNames();

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const inputFields = [
        {
            name: 'household_size',
            label: 'Household Size',
            icon: Users,
            type: 'number',
            min: 1,
            max: 20,
            suffix: 'people'
        },
        {
            name: 'usage_per_person_lpd',
            label: 'Usage per Person',
            icon: Droplets,
            type: 'number',
            min: 50,
            max: 200,
            suffix: 'LPD'
        },
        {
            name: 'avg_demand_liters',
            label: 'Daily Demand',
            icon: BarChart3,
            type: 'number',
            min: 100,
            max: 2000,
            suffix: 'L/day'
        },
        {
            name: 'avg_supply_liters',
            label: 'Average Supply',
            icon: Zap,
            type: 'number',
            min: 0,
            max: 2000,
            suffix: 'L/day'
        },
        {
            name: 'avg_supply_hours',
            label: 'Supply Duration',
            icon: Clock,
            type: 'number',
            min: 0,
            max: 24,
            step: 0.5,
            suffix: 'hrs/day'
        },
        {
            name: 'tanker_trips_30d',
            label: 'Tanker Trips (30d)',
            icon: Droplets,
            type: 'number',
            min: 0,
            max: 100,
            suffix: 'trips'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2rem] p-8"
        >
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Shortage Forecast</h3>
                <p className="text-text-muted text-sm">
                    Enter your water usage details to predict shortage risk for the next 7 days.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Locality & Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                            <MapPin size={16} className="text-aqua" />
                            Locality
                        </label>
                        <select
                            name="locality"
                            value={formData.locality}
                            onChange={handleChange}
                            className="select-glass"
                        >
                            {localities.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                            <Clock size={16} className="text-aqua" />
                            Prediction Date
                        </label>
                        <input
                            type="date"
                            name="prediction_date"
                            value={formData.prediction_date}
                            onChange={handleChange}
                            className="input-glass"
                        />
                    </div>
                </div>

                {/* Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inputFields.map((field) => {
                        const Icon = field.icon;
                        return (
                            <div key={field.name} className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
                                    <Icon size={16} className="text-mint" />
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        min={field.min}
                                        max={field.max}
                                        step={field.step || 1}
                                        className="input-glass pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                                        {field.suffix}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Supply Ratio Indicator */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-text-muted">Supply/Demand Ratio</span>
                        <span className={`font-bold ${(formData.avg_supply_liters / formData.avg_demand_liters) < 0.6
                                ? 'text-high'
                                : (formData.avg_supply_liters / formData.avg_demand_liters) < 0.85
                                    ? 'text-med'
                                    : 'text-low'
                            }`}>
                            {((formData.avg_supply_liters / formData.avg_demand_liters) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${(formData.avg_supply_liters / formData.avg_demand_liters) < 0.6
                                    ? 'progress-high'
                                    : (formData.avg_supply_liters / formData.avg_demand_liters) < 0.85
                                        ? 'progress-med'
                                        : 'progress-low'
                                }`}
                            style={{ width: `${Math.min((formData.avg_supply_liters / formData.avg_demand_liters) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-bg1 border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            Generate 7-Day Forecast
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ForecastForm;
