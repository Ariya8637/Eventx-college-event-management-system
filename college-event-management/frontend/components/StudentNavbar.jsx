import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import DashboardLiveChat from './DashboardLiveChat';
import dataService from '../services/data.service';

const StudentNavbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [allEvents, setAllEvents] = useState([]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Load events for the discussion center
    useEffect(() => {
        if (user) {
            dataService.getAllEvents().then(res => {
                setAllEvents(res.data || []);
            });
        }
    }, [user]);

    return (
        <nav style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9',
            position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <Link to="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎓</span>
                    <span style={{ color: '#7c3aed', fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Student Portal</span>
                </Link>

                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ 
                            background: '#f1f5f9', border: 'none', width: '38px', height: '38px', 
                            borderRadius: '10px', cursor: 'pointer', display: 'flex', 
                            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: '3px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.target.style.background = '#f1f5f9'}
                    >
                        <span style={{ width: '4px', height: '4px', background: '#475569', borderRadius: '50%' }} />
                        <span style={{ width: '4px', height: '4px', background: '#475569', borderRadius: '50%' }} />
                        <span style={{ width: '4px', height: '4px', background: '#475569', borderRadius: '50%' }} />
                    </button>

                    {isMenuOpen && (
                        <div style={{ 
                            position: 'absolute', top: 'calc(100% + 10px)', left: 0, 
                            background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '0.5rem', 
                            minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '2px',
                            zIndex: 1001 
                        }}>
                            <Link to="/student/dashboard" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/events" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Events</Link>
                            <Link to="/saved-events" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Saved Events</Link>
                            <Link to="/my-registrations" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>My Events</Link>
                            <Link to="/certificates" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>My Certificates</Link>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {/* 💬 GLOBAL DISCUSSION BUTTON */}
                <button 
                    onClick={() => setIsChatOpen(true)}
                    style={{ 
                        background: '#f5f3ff', border: '1px solid #ede9fe', color: '#7c3aed', 
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', position: 'relative'
                    }}
                    onMouseEnter={e => e.target.style.background = '#ede9fe'}
                    onMouseLeave={e => e.target.style.background = '#f5f3ff'}
                    title="Live Discussion Center"
                >
                    💬
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }} />
                </button>

                <NotificationBell userId={user?.id || user?._id} />
                
                <Link to="/profile" style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', 
                    textDecoration: 'none', background: '#f8fafc', padding: '0.4rem 0.8rem', 
                    borderRadius: '12px', transition: 'all 0.2s', border: '1px solid transparent'
                }}
                className="profile-link"
                >
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #9d67ef)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                    </div>
                    <span style={{ color: '#1e1b4b', fontWeight: '700', fontSize: '0.9rem' }}>{user?.name || 'John Student'}</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', 
                        padding: '0.5rem 1.25rem', borderRadius: '999px', fontWeight: '700', 
                        fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ef4444'; }}
                >
                    Logout
                </button>
            </div>

            {/* GLOBAL DISCUSSION MODAL */}
            {isChatOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsChatOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setIsChatOpen(false)}
                            style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
                        >✕</button>
                        <DashboardLiveChat allEvents={allEvents} currentUser={user?.name} />
                    </div>
                </div>
            )}

            <style>{`
                .navbar-item:hover { color: #7c3aed !important; }
                .dropdown-item {
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .dropdown-item:hover {
                    background: #f5f3ff;
                    color: #7c3aed;
                }
                .profile-link:hover {
                    background: #fff !important;
                    border-color: #ede9fe !important;
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.08);
                }
            `}</style>
        </nav>
    );
};

export default StudentNavbar;
