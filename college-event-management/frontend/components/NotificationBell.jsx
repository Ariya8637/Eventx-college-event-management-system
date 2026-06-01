import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/data.service';

const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const listRef = useRef();

    useEffect(() => {
        if (!userId) return;

        const loadNotifications = async () => {
            try {
                // Fetch registered events
                const res = await dataService.getMyRegistrations();
                const regs = res.data || [];
                
                // Get dismissed notifications from localStorage so they don't reappear
                const dimissedKey = `dismissed_notifs_${userId}`;
                const dismissed = JSON.parse(localStorage.getItem(dimissedKey) || '[]');

                let generatedNotifs = [];

                const today = new Date();
                today.setHours(0,0,0,0);

                regs.forEach(reg => {
                    const e = reg.event;
                    if (!e || reg.status === 'Attended') return;

                    const eventDate = new Date(e.date);
                    eventDate.setHours(0,0,0,0);
                    
                    const timeDiff = eventDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    let message = null;
                    let type = null;
                    let notifId = `${reg._id}_`;

                    if (daysDiff < 0) {
                        // Event is clearly in the past but not marked attended, skip checking here
                        return;
                    } else if (daysDiff === 0) {
                        message = `TODAY is the day! "${e.title}" is happening today! Make sure you attend.`;
                        type = 'urgent';
                        notifId += '0';
                    } else if (daysDiff <= 3) {
                        message = `Get ready! "${e.title}" is coming up in ${daysDiff} days.`;
                        type = 'warning';
                        notifId += '3';
                    } else if (daysDiff <= 7) {
                        message = `Reminder: You have "${e.title}" next week (starts in ${daysDiff} days).`;
                        type = 'info';
                        notifId += '7';
                    }

                    if (message && !dismissed.includes(notifId)) {
                        generatedNotifs.push({
                            id: notifId,
                            eventId: e._id,
                            message,
                            type,
                            dateStr: new Date(e.date).toLocaleDateString()
                        });
                    }
                });

                setNotifications(generatedNotifs);
                setUnreadCount(generatedNotifs.length);

            } catch (err) {
                console.error("Failed fetching registrations for notifications", err);
            }
        };

        loadNotifications();
        
        const handleClickOutside = (e) => {
            if (listRef.current && !listRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, [userId]);

    const handleDismiss = (notifId, e) => {
        if(e) e.stopPropagation();
        
        // Remove from local display
        const updated = notifications.filter(n => n.id !== notifId);
        setNotifications(updated);
        setUnreadCount(updated.length);

        // Save to dismissed to prevent showing again
        const dimissedKey = `dismissed_notifs_${userId}`;
        const currentDismissed = JSON.parse(localStorage.getItem(dimissedKey) || '[]');
        currentDismissed.push(notifId);
        localStorage.setItem(dimissedKey, JSON.stringify(currentDismissed));
    };

    const handleDismissAll = () => {
        notifications.forEach(n => handleDismiss(n.id));
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'urgent': return { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', icon: '🔴' };
            case 'warning': return { bg: '#fef3c7', border: '#fde68a', text: '#b45309', icon: '⚡' };
            default: return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '📅' };
        }
    };

    return (
        <div ref={listRef} style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'transparent', border: 'none', position: 'relative', cursor: 'pointer', fontSize: '1.4rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(239,68,68,0.4)' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '360px', background: '#fff', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden', animation: 'dashFadeIn 0.2s ease' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '800' }}>Notifications</h4>
                        {notifications.length > 0 && (
                            <button onClick={handleDismissAll} style={{ background: 'transparent', border: 'none', color: '#7c3aed', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Dismiss All</button>
                        )}
                    </div>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>🔕</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>You're all caught up!</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>No upcoming events in the near future.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {notifications.map(n => {
                                    const style = getTypeColor(n.type);
                                    return (
                                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', position: 'relative', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: `1px solid ${style.border}` }}>
                                                {style.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 0.35rem', color: '#1e293b', fontSize: '0.85rem', lineHeight: '1.4', fontWeight: '600' }}>{n.message}</p>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>Event Date: {n.dateStr}</div>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDismiss(n.id, e)}
                                                style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', alignSelf: 'flex-start', transition: 'color 0.2s' }}
                                                onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                                                onMouseLeave={e=>e.currentTarget.style.color='#cbd5e1'}
                                                title="Dismiss"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
