import React, { useEffect, useState } from 'react';
import dataService from '../services/data.service';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('overview'); // overview, events, participants
    const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0 });
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [participants, setParticipants] = useState([]);

    // Event Form State
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventFormData, setEventFormData] = useState({
        title: '', description: '', date: '', venue: '', eventType: 'Workshop'
    });
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dataService.getAllEvents();
            setEvents(res.data);

            const statsRes = await dataService.getStats();
            setStats({
                totalEvents: res.data.length,
                totalRegistrations: statsRes.data.totalRegistrations
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await dataService.updateEvent(editId, eventFormData);
            } else {
                await dataService.createEvent(eventFormData);
            }
            setShowEventForm(false);
            setEditMode(false);
            setEventFormData({ title: '', description: '', date: '', venue: '', eventType: 'Workshop' });
            loadEvents();
        } catch (err) {
            alert('Error saving event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await dataService.deleteEvent(id);
            loadEvents();
        } catch (err) {
            alert('Error deleting event');
        }
    };

    const handleEditClick = (event) => {
        setEventFormData({
            title: event.title,
            description: event.description || '',
            date: event.date ? event.date.split('T')[0] : '',
            venue: event.venue,
            eventType: event.eventType
        });
        setEditId(event._id);
        setEditMode(true);
        setShowEventForm(true);
        setView('events');
    };

    const handleViewParticipants = async (eventId) => {
        try {
            const res = await dataService.getEventParticipants(eventId);
            setParticipants(res.data);
            setSelectedEventId(eventId);
            setView('participants');
        } catch (err) {
            alert('Error fetching participants');
        }
    };

    const handleAttendance = async (registrationId, status) => {
        try {
            await dataService.markAttendance(registrationId, status);
            // Refresh participants
            handleViewParticipants(selectedEventId);
        } catch (err) {
            alert('Error updating attendance');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Admin Dashboard</h2>
                <div>
                    <button className="btn-sm" style={{ marginRight: '1rem' }} onClick={() => setView('overview')}>Overview</button>
                    <button className="btn-sm" onClick={() => setShowEventForm(true)}>+ New Event</button>
                </div>
            </div>

            {/* Overview Stats */}
            {view === 'overview' && (
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalEvents}</div>
                        <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalRegistrations}</div>
                        <div className="stat-label">Total Registrations</div>
                    </div>
                </div>
            )}

            {/* Event Form Modal/Section */}
            {showEventForm && (
                <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    <h3>{editMode ? 'Edit Event' : 'Create New Event'}</h3>
                    <form onSubmit={handleCreateEvent}>
                        <div className="form-group">
                            <label>Title</label>
                            <input value={eventFormData.title} onChange={e => setEventFormData({ ...eventFormData, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={eventFormData.eventType} onChange={e => setEventFormData({ ...eventFormData, eventType: e.target.value })}>
                                <option>Workshop</option>
                                <option>Seminar</option>
                                <option>Cultural</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={eventFormData.description} onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })} rows="3" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={eventFormData.date} onChange={e => setEventFormData({ ...eventFormData, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Venue</label>
                                <input value={eventFormData.venue} onChange={e => setEventFormData({ ...eventFormData, venue: e.target.value })} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-primary">Save Event</button>
                            <button type="button" className="btn-sm" onClick={() => { setShowEventForm(false); setEditMode(false); }} style={{ background: '#e5e7eb', color: 'black' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Event List */}
            {view === 'overview' && (
                <div className="table-container">
                    <h3>All Events</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event._id}>
                                    <td>{event.title}</td>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td><span className="badge badge-success">{event.eventType}</span></td>
                                    <td>
                                        <button className="btn-sm" onClick={() => handleEditClick(event)} style={{ marginRight: '0.5rem' }}>Edit</button>
                                        <button className="btn-sm" onClick={() => handleViewParticipants(event._id)} style={{ marginRight: '0.5rem', background: 'var(--secondary-color)', color: 'white' }}>Participants</button>
                                        <button className="btn-sm" onClick={() => handleDeleteEvent(event._id)} style={{ background: 'var(--danger)', color: 'white' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Participants View */}
            {view === 'participants' && (
                <div>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setView('overview')} className="btn-sm" style={{ background: 'transparent', border: '1px solid #ccc' }}>&larr; Back</button>
                        Participants for Event
                    </h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Dept</th>
                                    <th>Year</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No registrations yet</td></tr>
                                ) : (
                                    participants.map(p => (
                                        <tr key={p._id}>
                                            <td>{p.student?.name}</td>
                                            <td>{p.student?.email}</td>
                                            <td>{p.student?.department}</td>
                                            <td>{p.student?.year}</td>
                                            <td>
                                                <span className={`badge ${p.status === 'Attended' ? 'badge-success' : 'badge-warning'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>
                                                {p.status !== 'Attended' && (
                                                    <button className="btn-sm" onClick={() => handleAttendance(p._id, 'Attended')} style={{ background: 'var(--secondary-color)', color: 'white' }}>Mark Present</button>
                                                )}
                                                {p.status === 'Attended' && (
                                                    <button className="btn-sm" onClick={() => handleAttendance(p._id, 'registered')} style={{ background: 'var(--text-light)', color: 'white' }}>Undo</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
