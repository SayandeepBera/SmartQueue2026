import React from 'react';
import { motion } from 'framer-motion';
import { LuAtSign, LuEye, LuEyeOff } from "react-icons/lu";
import { ImSpinner9 } from "react-icons/im";
import { toast } from 'react-toastify';
import Field from '../Hooks/Field';
import WithIcon from '../Hooks/WithIcon';


const AccountTab = ({ handleSaveUsername, savingUsername, username, setUsername, usernameErr, setUsernameErr, cardStyle, inputCls, fadeUp, user }) => {
    return (
        <motion.div key="account" {...fadeUp(0.08)} className="flex flex-col gap-5">

            {/* Username change */}
            <form onSubmit={handleSaveUsername}
                className="rounded-2xl p-6 flex flex-col gap-5" style={cardStyle}>
                <div>
                    <h3 className="text-[11px] font-bold text-white/45 uppercase tracking-widest">Username</h3>
                    <p className="text-xs text-white/28 mt-1">Your username is used to log in and appears on your profile.</p>
                </div>
                <Field label="Username" error={usernameErr}
                    hint="Lowercase letters, numbers and underscores only (3–30 chars)">
                    <WithIcon icon={LuAtSign}>
                        <input type="text" placeholder="your_username"
                            value={username}
                            onChange={e => { setUsername(e.target.value.toLowerCase()); setUsernameErr(""); }}
                            className={`${inputCls} font-mono`}
                            style={{ fontFamily: "monospace" }} />
                    </WithIcon>
                </Field>
                <button type="submit" disabled={savingUsername}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-55 cursor-pointer"
                    style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.28)", color: "#00C9A7", fontFamily: "inherit" }}>
                    {savingUsername
                        ? <><ImSpinner9 className="animate-spin" /> Updating…</>
                        : "Update Username"
                    }
                </button>
            </form>

            {/* Read-only account info */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-[11px] font-bold text-white/45 uppercase tracking-widest mb-4">Account Details</h3>
                {[
                    ["Email", user?.email, "font-mono"],
                    ["Role", user?.role],
                    ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"],
                ].map(([label, val, extra = ""]) => (
                    <div key={label}
                        className="flex items-start justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] text-white/28 uppercase tracking-widest font-bold shrink-0 mt-0.5">{label}</span>
                        <span className={`text-sm text-white/62 text-right ${extra}`}>{val}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default AccountTab
