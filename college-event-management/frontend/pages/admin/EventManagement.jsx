import React, { useEffect, useState } from 'react';
import dataService from '../../services/data.service';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', venue: '', eventType: 'Workshop',
        status: 'Draft', capacity: 0, fee: 0, department: 'General', registrationDeadline: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await dataService.getAllEvents();
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await dataService.updateEvent(editingEvent._id, formData);
            } else {
                await dataService.createEvent(formData);
            }
            loadEvents();
            closeForm();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await dataService.deleteEvent(id);
            loadEvents();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const openForm = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                description: event.description || '',
                date: event.date ? event.date.split('T')[0] : '',
                venue: event.venue,
                eventType: event.eventType,
                status: event.status || 'Draft',
                capacity: event.capacity || 0,
                fee: event.fee || 0,
                department: event.department || 'General',
                registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '', description: '', date: '', venue: '', eventType: 'Workshop',
                status: 'Draft', capacity: 0, fee: 0, department: 'General', registrationDeadline: ''
            });
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
    };

    if (loading) return <div>Loading Events...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Event Management</h2>
                <button className="btn-primary" onClick={() => openForm()}>+ New Event</button>
            </div>

            {/* List View */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={thStyle}>Title</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, idx) => (
                            <tr key={event._id} style={{ borderBottom: idx !== events.length - 1 ? '1px solid #eee' : 'none' }}>
                                <td style={tdStyle}>{event.title}</td>
                                <td style={tdStyle}>{new Date(event.date).toLocaleDateString()}</td>
                                <td style={tdStyle}>{event.eventType}</td>
                                <td style={tdStyle}>
                                    <span className={`badge ${getStatusBadge(event.status)}`}>{event.status || 'Draft'}</span>
                                </td>
                                <td style={tdStyle}>
                                    <button className="btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => openForm(event)}>Edit</button>
                                    <button className="btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={() => handleDelete(event._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                                        <option>Workshop</option>
                                        <option>Seminar</option>
                                        <option>Cultural</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Draft</option>
                                        <option>Upcoming</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input type="date" value={formData.registrationDeadline} onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Venue</label>
                                <input value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Event Fee (₹)</label>
                                    <input type="number" value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Upcoming': return 'badge-success';
        case 'Completed': return 'badge-secondary';
        case 'Draft': return 'badge-warning';
        case 'Cancelled': return 'badge-danger'; // Assuming you add a red style for danger
        default: return 'badge-secondary';
    }
};

const thStyle = { padding: '1rem', textAlign: 'left', background: '#f8f9fa' };
const tdStyle = { padding: '1rem', borderBottom: '1px solid #eee' };

export default EventManagement;
