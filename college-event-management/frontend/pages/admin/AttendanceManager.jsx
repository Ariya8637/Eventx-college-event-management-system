import React, { useEffect, useState } from 'react';
import dataService from '../../services/data.service';
import { TeamRegistrationsPanel } from '../../components/TeamRegistrationModal';

const AttendanceManager = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renderTrigger, setRenderTrigger] = useState(0);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            loadParticipants(selectedEventId);
        } else {
            setParticipants([]);
        }
    }, [selectedEventId]);

    const loadEvents = async () => {
        try {
            const res = await dataService.getAllEvents();
            // Optional: Filter only non-draft events?
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadParticipants = async (eventId) => {
        setLoading(true);
        try {
            const res = await dataService.getEventParticipants(eventId);
            setParticipants(res.data);
        } catch (err) {
            alert('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendance = async (registrationId, status) => {
        try {
            await dataService.markAttendance(registrationId, status);
            // Optimistic update or reload
            setParticipants(prev => prev.map(p =>
                p._id === registrationId ? { ...p, status: status } : p
            ));
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleUploadCertificate = (e, registrationId) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            localStorage.setItem('custom_cert_' + registrationId, reader.result);
            setRenderTrigger(prev => prev + 1);
            alert('Certificate successfully uploaded and attached to this student!');
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Attendance & Participants</h2>

            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Select Event to Manage</label>
                    <select
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="">-- Choose an Event --</option>
                        {events.map(e => (
                            <option key={e._id} value={e._id}>
                                {e.title} ({new Date(e.date).toLocaleDateString()}) - {e.status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedEventId && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Participants ({participants.length})</h3>
                        <button className="btn-sm" onClick={() => loadParticipants(selectedEventId)}>Refresh List</button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Student Name</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Department</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No registrations yet.</td></tr>
                                ) : (
                                    participants.map((p, idx) => (
                                        <tr key={p._id} style={{ borderBottom: idx !== participants.length - 1 ? '1px solid #eee' : 'none' }}>
                                            <td style={tdStyle}>{p.student?.name}</td>
                                            <td style={tdStyle}>{p.student?.email}</td>
                                            <td style={tdStyle}>{p.student?.department}</td>
                                            <td style={tdStyle}>
                                                <span className={`badge ${p.status === 'Attended' ? 'badge-success' : 'badge-warning'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                {p.status !== 'Attended' ? (
                                                    <button
                                                        className="btn-sm"
                                                        style={{ background: 'var(--secondary-color)', color: 'white' }}
                                                        onClick={() => handleAttendance(p._id, 'Attended')}
                                                    >
                                                        Mark Present
                                                    </button>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        <button
                                                            className="btn-sm"
                                                            style={{ background: '#e5e7eb', color: '#374151' }}
                                                            onClick={() => handleAttendance(p._id, 'registered')}
                                                        >
                                                            Undo
                                                        </button>
                                                        
                                                        {/* CERTIFICATE UPLOAD BUTTON */}
                                                        <label style={{ background: localStorage.getItem('custom_cert_' + p._id) ? '#10b981' : '#7c3aed', color: '#fff', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer', fontWeight: '700' }}>
                                                            {localStorage.getItem('custom_cert_' + p._id) ? 'Uploaded ✅' : 'Upload Cert 📄'}
                                                            <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleUploadCertificate(e, p._id)} />
                                                        </label>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Render Team Registrations (for frontend module only) */}
            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <TeamRegistrationsPanel />
            </div>
        </div>
    );
};

const thStyle = { padding: '1rem', textAlign: 'left', background: '#f9fafb', fontSize: '0.9rem', color: '#666' };
const tdStyle = { padding: '1rem', borderBottom: '1px solid #eee' };

export default AttendanceManager;
