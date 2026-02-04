import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudRain, BarChart3, Truck, CalendarDays, Menu, X, Waves } from 'lucide-react';

const menuItems = [
    { path: '/', label: 'Shortage Forecast', icon: CloudRain },
    { path: '/analytics', label: 'Data Analytics', icon: BarChart3 },
    { path: '/tankers', label: 'Tanker Services', icon: Truck },
];

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Waves />
                    </div>
                    {isSidebarOpen && (
                        <span className="sidebar-title">AquaEarth</span>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === '/' && location.pathname === '/forecast');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon className="nav-icon" />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        padding: '20px',
                        borderTop: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h2 className="header-title">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Shortage Forecast'}
                    </h2>
                    <div className="header-actions">
                        <div className="status-badge">
                            <span className="status-dot"></span>
                            LIVE DATA
                        </div>
                        <div className="avatar">
                            <img
                                src="https://ui-avatars.com/api/?name=User&background=00d4ff&color=0a1628&bold=true"
                                alt="User"
                            />
                        </div>
                    </div>
                </header>

                <section className="page-content">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;
