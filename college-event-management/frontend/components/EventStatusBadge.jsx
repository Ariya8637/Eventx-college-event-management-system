import React, { useEffect, useState } from 'react';

/**
 * Feature 1: Live Event Status System
 * Computes real-time status from event date/duration.
 * No backend changes needed — pure frontend logic.
 */
export const getEventStatus = (eventDate, durationHours = 3) => {
    const now = new Date();
    const start = new Date(eventDate);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
};

const STATUS_CONFIG = {
    upcoming: {
        label: '🕐 Upcoming',
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
        dot: '#3b82f6',
        pulse: true,
    },
    ongoing: {
        label: '🟢 Live Now',
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
        dot: '#22c55e',
        pulse: true,
    },
    completed: {
        label: '✔ Completed',
        bg: '#f9fafb',
        color: '#6b7280',
        border: '#e5e7eb',
        dot: '#9ca3af',
        pulse: false,
    },
};

const EventStatusBadge = ({ eventDate, durationHours = 3, size = 'md' }) => {
    const [status, setStatus] = useState(getEventStatus(eventDate, durationHours));

    // Refresh every minute so "Ongoing" updates in real-time
    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(getEventStatus(eventDate, durationHours));
        }, 60000);
        return () => clearInterval(interval);
    }, [eventDate, durationHours]);

    const config = STATUS_CONFIG[status];
    const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.95rem' : '0.8rem';
    const padding = size === 'sm' ? '0.25rem 0.6rem' : size === 'lg' ? '0.5rem 1.2rem' : '0.35rem 0.9rem';

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.border}`,
                borderRadius: '999px',
                padding,
                fontSize,
                fontWeight: '700',
                letterSpacing: '0.02em',
                userSelect: 'none',
            }}
        >
            <span
                style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: config.dot,
                    display: 'inline-block',
                    animation: config.pulse ? 'statusPulse 1.8s ease-in-out infinite' : 'none',
                }}
            />
            {config.label}
            <style>{`
                @keyframes statusPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.4); }
                }
            `}</style>
        </span>
    );
};

export default EventStatusBadge;
