import React, { useEffect, useState, useMemo } from 'react';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { InvoiceViewer, generateInvoiceNumber } from '../components/PaymentInvoice';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('upcoming'); // upcoming, newest
    const [viewingInvoice, setViewingInvoice] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        loadEvents();
        if (user) {
            loadWishlist();
            loadRegistrations();
        }
    }, [user]);

    const loadRegistrations = async () => {
        try {
            const res = await dataService.getMyRegistrations();
            setRegistrations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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

    const loadWishlist = async () => {
        try {
            const res = await dataService.getWishlist(user.id);
            setWishlist(res.data.map(item => item.event._id));
        } catch (err) {
            console.error('Failed to load wishlist', err);
        }
    };

    const handleRegister = async (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await dataService.registerForEvent(eventId);
            alert('Registered Successfully!');
            // Optionally refresh events or state to update button
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleBookmark = async (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const isBookmarked = wishlist.includes(eventId);

        try {
            if (isBookmarked) {
                await dataService.removeFromWishlist(eventId);
                setWishlist(prev => prev.filter(id => id !== eventId));
            } else {
                await dataService.addToWishlist(eventId);
                setWishlist(prev => [...prev, eventId]);
                alert('Event added to wishlist!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleViewInvoice = (e) => {
        const reg = registrations.find(r => r.event?._id === e._id || r.event === e._id);
        if (!reg) return;

        const fee = e.fee || 200;
        const platform = Math.round(fee * 0.1);
        const total = fee + platform;

        setViewingInvoice({
            invoiceNumber: generateInvoiceNumber(reg._id),
            studentName: user?.name,
            studentEmail: user?.email,
            eventTitle: e.title,
            eventDate: e.date,
            venue: e.venue || 'Main Auditorium',
            eventType: e.eventType,
            paymentDate: reg.createdAt || new Date(),
            paymentMethod: 'UPI',
            eventFee: fee,
            platformFee: platform,
            totalFee: total,
            transactionId: reg.ticketCode || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            department: user?.department || 'Student'
        });
    };

    const filteredEvents = useMemo(() => {
        return events
            .filter(event => {
                const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.description?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = filterType === 'All' || event.eventType === filterType;
                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === 'upcoming') {
                    return new Date(a.date) - new Date(b.date);
                } else {
                    // Newest created (assuming _id is rough proxy if no createdAt)
                    return b._id.localeCompare(a._id);
                }
            });
    }, [events, searchTerm, filterType, sortBy]);

    if (loading) return <div className="loading-spinner">Loading Events...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e1b4b' }}>Discover Events</h2>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Explore workshops, seminars, and cultural activities happening on campus.</p>
            </div>

            {/* Controls Section */}
            <div className="controls-bar" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                marginBottom: '2rem',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ede9fe', background: '#fafafa', color: '#1e1b4b', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ede9fe', background: '#fafafa', color: '#1e1b4b' }}
                    >
                        <option value="All">All Types</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Cultural">Cultural</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ede9fe', background: '#fafafa', color: '#1e1b4b' }}
                    >
                        <option value="upcoming">Date: Upcoming First</option>
                        <option value="newest">Date: Recently Added</option>
                    </select>
                </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <h3>No events found matching your criteria.</h3>
                </div>
            ) : (
                <div className="events-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredEvents.map(event => (
                        <EventCard
                            key={event._id}
                            event={event}
                            onRegister={handleRegister}
                            isRegistered={registrations.some(r => r.event?._id === event._id || r.event === event._id)}
                            isBookmarked={wishlist.includes(event._id)}
                            onBookmark={handleBookmark}
                            onViewInvoice={handleViewInvoice}
                        />
                    ))}
                </div>
            )}

            {viewingInvoice && (
                <InvoiceViewer 
                    invoiceData={viewingInvoice} 
                    onClose={() => setViewingInvoice(null)} 
                />
            )}
        </div>
    );
};

export default Events;
