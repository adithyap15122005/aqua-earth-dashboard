import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
    children,
    className = '',
    hover = true,
    delay = 0,
    padding = 'p-6',
    rounded = 'rounded-2xl'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`
                ${hover ? 'glass-card' : 'glass'} 
                ${rounded} 
                ${padding}
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
