// Components/Admin/UserTable.jsx
import React from 'react';
import Badge from './Badge';
import { ImSpinner9 } from 'react-icons/im';

/* ── avatar helper ──────────────────────────────────────────────────────────── */
const Avatar = ({ user }) => {
    const initials = (user.fullName || user.username || '?')[0].toUpperCase();

    if (user.avatar?.url) {
        return (
            <img
                src={user.avatar.url}
                alt={initials}
                className="w-8 h-8 shrink-0 rounded-full object-cover border border-white/10"
            />
        );
    }
    return (
        <div
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-black select-none"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)' }}
        >
            {initials}
        </div>
    );
};

/* ── status helper: map role → display status ────────────────────────────────── */
const roleToStatus = (role) => (role === 'suspended_user' ? 'suspended' : 'active');

const UserTable = ({ users, actionId, onToggleStatus, onDeleteUser }) => {
    const gridLayout = 'md:grid-cols-[1fr_160px_90px_80px_100px_130px]';

    return (
        <div className="glass rounded-2xl overflow-hidden">

            {/* ── Desktop header ─────────────────────────────────────────── */}
            <div
                className={`hidden md:grid px-5 py-2.5 text-[11px] text-white/30 uppercase tracking-widest font-semibold border-b border-white/6 ${gridLayout}`}
                style={{ fontFamily: "'serif', 'fangsong'" }}
            >
                <span>User</span>
                <span>Email</span>
                <span>City</span>
                <span>Tokens</span>
                <span>Status</span>
                <span>Actions</span>
            </div>

            {/* ── Rows ───────────────────────────────────────────────────── */}
            <div className="max-h-125 overflow-y-auto">
                {users.map((u, i) => {
                    const isProcessing = actionId === u._id;
                    const status       = roleToStatus(u.role);
                    const displayName  = u.fullName || u.username;
                    const joinedDate   = u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';

                    return (
                        <div
                            key={u._id}
                            className={`tbl-row flex flex-col md:grid px-5 py-4 md:py-3.5 border-b border-white/3
                                        items-start md:items-center last:border-0 gap-3 md:gap-0 ${gridLayout}
                                        ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
                            style={{
                                animation: `fadeIn .3s ${i * 0.03}s both`,
                                fontFamily: "'serif', 'fangsong'",
                                transition: 'opacity .2s',
                            }}
                        >
                            {/* 1. User info */}
                            <div className="flex items-center gap-2.5 min-w-0 w-full">
                                <Avatar user={u} />
                                <div className="min-w-0">
                                    <div className="text-[14px] font-semibold text-white truncate flex items-center gap-1.5">
                                        {displayName}
                                        {isProcessing && (
                                            <ImSpinner9 className="animate-spin h-3 w-3 text-white/40 shrink-0" />
                                        )}
                                    </div>
                                    <div className="text-[11px] text-white/30 font-mono">
                                        @{u.username} · Joined {joinedDate}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Email */}
                            <div className="flex md:block justify-between w-full min-w-0">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold shrink-0">Email</span>
                                <span className="text-[12px] text-white/50 truncate md:block pr-2">{u.email}</span>
                            </div>

                            {/* 3. City */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">City</span>
                                <span className="text-[13px] text-white/60">{u.city || '—'}</span>
                            </div>

                            {/* 4. Tokens */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Tokens</span>
                                <span className="text-[13px] font-mono font-bold text-amber-400/80">
                                    {(u.totalTokens || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* 5. Status */}
                            <div className="flex md:block justify-between w-full">
                                <span className="md:hidden text-[10px] uppercase text-white/20 font-bold">Status</span>
                                <div className="md:inline-block">
                                    <Badge status={status} />
                                </div>
                            </div>

                            {/* 6. Actions */}
                            <div className="flex flex-wrap gap-1.5 w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-0">
                                {/* Suspend / Restore */}
                                <button
                                    onClick={() => onToggleStatus(u._id)}
                                    disabled={isProcessing}
                                    className="btn flex-1 md:flex-none px-2.5 py-1 rounded-lg text-xs font-semibold text-center transition-all"
                                    style={status === 'active'
                                        ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }
                                        : { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }
                                    }
                                >
                                    {isProcessing ? (
                                        <ImSpinner9 className="animate-spin h-3 w-3 shrink-0" />
                                    ) : (
                                        `${status === 'active' ? 'Suspend' : 'Restore'}`
                                    )}
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => onDeleteUser(u._id)}
                                    disabled={isProcessing}
                                    className="btn px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 text-center transition-all hover:bg-red-400/10"
                                    style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)' }}
                                >
                                        {isProcessing ? (
                                            <ImSpinner9 className="animate-spin h-3 w-3 shrink-0" />
                                        ) : (
                                            '🗑'
                                        )}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {users.length === 0 && (
                    <div className="text-center py-12 text-white/35 text-[15px]" style={{ fontFamily: "'serif'" }}>
                        No users match your filters
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTable;