import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';
import DashboardLiveChat from '../components/DashboardLiveChat';
import { InvoiceViewer, generateInvoiceNumber } from '../components/PaymentInvoice';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);
    
    // Carousel state
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [eventsRes, regsRes] = await Promise.all([
                    dataService.getAllEvents(),
                    dataService.getMyRegistrations()
                ]);
                setEvents(eventsRes.data || []);
                setRegistrations(regsRes.data || []);
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    // CAROUSEL ANIMATION LOGIC
    useEffect(() => {
        if (!loading && events.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % Math.min(events.length, 5));
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [loading, events]);

    // ─── FUNCTIONAL HANDLERS ──────────────────────────────────────────────
    const handlePrintInvoice = (e) => {
        // Find if user is registered for this event to get the real registration data
        const reg = registrations.find(r => r.event?._id === e._id || r.event === e._id);
        if (!reg) {
            alert("You need to register for this event first to view the invoice.");
            return;
        }

        const fee = e.fee || 200;
        const platform = Math.round(fee * 0.1);
        const total = fee + platform;

        setViewingInvoice({
            invoiceNumber: generateInvoiceNumber(reg._id),
            studentName: user?.name,
            studentEmail: user?.email,
            eventTitle: e.title,
            eventDate: e.date,
            venue: e.venue || 'Main Auditorium',
            eventType: e.eventType,
            paymentDate: reg.createdAt || new Date(),
            paymentMethod: 'UPI',
            eventFee: fee,
            platformFee: platform,
            totalFee: total,
            transactionId: reg.ticketCode || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            department: user?.department || 'Student'
        });
    };

    const handleTeamInfo = (e) => {
        const reg = registrations.find(r => r.event?._id === e._id || r.event === e._id);
        if (!reg) {
            alert("No team details found. Please register first.");
            return;
        }
        alert(`Team registration details for "${e.title}":\nRegistration ID: ${reg.ticketCode}\nType: Individual/Team`);
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    const attendedCount = registrations.filter(r => r.status === 'Attended').length;
    const registeredCount = registrations.length;
    const featuredEvents = events.slice(0, 5);

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', background: '#fdfbff', minHeight: '100vh', overflowX: 'hidden' }}>
            <style>{`
                .stat-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 1.25rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-3px); }
                .quick-card { background: #7c3aed; color: #fff; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
                .quick-card:hover { transform: scale(1.03); background: #6d28d9; }
                .action-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 0.5rem; display: flex; alignItems: center; justifyContent: center; margin-bottom: 0.5rem; }
                .hero-util-btn { 
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; 
                    padding: 0.6rem 1.2rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
                }
                .hero-util-btn:hover { background: rgba(255,255,255,0.25); }
                .carousel-container { display: flex; transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>

            {/* 1. FEATURED CAROUSEL SECTION (MOVED TO TOP) */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔥</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e1b4b', margin: 0 }}>Featured & Trending Events</h2>
                    </div>
                    <Link to="/events" style={{ color: '#7c3aed', fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem' }}>View All →</Link>
                </div>

                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1.5rem' }}>
                    <div className="carousel-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {featuredEvents.map((e) => (
                            <div key={e._id} style={{ minWidth: '100%', flexShrink: 0 }}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0e7490 100%)',
                                    padding: '3rem', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: '380px'
                                }}>
                                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                    
                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                        <span style={{ background: '#fff', color: '#1e1b4b', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                            ✓ Completed
                                        </span>
                                        <h3 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1rem', color: '#fff' }}>{e.title}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '2rem' }}>{e.description}</p>
                                        
                                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📅 Sun, 15 Mar</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {e.venue || 'Main Auditorium'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎫 {e.eventType}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <button onClick={() => navigate(`/events/${e._id}`)} style={{ background: '#fff', color: '#7c3aed', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '0.75rem', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>Register Now →</button>
                                            <button onClick={() => handleTeamInfo(e)} className="hero-util-btn">👥 Team</button>
                                            <button onClick={() => setIsChatOpen(true)} className="hero-util-btn">💬 Discuss</button>
                                            <button onClick={() => handlePrintInvoice(e)} className="hero-util-btn">📄 Invoice</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. WELCOME SECTION */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e1b4b', margin: 0 }}>
                    Welcome back, <span style={{ color: '#7c3aed' }}>{user?.name || 'Student'}</span>! 👋
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.4rem' }}>Here's your personalised event hub — all features in one place.</p>
            </div>

            {/* 3. STATS BAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { icon: '📅', label: 'Upcoming Events', value: 0, color: '#3b82f6' },
                    { icon: '🎟️', label: 'Registered Events', value: registeredCount, color: '#ec4899' },
                    { icon: '✅', label: 'Events Attended', value: attendedCount, color: '#10b981' },
                    { icon: '🔴', label: 'Live Right Now', value: 0, color: '#ef4444' }
                ].map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ fontSize: '1.5rem', color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7c3aed' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* 4. QUICK ACTIONS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⚡ Quick Actions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                        <div onClick={() => navigate('/events')} className="quick-card">
                            <div className="action-icon">🔍</div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Browse Events</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Workshops & seminars</div>
                        </div>
                        <div onClick={() => navigate('/my-registrations')} className="quick-card">
                            <div className="action-icon">📋</div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>My Registrations</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Check status & schedule</div>
                        </div>
                        <div onClick={() => navigate('/saved-events')} className="quick-card">
                            <div className="action-icon">📌</div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Saved Events</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Your bookmarked list</div>
                        </div>
                        <div onClick={() => navigate('/profile')} className="quick-card">
                            <div className="action-icon">👤</div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>My Profile</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Update your details</div>
                        </div>
                    </div>
                </div>

                {/* RECENT ACTIVITY CARD */}
                <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e1b4b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📌 Recent Activity</h2>
                    {registrations.length > 0 ? (
                        <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '1.25rem', background: '#fafafa' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem', fontWeight: '600' }}>Last Registered:</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '0.75rem' }}>{registrations[0].event?.title}</div>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>✓ Registered</span>
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', textAlign: 'center' }}>No recent activity</p>
                    )}
                </div>
            </div>

            {/* LIVE DISCUSSION MODAL */}
            {isChatOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsChatOpen(false)}>
                    <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setIsChatOpen(false)}
                            style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
                        >✕</button>
                        <DashboardLiveChat allEvents={events} currentUser={user?.name} />
                    </div>
                </div>
            )}

            {/* INVOICE PREVIEW MODAL */}
            {viewingInvoice && (
                <InvoiceViewer 
                    invoiceData={viewingInvoice} 
                    onClose={() => setViewingInvoice(null)} 
                />
            )}
        </div>
    );
};

export default StudentDashboard;
