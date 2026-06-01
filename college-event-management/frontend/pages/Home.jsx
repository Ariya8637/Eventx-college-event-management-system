import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>

            {/* Hero */}
            <div style={{ padding: '5rem 0 3rem' }}>
                {/* Eyebrow */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
                    borderRadius: '999px', padding: '0.35rem 1.1rem',
                    fontSize: '0.82rem', fontWeight: '700', marginBottom: '1.75rem',
                    letterSpacing: '0.02em',
                }}>
                    🎓 College Event Hub &nbsp;·&nbsp; 2026
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: '900',
                    color: '#1e1b4b', marginBottom: '1.25rem',
                    lineHeight: '1.12', letterSpacing: '-0.03em',
                }}>
                    Discover & Join <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Amazing College Events
                    </span>
                </h1>

                <p style={{
                    fontSize: '1.15rem', color: '#6b7280',
                    maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: '1.75',
                }}>
                    Your one-stop platform for workshops, seminars, hackathons,
                    and cultural fest activities. Register now and never miss out!
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/login" style={{
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: '#fff', textDecoration: 'none', borderRadius: '0.875rem',
                        padding: '1rem 2.25rem', fontWeight: '800', fontSize: '1rem',
                        boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.35)'; }}
                    >
                        🔍 Explore Events
                    </Link>

                    <Link to="/register" style={{
                        background: '#fff', color: '#7c3aed', textDecoration: 'none',
                        borderRadius: '0.875rem', padding: '1rem 2.25rem',
                        fontWeight: '800', fontSize: '1rem',
                        border: '2px solid #c4b5fd',
                        boxShadow: '0 4px 14px rgba(124,58,237,0.1)',
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        transition: 'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        🎓 Student Signup
                    </Link>
                </div>
            </div>

            {/* Feature Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem', marginBottom: '4rem',
            }}>
                {[
                    { icon: '📅', title: 'Browse Events', desc: 'Explore all workshops, seminars, and cultural events in one place', color: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed' },
                    { icon: '🎟️', title: 'Easy Registration', desc: 'Register individually or as a team with just a few clicks', color: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
                    { icon: '📄', title: 'Digital Invoice', desc: 'Get an instant receipt after every successful registration', color: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
                    { icon: '🔴', title: 'Live Status', desc: 'Track event status in real-time — upcoming, ongoing, or done', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
                ].map(f => (
                    <div key={f.title} style={{
                        background: f.color, border: `1px solid ${f.border}`,
                        borderRadius: '1rem', padding: '1.5rem', textAlign: 'left',
                        transition: 'transform 0.25s, box-shadow 0.25s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                        <h4 style={{ margin: '0 0 0.4rem', color: f.text, fontWeight: '800', fontSize: '0.95rem' }}>{f.title}</h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.55' }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Login prompt banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #0e7490 100%)',
                borderRadius: '1.5rem', padding: '2.5rem',
                marginBottom: '4rem', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <h2 style={{ color: '#fff', margin: '0 0 0.75rem', fontSize: '1.6rem', fontWeight: '900', position: 'relative' }}>
                    Ready to get started?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 1.75rem', fontSize: '1rem', lineHeight: '1.6', position: 'relative' }}>
                    Login or create an account to access your personalised dashboard, register for events, and track your activity.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                    <Link to="/login" style={{
                        background: '#fff', color: '#7c3aed', textDecoration: 'none',
                        borderRadius: '0.75rem', padding: '0.875rem 2rem',
                        fontWeight: '800', fontSize: '0.95rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }}>
                        Login →
                    </Link>
                    <Link to="/register" style={{
                        background: 'rgba(255,255,255,0.12)', color: '#fff',
                        textDecoration: 'none', borderRadius: '0.75rem',
                        padding: '0.875rem 2rem', fontWeight: '800', fontSize: '0.95rem',
                        border: '1px solid rgba(255,255,255,0.25)',
                    }}>
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
