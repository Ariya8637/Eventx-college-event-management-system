import React, { useEffect, useState } from 'react';
import dataService from '../../services/data.service';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        totalRegistrations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Fetch basic data. For a large app, we'd use a dedicated stats API.
                // For now, we compute from lists.
                const [eventsRes, statsRes] = await Promise.all([
                    dataService.getAllEvents(),
                    dataService.getStats()
                ]);

                const events = eventsRes.data;
                const upcoming = events.filter(e => e.status === 'Upcoming' || new Date(e.date) > new Date()).length;
                const completed = events.filter(e => e.status === 'Completed' || (new Date(e.date) < new Date() && e.status !== 'Cancelled')).length;

                setStats({
                    totalEvents: events.length,
                    upcomingEvents: upcoming,
                    completedEvents: completed,
                    totalRegistrations: statsRes.data.totalRegistrations
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <div>Loading Stats...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '2rem', color: '#1a1a1a' }}>Dashboard Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Events" value={stats.totalEvents} icon="📅" color="#3b82f6" />
                <StatCard title="Upcoming" value={stats.upcomingEvents} icon="⏳" color="#f59e0b" />
                <StatCard title="Completed" value={stats.completedEvents} icon="✅" color="#10b981" />
                <StatCard title="Registrations" value={stats.totalRegistrations} icon="👥" color="#8b5cf6" />
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
                <h3 style={{ marginBottom: '1rem' }}>Admin Quick Tips</h3>
                <ul style={{ paddingLeft: '1.5rem', color: '#666' }}>
                    <li>Use the <strong>Events</strong> tab to create new workshops or modify existing ones.</li>
                    <li>Go to <strong>Attendance</strong> to view participant lists or mark student attendance.</li>
                    <li>Update your personal details in the **Profile** section.</li>
                </ul>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
        <div style={{
            width: '50px', height: '50px', borderRadius: '12px', background: `${color}20`,
            color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginRight: '1rem'
        }}>
            {icon}
        </div>
        <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.8rem' }}>{value}</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{title}</p>
        </div>
    </div>
);

export default AdminOverview;
