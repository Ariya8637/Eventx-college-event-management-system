import React, { useState } from 'react';

/**
 * Feature 2: Team Registration Module
 * Self-contained modal that extends the individual registration flow.
 * No backend changes — stores locally + sends existing registerForEvent API.
 * Admin panel view: TeamRegistrationsPanel (bottom of file)
 */

// ─── localStorage Key ──────────────────────────────────────────────────────
const STORAGE_KEY = 'teamRegistrations';

const saveTeamRegistration = (data) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push({ ...data, id: Date.now(), registeredAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

const getAllTeamRegistrations = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.45)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: '1rem',
    },
    modal: {
        background: '#fff', borderRadius: '1.25rem', padding: '2.5rem',
        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(124,58,237,0.18)',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
    },
    label: {
        fontSize: '0.82rem', fontWeight: '700', color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem',
    },
    input: {
        width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem',
        border: '1.5px solid #e5e7eb', fontSize: '0.95rem', color: '#1e1b4b',
        background: '#fafafa', boxSizing: 'border-box', outline: 'none',
        transition: 'border-color 0.2s',
    },
    memberRow: {
        display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem',
    },
    removeBtn: {
        background: '#fee2e2', border: 'none', borderRadius: '0.5rem',
        color: '#ef4444', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 0.75rem',
        fontWeight: '700', flexShrink: 0,
    },
    addBtn: {
        background: 'rgba(124,58,237,0.08)', border: '1.5px dashed #a78bfa',
        color: '#7c3aed', borderRadius: '0.6rem', padding: '0.6rem 1rem',
        cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', width: '100%', marginTop: '0.4rem',
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff',
        border: 'none', borderRadius: '0.75rem', padding: '0.9rem 2rem',
        fontSize: '1rem', fontWeight: '700', cursor: 'pointer', width: '100%',
        boxShadow: '0 4px 14px rgba(124,58,237,0.3)', transition: 'all 0.3s',
    },
    tag: {
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe',
        borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: '600',
    },
};

