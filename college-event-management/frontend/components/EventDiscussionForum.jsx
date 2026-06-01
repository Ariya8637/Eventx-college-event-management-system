import React, { useState, useEffect } from 'react';

/**
 * Feature 3: Event Discussion Forum
 * Self-contained comment + reply + like system.
 * Uses localStorage keyed by eventId — no backend changes needed.
 */

const FORUM_KEY = (eventId) => `forum_${eventId}`;

const loadComments = (eventId) =>
    JSON.parse(localStorage.getItem(FORUM_KEY(eventId)) || '[]');

const saveComments = (eventId, comments) =>
    localStorage.setItem(FORUM_KEY(eventId), JSON.stringify(comments));

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
    wrap: {
        background: '#fff',
        border: '1px solid rgba(124,58,237,0.12)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(124,58,237,0.06)',
        marginTop: '2rem',
    },
    avatar: (seed) => ({
        width: '38px', height: '38px', borderRadius: '50%',
        background: `hsl(${(seed * 137) % 360},65%,60%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '800', fontSize: '0.9rem', flexShrink: 0,
    }),
    commentBox: {
        background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem',
        padding: '1rem', marginBottom: '1.25rem',
        transition: 'border-color 0.2s',
    },
    input: {
        width: '100%', border: 'none', outline: 'none', resize: 'none',
        background: 'transparent', fontSize: '0.95rem', color: '#1e1b4b',
        fontFamily: 'inherit', minHeight: '72px', lineHeight: '1.6',
    },
    postBtn: {
        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff',
        border: 'none', borderRadius: '0.6rem', padding: '0.6rem 1.4rem',
        cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
        boxShadow: '0 3px 10px rgba(124,58,237,0.25)',
    },
    likeBtn: (liked) => ({
        background: liked ? '#fef2f2' : 'transparent',
        border: `1px solid ${liked ? '#fca5a5' : '#e5e7eb'}`,
        color: liked ? '#ef4444' : '#9ca3af',
        borderRadius: '999px', padding: '0.25rem 0.7rem',
        cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        transition: 'all 0.2s',
    }),
    replyBtn: {
        background: 'transparent', border: 'none', color: '#7c3aed',
        cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', padding: '0.25rem 0.5rem',
    },
    ts: { fontSize: '0.78rem', color: '#9ca3af' },
    name: { fontWeight: '700', color: '#1e1b4b', fontSize: '0.92rem' },
};

// ─── Single Comment (with nested replies) ─────────────────────────────────
const CommentItem = ({ comment, depth = 0, currentUser, onUpdate }) => {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const initials = comment.author?.charAt(0)?.toUpperCase() || '?';
    const seed = comment.author?.charCodeAt(0) || 65;

    const handleLike = () => {
        const hasLiked = comment.likedBy?.includes(currentUser);
        onUpdate({
            ...comment,
            likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
            likedBy: hasLiked
                ? comment.likedBy.filter(u => u !== currentUser)
                : [...(comment.likedBy || []), currentUser],
        });
    };

    const handleReply = () => {
        if (!replyText.trim()) return;
        const reply = {
            id: genId(), author: currentUser || 'Anonymous',
            text: replyText.trim(), ts: new Date().toISOString(),
            likes: 0, likedBy: [], replies: [],
        };
        onUpdate({ ...comment, replies: [...(comment.replies || []), reply] });
        setReplyText('');
        setShowReply(false);
    };

    const handleUpdateReply = (updatedReply) => {
        onUpdate({
            ...comment,
            replies: comment.replies.map(r => r.id === updatedReply.id ? updatedReply : r),
        });
    };

    const hasLiked = comment.likedBy?.includes(currentUser);

    return (
        <div style={{ marginLeft: depth > 0 ? '2.5rem' : 0, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={S.avatar(seed)}>{initials}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ background: depth > 0 ? '#f5f3ff' : '#f9fafb', border: `1px solid ${depth > 0 ? '#ede9fe' : '#f3f4f6'}`, borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={S.name}>{comment.author}</span>
                            <span style={S.ts}>{new Date(comment.ts).toLocaleString()}</span>
                        </div>
                        <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', fontSize: '0.93rem' }}>{comment.text}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                        <button style={S.likeBtn(hasLiked)} onClick={handleLike}>
                            {hasLiked ? '❤' : '♡'} {comment.likes}
                        </button>
                        {depth < 2 && (
                            <button style={S.replyBtn} onClick={() => setShowReply(!showReply)}>
                                💬 Reply
                            </button>
                        )}
                    </div>
                    {showReply && (
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', alignItems: 'flex-end' }}>
                            <input
                                style={{ flex: 1, padding: '0.6rem 0.9rem', borderRadius: '0.6rem', border: '1.5px solid #c4b5fd', outline: 'none', fontSize: '0.9rem', color: '#1e1b4b', background: '#fafafa', fontFamily: 'inherit' }}
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReply()}
                            />
                            <button style={S.postBtn} onClick={handleReply}>Reply</button>
                        </div>
                    )}
                    {comment.replies?.map(reply => (
                        <CommentItem key={reply.id} comment={reply} depth={depth + 1} currentUser={currentUser} onUpdate={handleUpdateReply} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Main Forum Component ──────────────────────────────────────────────────
const EventDiscussionForum = ({ eventId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

    useEffect(() => {
        setComments(loadComments(eventId));
    }, [eventId]);

    const persist = (updated) => {
        setComments(updated);
        saveComments(eventId, updated);
    };

    const handlePost = () => {
        if (!text.trim()) return;
        const newComment = {
            id: genId(),
            author: currentUser || 'Anonymous',
            text: text.trim(),
            ts: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: [],
        };
        persist([newComment, ...comments]);
        setText('');
    };

    const handleUpdate = (updated) => {
        persist(comments.map(c => c.id === updated.id ? updated : c));
    };

    const sorted = [...comments].sort((a, b) => {
        if (sortBy === 'popular') return b.likes - a.likes;
        return new Date(b.ts) - new Date(a.ts);
    });

    return (
        <div style={S.wrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.2rem' }}>
                    💬 Discussion Forum
                    <span style={{ marginLeft: '0.75rem', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe', borderRadius: '999px', padding: '0.15rem 0.65rem', fontSize: '0.78rem', fontWeight: '700' }}>
                        {comments.length}
                    </span>
                </h3>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #ede9fe', fontSize: '0.85rem', color: '#374151', background: '#fafafa', cursor: 'pointer', outline: 'none' }}
                >
                    <option value="newest">📅 Newest First</option>
                    <option value="popular">🔥 Most Liked</option>
                </select>
            </div>

            {/* Compose */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                <div style={S.avatar(currentUser?.charCodeAt(0) || 90)}>
                    {currentUser?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={S.commentBox}>
                        <textarea
                            style={S.input}
                            placeholder="Share your thoughts, ask a question, or post an update..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                            <button style={{ ...S.postBtn, opacity: text.trim() ? 1 : 0.5 }} onClick={handlePost} disabled={!text.trim()}>
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments */}
            {sorted.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                    <p style={{ margin: 0 }}>No comments yet. Be the first to start the discussion!</p>
                </div>
            ) : (
                <div>
                    {sorted.map(c => (
                        <CommentItem key={c.id} comment={c} currentUser={currentUser} onUpdate={handleUpdate} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventDiscussionForum;
