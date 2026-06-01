import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EventCard = ({ event, onRegister, isRegistered, onBookmark, isBookmarked, onViewInvoice }) => {
    const navigate = useNavigate();
    
    // ─── FUNCTIONAL HANDLERS ──────────────────────────────────────────────
    const handleInvoiceClick = (e) => {
        if (!isRegistered) {
            alert("You need to register for this event first to view the invoice.");
            return;
        }
        if (onViewInvoice) {
            onViewInvoice(event);
        }
    };


    const handleTeamInfo = () => {
        if (!isRegistered) {
            alert("Please register for this event to view team details.");
            return;
        }
        alert(`Team registration details for "${event.title}":\nRegistration Status: Active\nType: Individual/Team`);
    };

    return (
        <div style={{ 
            background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
            border: '1px solid #f1f5f9', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default', minWidth: '300px'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                <span style={{ 
                    background: '#f8fafc', color: '#64748b', padding: '0.4rem 1rem', 
                    borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #e2e8f0' 
                }}>
                    ● {isRegistered ? '✓ Registered' : 'Upcoming'}
                </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e1b4b', marginBottom: '1rem', margin: 0 }}>
                {event.title}
            </h3>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📍 {event.venue && event.venue.length > 20 ? event.venue.substring(0,20)+'...' : event.venue || 'Main Auditorium'}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                <button 
                    onClick={() => navigate(`/events/${event._id}`)}
                    style={{ 
                        background: '#7c3aed', color: '#fff', border: 'none', 
                        padding: '0.75rem 0', borderRadius: '1rem', fontWeight: '800', 
                        fontSize: '1rem', cursor: 'pointer', flex: 1, 
                        boxShadow: '0 10px 20px rgba(124,58,237,0.2)'
                    }}
                >
                    {isRegistered ? 'Details' : 'Register'}
                </button>
                
                <button onClick={handleTeamInfo} title="Team View" style={{ width: '45px', height: '45px', borderRadius: '0.75rem', background: '#f5f3ff', border: '1px solid #ede9fe', color: '#7c3aed', fontSize: '1.2rem', cursor: 'pointer' }}>👥</button>
                <button onClick={() => navigate(`/events/${event._id}`)} title="Chat" style={{ width: '45px', height: '45px', borderRadius: '0.75rem', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#10b981', fontSize: '1.2rem', cursor: 'pointer' }}>💬</button>
                <button onClick={handleInvoiceClick} title="Invoice" style={{ width: '45px', height: '45px', borderRadius: '0.75rem', background: '#fffbeb', border: '1px solid #fef3c7', color: '#d97706', fontSize: '1.2rem', cursor: 'pointer' }}>📄</button>
            </div>
        </div>
    );
};

export default EventCard;
