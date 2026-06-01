import React, { useState, useEffect } from 'react';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';

/**
 * FEATURE: Student Activity Profile & Gamification
 * - Professional Dashboard UI
 * - Points & Badges (Gamification)
 * - Activity Tracking (Timeline & Analytics)
 * - Certificates Section (View/Download)
 */

const Profile = () => {
    const { user, login } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', department: '' });

    useEffect(() => {
        const loadAllData = async () => {
            if (!user) return;
            try {
                const regsRes = await dataService.getMyRegistrations();
                const regs = regsRes.data || [];
                setRegistrations(regs);

                // Calculate Points: +10 per registration, +20 per attendance
                const points = (regs.length * 10) + (regs.filter(r => r.status === 'Attended').length * 20);
                setTotalPoints(points);
                setFormData({ name: user.name, department: user.department || '' });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [user]);

    // ─── PRINT HANDLERS ────────────────────────────────────────────────────
    const handlePrintCertificate = (c) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Certificate - ${c.event.title}</title>
                <style>
                    body { font-family: 'Georgia', serif; text-align: center; color: #1e1b4b; background: #f8fafc; margin: 0; padding: 2rem; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    .cert-container { background: #fff; width: 100%; max-width: 800px; padding: 3rem; border: 15px solid #7c3aed; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border-radius: 1rem; position: relative; }
                    .hero-title { font-size: 3rem; color: #6d28d9; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 2px; }
                    .sub-title { font-size: 1.2rem; color: #64748b; margin-bottom: 2rem; letter-spacing: 4px; text-transform: uppercase; }
                    .student-name { font-size: 2.5rem; color: #1e293b; font-weight: bold; margin: 1.5rem 0; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 0 2rem 0.5rem; }
                    .event-title { font-size: 1.8rem; color: #7c3aed; font-weight: bold; margin: 1.5rem 0; }
                    .footer-row { display: flex; justify-content: space-between; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
                    .signature { text-align: center; width: 200px; }
                    @media print { body { background: #fff; padding: 0; display: block; } .cert-container { border-width: 10px; box-shadow: none; max-width: none; width: 100%; box-sizing: border-box; margin: auto; } }
                </style>
            </head>
            <body>
                <div class="cert-container">
                    <div class="hero-title">Certificate of Attendance</div>
                    <div class="sub-title">This is proudly presented to</div>
                    <div class="student-name">${user?.name || 'Student'}</div>
                    <p style="font-size: 1.2rem; color: #475569; margin: 1.5rem 0; font-family: 'Arial', sans-serif;">
                        For successfully participating and attending the event
                    </p>
                    <div class="event-title">${c.event.title}</div>
                    <p style="font-size: 1.1rem; color: #64748b; font-family: 'Arial', sans-serif;">
                        Held on ${new Date(c.event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div class="footer-row">
                        <div class="signature">
                            <div style="border-top: 2px solid #1e293b; padding-top: 0.5rem; font-size: 1.1rem; font-family: 'Arial';">${c.event.department || 'Event'} Coordinator</div>
                        </div>
                        <div style="align-self: center; font-size: 3rem;">🎓</div>
                        <div class="signature">
                            <div style="border-top: 2px solid #1e293b; padding-top: 0.5rem; font-size: 1.1rem; font-family: 'Arial';">Institution Head</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const handleViewCertificate = (reg) => {
        const customCert = localStorage.getItem('custom_cert_' + reg._id);
        if (customCert) {
            const w = window.open("");
            w.document.write(`<iframe src="${customCert}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else {
            handlePrintCertificate(reg);
        }
    };

    const handleDownloadCertificate = (reg) => {
        const customCert = localStorage.getItem('custom_cert_' + reg._id);
        if (customCert) {
            const a = document.createElement('a');
            a.href = customCert;
            a.download = `Certificate_${reg.event.title.replace(/\s+/g, '_')}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            handlePrintCertificate(reg);
        }
    };

    const handlePrintInvoice = (reg) => {
        const e = reg.event;
        if (!e) return;
        const invNo = `INV-${new Date().getFullYear()}-${(reg._id || 'XXX').slice(-6).toUpperCase()}`;
        const fee = e.fee || 200;
        const platform = Math.round(fee * 0.1);
        const total = fee + platform;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${invNo}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; color: #1e1b4b; margin: 0; padding: 2rem; }
                    .header { background: linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; padding:2rem; border-radius:0.75rem 0.75rem 0 0; }
                    .body { padding: 2rem; background: #fff; }
                    .row { display:flex; justify-content:space-between; padding:0.6rem 0; border-bottom:1px dashed #e5e7eb; font-size:0.95rem; }
                    .total-row { display:flex; justify-content:space-between; padding:1rem 0; font-size:1.2rem; font-weight:800; color:#7c3aed; }
                    .footer { background:#f5f3ff; padding:1.5rem; text-align:center; font-size:0.85rem; color:#6b7280; margin-top:1rem; border-radius:0 0 0.75rem 0.75rem; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 0.75rem;">
                    <div class="header">
                        <h2 style="margin:0">🎓 College Event Hub</h2>
                        <p style="margin:0.25rem 0 0;opacity:0.8">Official Payment Invoice</p>
                    </div>
                    <div class="body">
                        <div style="display:flex;justify-content:space-between;margin-bottom:2rem;padding-top:1rem">
                            <div><strong>Invoice No:</strong> ${invNo}<br/><strong>Date:</strong> ${new Date(reg.createdAt).toLocaleDateString('en-IN')}</div>
                            <div style="text-align:right"><strong>Status:</strong> <span style="color:green">✅ PAID</span></div>
                        </div>
                        <h4 style="margin:0 0 1rem;color:#7c3aed;border-bottom:2px solid #ede9fe;padding-bottom:0.5rem">Billed To</h4>
                        <div class="row"><span>Name</span><strong>${user?.name}</strong></div>
                        <div class="row"><span>Email</span><strong>${user?.email}</strong></div>
                        <h4 style="margin:1.5rem 0 1rem;color:#7c3aed;border-bottom:2px solid #ede9fe;padding-bottom:0.5rem">Event Details</h4>
                        <div class="row"><span>Event</span><strong>${e.title}</strong></div>
                        <div class="total-row"><span>Total Paid</span><span>₹${total}</span></div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await dataService.updateProfile(formData);
            login({ ...user, ...formData }, localStorage.getItem('token'));
            setIsEditing(false);
            alert('Profile updated!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your profile...</div>;

    const attendedRegs = registrations.filter(r => r.status === 'Attended').length;
    const certificates = registrations.filter(r => r.status === 'Attended');
    const upcomingRegs = registrations.length - attendedRegs;
    const totalRegs = registrations.length;
    const progressPercent = totalRegs > 0 ? Math.round((attendedRegs / totalRegs) * 100) : 0;
    const level = Math.floor(totalPoints / 100) + 1;

    const badges = [
        { label: 'Active Participant', icon: '🔥', minPoints: 50, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Event Pro', icon: '💎', minPoints: 150, color: '#7c3aed', bg: '#f5f3ff' },
        { label: 'Top Attendee', icon: '🏆', minPoints: 300, color: '#10b981', bg: '#f0fdf4' },
    ];
    const activeBadges = badges.filter(b => totalPoints >= b.minPoints);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <style>{`
                @keyframes dashFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes statusPulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
            `}</style>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* ─── 1. PROFILE HEADER CARD ─────────────────────────────── */}
                <div style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: '800', flexShrink: 0 }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#1e1b4b' }}>{user?.name}</h2>
                            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</p>
                            <span style={S.badge('#7c3aed', '#f5f3ff')}>{user?.department || 'Student'}</span>
                        </div>
                    </div>
                    
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={S.editBtn}>Edit Profile Details</button>
                    ) : (
                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" style={S.input} />
                            <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Department" style={S.input} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={S.saveBtn}>Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} style={S.editBtn}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ─── 2. GAMIFICATION & ACHIEVEMENTS ───────────────────────────── */}
                <div style={{ ...S.card, background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff', border: 'none' }}>
                    <div style={{ ...S.header, color: '#fff' }}>🏆 Achievements & Level</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #818cf8', boxShadow: '0 0 25px rgba(129,140,248,0.4)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: 1 }}>{totalPoints}</div>
                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginTop: '4px' }}>Points</div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', color: '#e0e7ff' }}>
                                <span>Level {level}</span>
                                <span>Next: {(level*100)} pts</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, (totalPoints / (level*100)) * 100)}%`, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '999px' }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {activeBadges.map((b, i) => (
                            <span key={i} style={S.badge(b.color, b.bg)}>{b.icon} {b.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── 3. ACTIVITY ANALYTICS ────────────────────────────────────────── */}
            <div style={S.card}>
                <div style={S.header}>📊 Activity Analytics</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={S.metricBox}>{totalRegs}<div style={{fontSize: '0.75rem', color: '#94a3b8'}}>Registered</div></div>
                    <div style={S.metricBox}>{attendedRegs}<div style={{fontSize: '0.75rem', color: '#34d399'}}>Attended</div></div>
                    <div style={S.metricBox}>{upcomingRegs}<div style={{fontSize: '0.75rem', color: '#a78bfa'}}>Upcoming</div></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                    <span>Completion Progress</span>
                    <span>{progressPercent}%</span>
                </div>
                <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: '#10b981', borderRadius: '999px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                {/* ─── 4. TIMELINE ──────────────────────────────────────── */}
                <div style={S.card}>
                    <div style={S.header}>⏳ Recent Activity</div>
                    <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '6px', marginTop: '1rem' }}>
                        {registrations.slice(0, 8).map((reg, idx) => (
                            <div key={idx} style={S.timelineContent}>
                                <div style={S.timelineDot} />
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{reg.event?.title}</div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                    <span style={S.badge('#475569', '#f1f5f9')}>{reg.ticketCode}</span>
                                    <button onClick={() => handlePrintInvoice(reg)} style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', color: '#475569', cursor: 'pointer' }}>📄 Invoice</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── 5. CERTIFICATES ───────────────────────────────────── */}
                <div style={S.card}>
                    <div style={S.header}>📜 Earned Certificates</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {certificates.length === 0 ? <p style={{color:'#64748b'}}>Attend events to earn certificates!</p> :
                        certificates.map(c => (
                            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', background: '#f8fafc' }}>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{c.event.title}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {localStorage.getItem('custom_cert_' + c._id) && <span style={{ fontSize: '0.7rem', color: '#10b981' }}>⭐ Custom</span>}
                                    <button onClick={() => handleViewCertificate(c)} style={S.utilBtn}>View</button>
                                    <button onClick={() => handleDownloadCertificate(c)} style={S.accentBtn}>↓ Print</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const S = {
    card: { background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', animation: 'dashFadeIn 0.4s ease both' },
    header: { fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' },
    badge: (color, bg) => ({ background: bg, color: color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center' }),
    input: { padding: '0.8rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#fafafa', outline: 'none' },
    saveBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '700' },
    editBtn: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '700' },
    accentBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' },
    utilBtn: { background: '#fff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' },
    metricBox: { flex: 1, padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '1rem', textAlign: 'center', fontSize: '1.8rem', fontWeight: '900', color: '#1e1b4b' },
    timelineContent: { paddingLeft: '1.5rem', marginBottom: '1.5rem', position: 'relative' },
    timelineDot: { position: 'absolute', left: '-7px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed', border: '3px solid #fff' }
};

export default Profile;
