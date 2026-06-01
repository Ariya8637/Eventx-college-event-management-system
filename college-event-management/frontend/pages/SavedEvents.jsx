import React, { useEffect, useState } from 'react';
import dataService from '../services/data.service';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

const SavedEvents = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadWishlist();
    }, [user]);

    const loadWishlist = async () => {
        if (!user) return;
        try {
            const res = await dataService.getWishlist(user.id);
            setWishlist(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (eventId) => {
        if (!confirm('Remove this event from your saved list?')) return;
        try {
            await dataService.removeFromWishlist(eventId);
            setWishlist(prev => prev.filter(item => item.event._id !== eventId));
        } catch (err) {
            alert('Failed to remove bookmark');
        }
    };

    // No-op for register/bookmark on this page for now, or implement if needed
    // The requirement says "Remove Bookmark" button.
    // Reusing EventCard but we need to handle "Remove" specifically.
    // EventCard has a heart toggle. If we pass isBookmarked=true and onBookmark=handleRemoveBookmark, it should work.

    if (loading) return <div className="loading-spinner">Loading Saved Events...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>Saved Events</h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Your personal collection of interested events.</p>
            </div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                    <h3>You haven't saved any events yet.</h3>
                </div>
            ) : (
                <div className="events-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {wishlist.map(item => (
                        <EventCard
                            key={item._id}
                            event={item.event}
                            isRegistered={false} // We don't have this info here easily without another call, assume false or fetch
                            onBookmark={(id) => handleRemoveBookmark(id)}
                            isBookmarked={true} // Always true in saved list
                            onRegister={() => alert('Please go to Event Details or Home to register.')}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedEvents;
