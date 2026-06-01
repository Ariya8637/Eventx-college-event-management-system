import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventStatusBadge from './EventStatusBadge';

/**
 * Feature 4: Event Promotion System
 * - Computes tags (Trending, New, Limited Seats, Featured) from event data.
 * - FeaturedEventsSection: Banner for Homepage.
 * - PromoEventCard: Rich card with all promo tags.
 */

// ─── Tag Computation (frontend only) ──────────────────────────────────────
export const computeEventTags = (event) => {
    const tags = [];
    const now = new Date();
    const eventDate = new Date(event.date);
    const createdDaysAgo = (now - new Date(event.createdAt || eventDate)) / (1000 * 60 * 60 * 24);
    const seatsLeft = (event.maxParticipants || 100) - (event.registrations || 0);

    if (createdDaysAgo <= 3) tags.push('new');
    if ((event.registrations || 0) > 15) tags.push('trending');
    if (seatsLeft > 0 && seatsLeft <= 10) tags.push('limited');
    if (event.featured) tags.push('featured');

    return tags;
};

const TAG_CONFIG = {
    trending: { label: '🔥 Trending', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    new: { label: '✨ New', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    limited: { label: '⚡ Limited Seats', bg: '#fef9c3', color: '#92400e', border: '#fde68a' },
    featured: { label: '⭐ Featured', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
};

export const EventTagBadges = ({ event, inline = false }) => {
    const tags = computeEventTags(event);
    if (tags.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', ...(inline ? { display: 'inline-flex' } : {}) }}>
            {tags.map(tag => {
                const cfg = TAG_CONFIG[tag];
                return (
                    <span key={tag} style={{
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        borderRadius: '999px', padding: '0.2rem 0.65rem',
                        fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.01em',
                    }}>
                        {cfg.label}
                    </span>
                );
            })}
        </div>
    );
};

// ─── Rich Promo Event Card ─────────────────────────────────────────────────
export const PromoEventCard = ({ event, onRegister, isBookmarked, onBookmark }) => {
    const tags = computeEventTags(event);
    const isFeatured = tags.includes('featured') || tags.includes('trending');
    const seatsLeft = (event.maxParticipants || 100) - (event.registrations || 0);

    return (
        <div style={{
            background: '#fff',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: isFeatured ? '0 8px 30px rgba(124,58,237,0.15)' : '0 4px 16px rgba(0,0,0,0.07)',
            border: isFeatured ? '2px solid rgba(124,58,237,0.25)' : '1px solid #f3f4f6',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(124,58,237,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isFeatured ? '0 8px 30px rgba(124,58,237,0.15)' : '0 4px 16px rgba(0,0,0,0.07)'; }}
        >
            {/* Color accent top strip */}
            <div style={{
                height: '5px',
                background: isFeatured
                    ? 'linear-gradient(90deg, #7c3aed, #06b6d4)'
                    : 'linear-gradient(90deg, #e5e7eb, #d1d5db)',
            }} />

            {/* Bookmark button */}
            <button
                onClick={() => onBookmark && onBookmark(event._id)}
                style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: isBookmarked ? '#fff0f0' : '#fff',
                    border: `1px solid ${isBookmarked ? '#fca5a5' : '#e5e7eb'}`,
                    borderRadius: '50%', width: '34px', height: '34px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1rem', zIndex: 2,
                    color: isBookmarked ? '#ef4444' : '#9ca3af',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}
            >
                {isBookmarked ? '♥' : '♡'}
            </button>

            {/* Card Body */}
            <div style={{ padding: '1.5rem' }}>
                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {tags.map(tag => {
                        const cfg = TAG_CONFIG[tag];
                        return (
                            <span key={tag} style={{
                                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                borderRadius: '999px', padding: '0.18rem 0.6rem',
                                fontSize: '0.72rem', fontWeight: '700',
                            }}>
                                {cfg.label}
                            </span>
                        );
                    })}
                    <EventStatusBadge eventDate={event.date} size="sm" />
                </div>

                <h3 style={{ margin: '0 0 0.6rem', color: '#1e1b4b', fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.3', paddingRight: '2rem' }}>
                    {event.title}
                </h3>

                <p style={{ color: '#6b7280', fontSize: '0.87rem', margin: '0 0 1rem', lineHeight: '1.55' }}>
                    {(event.description || '').substring(0, 90)}...
                </p>

                {/* Meta Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        📅 {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        📍 {event.venue || 'TBD'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                        🎫 {event.eventType || 'Event'}
                    </div>
                    {event.maxParticipants && (
                        <div style={{ fontSize: '0.82rem', color: seatsLeft <= 10 ? '#c2410c' : '#6b7280', fontWeight: seatsLeft <= 10 ? '700' : '400' }}>
                            💺 {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Full'}
                        </div>
                    )}
                </div>

                {/* Popularity bar */}
                {(event.registrations || 0) > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.3rem' }}>
                            <span>Registrations</span>
                            <span>{event.registrations || 0} / {event.maxParticipants || 100}</span>
                        </div>
                        <div style={{ height: '5px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(100, ((event.registrations || 0) / (event.maxParticipants || 100)) * 100)}%`,
                                background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                                borderRadius: '999px',
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                    </div>
                )}

                <Link
                    to={`/events/${event._id}`}
                    style={{
                        display: 'block', textAlign: 'center', textDecoration: 'none',
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: '#fff', borderRadius: '0.6rem', padding: '0.7rem',
                        fontWeight: '700', fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    View & Register →
                </Link>
            </div>
        </div>
    );
};

// ─── Featured Events Banner Section (for Homepage) ─────────────────────────
const MOCK_FEATURED = [
    {
        _id: 'feat1', title: 'National Hackathon 2026', eventType: 'Workshop',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Main Auditorium', description: 'A 24-hour coding marathon where teams compete to solve real-world problems using cutting-edge technology. Prizes worth ₹1,00,000!',
        registrations: 47, maxParticipants: 60, featured: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: 'feat2', title: 'AI & ML Summit 2026', eventType: 'Seminar',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Seminar Hall B', description: 'Industry experts from Google, Microsoft and ISRO share insights on the future of AI, large language models and autonomous systems.',
        registrations: 20, maxParticipants: 80, featured: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: 'feat3', title: 'Freshers Cultural Night', eventType: 'Cultural',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Open Air Theatre', description: 'Welcome the newest batch with live performances, DJ night, dance competitions and talent showcases by senior students.',
        registrations: 98, maxParticipants: 100, featured: true,
        createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const FeaturedEventsSection = ({ events }) => {
    const featuredEvents = (events && events.length > 0)
        ? events.filter(e => computeEventTags(e).length > 0).slice(0, 3)
        : MOCK_FEATURED;

    const heroEvent = featuredEvents[0];
    const rest = featuredEvents.slice(1);

    return (
        <section style={{ marginBottom: '4rem' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.7rem', fontWeight: '800' }}>
                        🔥 Featured & Trending
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
                        Don't miss out on the most popular events on campus
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Hero Banner */}
                {heroEvent && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #0e7490 100%)',
                        borderRadius: '1.25rem',
                        padding: '2.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(124,58,237,0.25)',
                    }}>
                        {/* Decorative circles */}
                        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {computeEventTags(heroEvent).map(tag => {
                                    const cfg = TAG_CONFIG[tag];
                                    return (
                                        <span key={tag} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                                            {cfg.label}
                                        </span>
                                    );
                                })}
                                <EventStatusBadge eventDate={heroEvent.date} size="sm" />
                            </div>
                            <h2 style={{ margin: '0 0 0.75rem', color: '#fff', fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.2' }}>
                                {heroEvent.title}
                            </h2>
                            <p style={{ margin: '0 0 1.5rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', maxWidth: '550px', fontSize: '0.95rem' }}>
                                {(heroEvent.description || '').substring(0, 150)}...
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    📅 {new Date(heroEvent.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    📍 {heroEvent.venue}
                                </span>
                            </div>
                            {heroEvent.maxParticipants && (
                                <div style={{ marginBottom: '2rem', maxWidth: '320px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                                        <span>Filling fast!</span>
                                        <span>{heroEvent.registrations}/{heroEvent.maxParticipants} registered</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(heroEvent.registrations / heroEvent.maxParticipants) * 100}%`,
                                            background: 'linear-gradient(90deg, #a78bfa, #38bdf8)',
                                            borderRadius: '999px',
                                        }} />
                                    </div>
                                </div>
                            )}
                            <Link to={`/events/${heroEvent._id}`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                background: '#fff', color: '#7c3aed', textDecoration: 'none',
                                borderRadius: '0.75rem', padding: '0.85rem 2rem',
                                fontWeight: '800', fontSize: '0.95rem',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Register Now ⟶
                            </Link>
                        </div>
                    </div>
                )}

                {/* Side Cards */}
                {rest.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {rest.map(event => (
                            <PromoEventCard key={event._id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedEventsSection;
