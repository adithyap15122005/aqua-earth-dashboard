// Enhanced Tanker Service with cost comparison and reliability ratings
export const BWSSB_TANKER_PRICING = {
    "5000L": 700,
    "8000L": 1000,
    "12000L": 1500,
    "20000L": 2200
};

export const TANKER_SERVICES = [
    {
        id: 1,
        name: "Sanchari Cauvery (BWSSB)",
        type: "Government",
        contact: "1916",
        phone: "080-22945500",
        rating: 4.8,
        reviews: 2450,
        reliability: "Very High",
        reliability_score: 95,
        price_5000L: 700,
        price_8000L: 1000,
        price_12000L: 1500,
        delivery_time: "4-12 Hours",
        coverage: ["Pan-Bengaluru"],
        features: ["Potable Water", "BWSSB Certified", "Fixed Pricing"],
        verified: true
    },
    {
        id: 2,
        name: "Venkateswara Water Supply",
        type: "Private",
        contact: "+91 98450 12345",
        phone: "+91 98450 12345",
        rating: 4.2,
        reviews: 890,
        reliability: "High",
        reliability_score: 82,
        price_5000L: 950,
        price_8000L: 1400,
        price_12000L: 2100,
        delivery_time: "2-4 Hours",
        coverage: ["Whitefield", "Marathahalli", "Mahadevapura", "Bellandur"],
        features: ["Quick Delivery", "24/7 Available"],
        verified: true
    },
    {
        id: 3,
        name: "Kaveri Waters",
        type: "Private",
        contact: "+91 99000 54321",
        phone: "+91 99000 54321",
        rating: 4.5,
        reviews: 1234,
        reliability: "Very High",
        reliability_score: 90,
        price_5000L: 1100,
        price_8000L: 1600,
        price_12000L: 2400,
        delivery_time: "1-2 Hours",
        coverage: ["HSR Layout", "Bellandur", "BTM Layout", "Koramangala"],
        features: ["Premium Quality", "Express Delivery", "App Booking"],
        verified: true
    },
    {
        id: 4,
        name: "Siddaganga Tanker Services",
        type: "Private",
        contact: "+91 98860 98765",
        phone: "+91 98860 98765",
        rating: 3.9,
        reviews: 567,
        reliability: "Medium",
        reliability_score: 72,
        price_5000L: 900,
        price_8000L: 1350,
        price_12000L: 2000,
        delivery_time: "3-5 Hours",
        coverage: ["Hebbal", "Yelahanka", "Rajajinagar"],
        features: ["Affordable", "Bulk Orders"],
        verified: true
    },
    {
        id: 5,
        name: "Namma Neeru Suppliers",
        type: "Private",
        contact: "+91 99001 11111",
        phone: "+91 99001 11111",
        rating: 4.0,
        reviews: 432,
        reliability: "High",
        reliability_score: 78,
        price_5000L: 850,
        price_8000L: 1250,
        price_12000L: 1850,
        delivery_time: "2-4 Hours",
        coverage: ["Jayanagar", "Banashankari", "BTM Layout"],
        features: ["Family Business", "Trusted Since 2010"],
        verified: false
    },
    {
        id: 6,
        name: "Blue Drop Water",
        type: "Private",
        contact: "+91 80 4567 8901",
        phone: "+91 80 4567 8901",
        rating: 4.3,
        reviews: 789,
        reliability: "High",
        reliability_score: 85,
        price_5000L: 1000,
        price_8000L: 1500,
        price_12000L: 2200,
        delivery_time: "2-3 Hours",
        coverage: ["Indiranagar", "Koramangala", "HSR Layout", "Electronic City"],
        features: ["Quality Tested", "Online Payment"],
        verified: true
    }
];

// Get tankers available for a locality, sorted by price (cheapest first)
export const getTankersByLocality = (locality, sortBy = 'price') => {
    const filtered = TANKER_SERVICES.filter(service =>
        service.coverage.includes("Pan-Bengaluru") ||
        service.coverage.some(area =>
            area.toLowerCase().includes(locality.toLowerCase()) ||
            locality.toLowerCase().includes(area.toLowerCase())
        )
    );

    switch (sortBy) {
        case 'price':
            return filtered.sort((a, b) => a.price_5000L - b.price_5000L);
        case 'rating':
            return filtered.sort((a, b) => b.rating - a.rating);
        case 'reliability':
            return filtered.sort((a, b) => b.reliability_score - a.reliability_score);
        case 'speed':
            return filtered.sort((a, b) => {
                const getMinHours = (str) => parseInt(str.split('-')[0]) || 0;
                return getMinHours(a.delivery_time) - getMinHours(b.delivery_time);
            });
        default:
            return filtered;
    }
};

// Get recommended tanker (cheapest + reliable)
export const getRecommendedTanker = (locality) => {
    const tankers = getTankersByLocality(locality);

    // Calculate score: lower price is better, higher reliability is better
    const scored = tankers.map(t => ({
        ...t,
        score: (t.reliability_score * 0.6) - (t.price_5000L / 20)
    }));

    return scored.sort((a, b) => b.score - a.score)[0];
};

// Get all tankers
export const getAllTankers = () => TANKER_SERVICES;

// Calculate savings compared to average private rate
export const calculateSavings = (tanker, localityAvgPrice) => {
    if (tanker.type === 'Government') {
        return Math.round(((localityAvgPrice - tanker.price_5000L) / localityAvgPrice) * 100);
    }
    return 0;
};