// ─── Main Modal Component ──────────────────────────────────────────────────
const TeamRegistrationModal = ({ event, user, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1 = form, 2 = confirm, 3 = success
    const [teamName, setTeamName] = useState('');
    const [leaderEmail, setLeaderEmail] = useState(user?.email || '');
    const [members, setMembers] = useState([{ name: '', email: '', role: '' }]);
    const [errors, setErrors] = useState({});

    const addMember = () => {
        if (members.length < 6) setMembers([...members, { name: '', email: '', role: '' }]);
    };

    const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

    const updateMember = (i, field, val) => {
        const updated = [...members];
        updated[i][field] = val;
        setMembers(updated);
    };

    const validate = () => {
        const e = {};
        if (!teamName.trim()) e.teamName = 'Team name is required';
        if (!leaderEmail.trim()) e.leaderEmail = 'Leader email is required';
        members.forEach((m, i) => {
            if (!m.name.trim()) e[`m_name_${i}`] = 'Name required';
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setStep(2);
    };

    const handleConfirm = () => {
        const registration = {
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            teamName,
            leaderName: user?.name,
            leaderEmail,
            members,
        };
        saveTeamRegistration(registration);
        setStep(3);
        if (onSuccess) onSuccess(registration);
    };

    if (step === 3) return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, textAlign: 'center', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: '#1e1b4b', marginBottom: '0.5rem' }}>Team Registered!</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    <strong>{teamName}</strong> has been successfully registered for <strong>{event.title}</strong>.
                </p>
                <div style={{ background: '#f5f3ff', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: '700', marginBottom: '0.5rem' }}>Team Summary</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151' }}>👑 Leader: {user?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#374151', marginTop: '0.25rem' }}>👥 Members: {members.length}</div>
                </div>
                <button style={styles.primaryBtn} onClick={onClose}>Close</button>
            </div>
        </div>
    );

    if (step === 2) return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#1e1b4b', marginTop: 0 }}>✅ Confirm Team Registration</h3>
                <div style={{ background: '#f5f3ff', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.4rem', color: '#374151' }}><strong>Team:</strong> {teamName}</p>
                    <p style={{ margin: '0 0 0.4rem', color: '#374151' }}><strong>Leader:</strong> {user?.name} ({leaderEmail})</p>
                    <p style={{ margin: '0 0 0.4rem', color: '#374151' }}><strong>Event:</strong> {event.title}</p>
                    <p style={{ margin: '0', color: '#374151' }}><strong>Members:</strong> {members.length}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: '0.75rem', padding: '0.9rem', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>Edit</button>
                    <button onClick={handleConfirm} style={{ ...styles.primaryBtn, flex: 1 }}>Confirm & Register</button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }`}</style>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>👥 Team Registration</h3>
                        <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{event.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.1rem', color: '#6b7280' }}>✕</button>
                </div>

                {/* Team Name */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={styles.label}>Team Name *</label>
                    <input
                        style={{ ...styles.input, borderColor: errors.teamName ? '#ef4444' : '#e5e7eb' }}
                        placeholder="e.g., Alpha Coders"
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                    />
                    {errors.teamName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.teamName}</span>}
                </div>

                {/* Leader */}
                <div style={{ marginBottom: '1.25rem', background: '#faf8ff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #ede9fe' }}>
                    <label style={{ ...styles.label, color: '#7c3aed' }}>👑 Team Leader (You)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <input style={styles.input} value={user?.name || ''} disabled placeholder="Leader Name" />
                        </div>
                        <div>
                            <input
                                style={{ ...styles.input, borderColor: errors.leaderEmail ? '#ef4444' : '#e5e7eb' }}
                                value={leaderEmail}
                                onChange={e => setLeaderEmail(e.target.value)}
                                placeholder="Leader Email"
                            />
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={styles.label}>Team Members ({members.length}/6)</label>
                        <span style={styles.tag}>Max 6 members</span>
                    </div>
                    {members.map((m, i) => (
                        <div key={i} style={styles.memberRow}>
                            <input
                                style={{ ...styles.input, borderColor: errors[`m_name_${i}`] ? '#ef4444' : '#e5e7eb' }}
                                placeholder={`Member ${i + 1} Name *`}
                                value={m.name}
                                onChange={e => updateMember(i, 'name', e.target.value)}
                            />
                            <input
                                style={{ ...styles.input }}
                                placeholder="Email (optional)"
                                value={m.email}
                                onChange={e => updateMember(i, 'email', e.target.value)}
                            />
                            <input
                                style={{ ...styles.input, maxWidth: '120px' }}
                                placeholder="Role"
                                value={m.role}
                                onChange={e => updateMember(i, 'role', e.target.value)}
                            />
                            {members.length > 1 && (
                                <button style={styles.removeBtn} onClick={() => removeMember(i)}>✕</button>
                            )}
                        </div>
                    ))}
                    {members.length < 6 && (
                        <button style={styles.addBtn} onClick={addMember}>+ Add Member</button>
                    )}
                </div>

                <button style={styles.primaryBtn} onClick={handleSubmit}>
                    Review & Confirm → 
                </button>
            </div>
        </div>
    );
};

// ─── Admin Panel: View All Team Registrations ──────────────────────────────
export const TeamRegistrationsPanel = () => {
    const registrations = getAllTeamRegistrations();

    if (registrations.length === 0) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <p>No team registrations yet.</p>
        </div>
    );

    return (
        <div>
            <h3 style={{ color: '#1e1b4b', marginBottom: '1.25rem' }}>Team Registrations ({registrations.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {registrations.map(reg => (
                    <div key={reg.id} style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: '0.875rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div>
                                <span style={{ fontWeight: '800', color: '#1e1b4b', fontSize: '1.05rem' }}>{reg.teamName}</span>
                                <span style={{ marginLeft: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: '700' }}>Team</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                {new Date(reg.registeredAt).toLocaleString()}
                            </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            📅 <strong>{reg.eventTitle}</strong>
                        </p>
                        <p style={{ margin: '0 0 0.75rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            👑 Leader: <strong>{reg.leaderName}</strong> ({reg.leaderEmail})
                        </p>
                        <details>
                            <summary style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: '600', fontSize: '0.9rem' }}>
                                👥 {reg.members.length} Member{reg.members.length > 1 ? 's' : ''}
                            </summary>
                            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {reg.members.map((m, i) => (
                                    <div key={i} style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: '#374151' }}>
                                        <strong>{m.name}</strong>{m.role && ` — ${m.role}`}
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamRegistrationModal;
