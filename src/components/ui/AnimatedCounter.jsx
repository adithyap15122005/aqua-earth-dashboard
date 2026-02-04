import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 1.5, prefix = '', suffix = '', decimals = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const countRef = useRef(null);
    const startTime = useRef(null);
    const startValue = useRef(0);

    useEffect(() => {
        startValue.current = displayValue;
        startTime.current = null;

        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue.current + (value - startValue.current) * easeOut;

            setDisplayValue(current);

            if (progress < 1) {
                countRef.current = requestAnimationFrame(animate);
            }
        };

        countRef.current = requestAnimationFrame(animate);

        return () => {
            if (countRef.current) {
                cancelAnimationFrame(countRef.current);
            }
        };
    }, [value, duration]);

    const formattedValue = decimals > 0
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toLocaleString();

    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="tabular-nums"
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
};

export default AnimatedCounter;
