import React, { useState, useEffect, useRef } from 'react';

const FORUM_KEY = (eventId) => `forum_${eventId}`;

const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${hash % 360}, 75%, 60%)`;
};

function DashboardLiveChat({ allEvents, currentUser }) {
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showOnlinePulse, setShowOnlinePulse] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial setup
    useEffect(() => {
        if (!selectedEventId && allEvents?.length > 0) {
            setSelectedEventId(allEvents[0]._id);
        }
    }, [allEvents, selectedEventId]);

    // Load & listen for real-time changes
    useEffect(() => {
        if (!selectedEventId) return;

        const loadMsgs = () => {
            const data = JSON.parse(localStorage.getItem(FORUM_KEY(selectedEventId)) || '[]');
            // For a chat interface, we might sort ascending (oldest to newest) to show scrolling down
            setMessages(data.sort((a, b) => new Date(a.ts) - new Date(b.ts)));
        };

        loadMsgs();

        // Listen for storage events (allows real-time chat between different browser tabs/windows)
        const handleStorage = (e) => {
            if (e.key === FORUM_KEY(selectedEventId)) {
                loadMsgs();
            }
        };

        window.addEventListener('storage', handleStorage);
        
        // Simulating random internal updates for online effect
        const ptimer = setInterval(() => setShowOnlinePulse(p => !p), 1500);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(ptimer);
        };
    }, [selectedEventId]);

    // Format new posts flatly instead of the old deeply nested Reddit style format
    const handleSend = () => {
        if (!inputText.trim() || !selectedEventId) return;

        const newMsg = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            author: currentUser || 'Anonymous Student',
            text: inputText.trim(),
            ts: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: [], // unused in raw chat
        };

        const currentMsgs = JSON.parse(localStorage.getItem(FORUM_KEY(selectedEventId)) || '[]');
        const updated = [...currentMsgs, newMsg];
        
        localStorage.setItem(FORUM_KEY(selectedEventId), JSON.stringify(updated));
        
        // trigger local update 
        const event = new StorageEvent('storage', { key: FORUM_KEY(selectedEventId) });
        window.dispatchEvent(event);
        
        // Also update immediately
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
    };

    // Delete a message
    const handleDelete = (msgId) => {
        if (!selectedEventId) return;
        const currentMsgs = JSON.parse(localStorage.getItem(FORUM_KEY(selectedEventId)) || '[]');
        const updated = currentMsgs.filter(m => m.id !== msgId);
        
        localStorage.setItem(FORUM_KEY(selectedEventId), JSON.stringify(updated));
        
        // Trigger local update across tabs
        const event = new StorageEvent('storage', { key: FORUM_KEY(selectedEventId) });
        window.dispatchEvent(event);
        
        // Update immediately
        setMessages(updated);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const activeEvent = allEvents?.find(e => e._id === selectedEventId);

    if (!allEvents || allEvents.length === 0) return null;

    return (
        <div style={{ display: 'flex', background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #ede9fe', boxShadow: '0 8px 30px rgba(124,58,237,0.12)', height: '500px', marginBottom: '2.5rem', animation: 'dashFadeIn 0.4s ease both' }}>
            
            {/* LEFT PANE - Event List */}
            <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌎</span>
                        <h2 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.1rem', fontWeight: '900' }}>Live Discussion</h2>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Join the conversation in real-time</p>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {allEvents.map(e => {
                        const isSelected = e._id === selectedEventId;
                        return (
                            <div 
                                key={e._id}
                                onClick={() => setSelectedEventId(e._id)}
                                style={{ 
                                    padding: '1rem', 
                                    background: isSelected ? '#fff' : 'transparent', 
                                    borderRadius: '0.75rem', 
                                    cursor: 'pointer', 
                                    border: `1px solid ${isSelected ? '#ddd6fe' : 'transparent'}`,
                                    boxShadow: isSelected ? '0 4px 12px rgba(124,58,237,0.08)' : 'none',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(ev) => { if(!isSelected) ev.currentTarget.style.background = '#f1f5f9'; }}
                                onMouseLeave={(ev) => { if(!isSelected) ev.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                    <h4 style={{ margin: 0, color: isSelected ? '#7c3aed' : '#334155', fontSize: '0.9rem', fontWeight: '700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {e.title}
                                    </h4>
                                    {isSelected && (
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', opacity: showOnlinePulse ? 1 : 0.4, transition: 'opacity 0.4s', flexShrink: 0, marginLeft: '0.5rem', marginTop: '0.2rem' }} />
                                    )}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>📍 {e.venue}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT PANE - Chat Window */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                {activeEvent ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{activeEvent.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
                                    <span>📅 {new Date(activeEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    <span>•</span>
                                    <span style={{ color: '#22c55e', fontWeight: '600' }}>Students Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                            {messages.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👋</div>
                                    <p style={{ margin: 0, fontWeight: '600' }}>No messages yet.</p>
                                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Be the first to start the discussion for this event!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.author === (currentUser || 'Anonymous Student');
                                    const rawAuthor = msg.author || '?';
                                    const initial = rawAuthor.charAt(0).toUpperCase();

                                    return (
                                        <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            {!isMe && (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: getAvatarColor(rawAuthor), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0 }}>
                                                    {initial}
                                                </div>
                                            )}
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                {!isMe && (
                                                    <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.2rem', marginLeft: '0.25rem' }}>
                                                        {msg.author}
                                                    </span>
                                                )}
                                                
                                                <div style={{ 
                                                    background: isMe ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                                                    color: isMe ? '#fff' : '#1e293b',
                                                    borderRadius: '1rem',
                                                    borderBottomRightRadius: isMe ? '4px' : '1rem',
                                                    borderBottomLeftRadius: isMe ? '1rem' : '4px',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.5',
                                                    boxShadow: isMe ? '0 4px 12px rgba(124,58,237,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                                                    border: isMe ? 'none' : '1px solid #e2e8f0'
                                                }}>
                                                    {msg.text}
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                                                    <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                                                        {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                                            title="Delete message"
                                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', opacity: 0.7, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1rem 1.5rem', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                            <input 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => { if(e.key==='Enter') handleSend() }}
                                placeholder="Write a message..."
                                style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '999px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', color: '#1e293b', fontSize: '0.95rem', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                                onFocus={e => e.target.style.borderColor = '#c4b5fd'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                style={{ background: inputText.trim() ? '#7c3aed' : '#e2e8f0', color: inputText.trim() ? '#fff' : '#94a3b8', width: '45px', height: '45px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0, boxShadow: inputText.trim() ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        Select an event to join the discussion
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardLiveChat;
