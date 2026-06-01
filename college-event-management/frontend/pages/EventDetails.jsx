import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';

// ── Feature Imports (modular — no backend change) ──────────────────────────
import EventStatusBadge from '../components/EventStatusBadge';
import TeamRegistrationModal from '../components/TeamRegistrationModal';
import EventDiscussionForum from '../components/EventDiscussionForum';
import { EventTagBadges } from '../components/EventPromotion';
import { usePaymentFlow, generateInvoiceNumber } from '../components/PaymentInvoice';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Feature 2 state
    const [showTeamModal, setShowTeamModal] = useState(false);

    // Feature 5 payment method selection
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            const res = await dataService.getEventById(id);
            setEvent(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Original register handler (unchanged) ───────────────────────────────
    const handleRegister = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            await dataService.registerForEvent(id);
            alert('Registered Successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    const eventFee = Number(event?.fee) || 0;
    const platformFee = eventFee > 0 ? 20 : 0;
    const totalFee = eventFee + platformFee;

    // Feature 5 invoice data builder
    const invoiceData = {
        invoiceNumber: generateInvoiceNumber(id),
        studentName: user?.name || 'Student',
        studentEmail: user?.email || '',
        department: user?.department,
        eventTitle: event?.title || '',
        eventDate: event?.date || new Date().toISOString(),
        eventType: event?.eventType || '',
        venue: event?.venue || '',
        paymentDate: new Date().toISOString(),
        paymentMethod,
        eventFee,
        platformFee,
        totalFee,
        transactionId: `TXN${Date.now().toString().slice(-10)}`,
    };

    // Feature 5 payment flow
    const { initiatePayment, PaymentUI } = usePaymentFlow(invoiceData, () => navigate('/my-registrations'));

    if (!event) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: '500' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> Loading Event...
            </div>
        </div>
    );

    const handlePayAndRegister = async () => {
        if (!user) { navigate('/login'); return; }
        setPaying(true);
        try {
            // Call original register API first
            await dataService.registerForEvent(id);
            // Then show payment success + invoice UI
            await initiatePayment();
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '900px', animation: 'fadeIn 0.5s ease-out' }}>

            {/* Feature 5 — Payment UI (modals rendered here via hook) */}
            <PaymentUI />

            {/* Feature 2 — Team Registration Modal */}
            {showTeamModal && (
                <TeamRegistrationModal
                    event={event}
                    user={user}
                    onClose={() => setShowTeamModal(false)}
                    onSuccess={() => setTimeout(() => setShowTeamModal(false), 2000)}
                />
            )}

            <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-color)', fontSize: '2rem' }}>
                Complete Registration
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* ── 1. Event Details Card ─────────────────────────────────────── */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255,255,255,0.7)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <i className="fas fa-calendar-check" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i> Event Details
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            {/* Feature 1 + 4 badges */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                                <span className="badge badge-success">{event.eventType}</span>
                                <EventTagBadges event={event} />
                                <EventStatusBadge eventDate={event.date} size="md" />
                            </div>
                            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0', fontSize: '1.6rem' }}>{event.title}</h2>
                        </div>
                        <div style={{ textAlign: 'right', background: 'var(--primary-light)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', color: 'var(--primary-hover)', fontWeight: '700', fontSize: '1.2rem' }}>
                            {eventFee === 0 ? 'FREE' : `₹${eventFee}`}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0', color: 'var(--text-light)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <i className="fas fa-clock" style={{ color: 'var(--primary-color)', marginTop: '0.3rem' }}></i>
                            <div>
                                <strong style={{ color: 'var(--text-color)', display: 'block' }}>Date & Time</strong>
                                <span>{new Date(event.date).toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-color)', marginTop: '0.3rem' }}></i>
                            <div>
                                <strong style={{ color: 'var(--text-color)', display: 'block' }}>Venue</strong>
                                <span>{event.venue}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <i className="fas fa-user-tie" style={{ color: 'var(--primary-color)', marginTop: '0.3rem' }}></i>
                            <div>
                                <strong style={{ color: 'var(--text-color)', display: 'block' }}>Organizer</strong>
                                <span>{event.organizer?.name || 'College Admin'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-color)' }}>
                        <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '0.5rem' }}>About Event</strong>
                        <p style={{ margin: 0, color: 'var(--text-light)', lineHeight: '1.7' }}>{event.description}</p>
                    </div>
                </div>

                {/* ── 2. Student Details Summary Card (unchanged) ───────────────── */}
                {user && (
                    <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255,255,255,0.7)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <i className="fas fa-user-graduate" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i> Student Summary
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</label>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '500', marginTop: '0.2rem' }}>{user.name}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Email</label>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '500', marginTop: '0.2rem' }}>{user.email}</div>
                            </div>
                            {user.department && (
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Department</label>
                                    <div style={{ fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '500', marginTop: '0.2rem' }}>{user.department}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── 3. Payment Section Card (enhanced with Feature 5) ─────────── */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--primary-light)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <i className="fas fa-wallet" style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}></i> Payment & Checkout
                    </h3>

                    {/* Payment method selection (unchanged UI) */}
                    <div style={{ marginBottom: '2rem' }}>
                        <strong style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-color)' }}>Select Payment Method</strong>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                                { key: 'upi', icon: 'fas fa-qrcode', label: 'UPI' },
                                { key: 'card', icon: 'fas fa-credit-card', label: 'Card' },
                                { key: 'netbanking', icon: 'fas fa-university', label: 'Net Banking' },
                            ].map(m => (
                                <div
                                    key={m.key}
                                    onClick={() => setPaymentMethod(m.key)}
                                    style={{
                                        border: paymentMethod === m.key ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        background: paymentMethod === m.key ? 'var(--primary-light)' : '#fff',
                                        borderRadius: 'var(--radius-md)', padding: '1rem',
                                        textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)',
                                    }}
                                >
                                    <i className={m.icon} style={{ fontSize: '1.5rem', color: paymentMethod === m.key ? 'var(--primary-color)' : 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}></i>
                                    <div style={{ fontWeight: '500', color: paymentMethod === m.key ? 'var(--primary-color)' : 'var(--text-color)' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fee breakdown */}
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-light)' }}>
                            <span>Event Registration Fee</span><span>₹{eventFee}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-light)' }}>
                            <span>Platform Fee</span><span>₹{platformFee}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', color: 'var(--text-color)', fontWeight: '700', fontSize: '1.2rem' }}>
                            <span>Total Amount</span>
                            <span style={{ color: 'var(--primary-color)' }}>₹{totalFee}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Individual Register (Feature 5 enhanced) */}
                        <button
                            onClick={handlePayAndRegister}
                            disabled={paying}
                            className="btn-primary"
                            style={{ flex: 2, padding: '1.2rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', minWidth: '200px', opacity: paying ? 0.7 : 1, cursor: paying ? 'not-allowed' : 'pointer' }}
                        >
                            {paying
                                ? <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                                : <><i className="fas fa-lock"></i> Pay ₹{totalFee} & Register</>
                            }
                        </button>

                        {/* Feature 2 — Team Registration trigger */}
                        <button
                            onClick={() => { if (!user) { navigate('/login'); return; } setShowTeamModal(true); }}
                            style={{
                                flex: 1, padding: '1.2rem', fontSize: '1rem',
                                background: '#f5f3ff', color: '#7c3aed',
                                border: '2px solid #c4b5fd', borderRadius: 'var(--radius-md)',
                                cursor: 'pointer', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.2s', minWidth: '160px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                        >
                            👥 Team Register
                        </button>
                    </div>

                    {!user && (
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--danger)', marginTop: '1rem' }}>
                            <i className="fas fa-exclamation-circle"></i> You will be redirected to login first.
                        </p>
                    )}
                </div>

                {/* ── Feature 3 — Discussion Forum ─────────────────────────────── */}
                <EventDiscussionForum
                    eventId={id}
                    currentUser={user?.name || 'Anonymous'}
                />

            </div>
        </div>
    );
};

export default EventDetails;
