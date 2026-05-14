import React from 'react';
import { motion } from 'framer-motion';
import { LuKey } from "react-icons/lu";
import { ImSpinner9 } from "react-icons/im";
import { toast } from 'react-toastify';
import Field from '../Hooks/Field';
import PwdInput from '../Hooks/PwdInput';

const SecurityTab = ({ fadeUp, cardStyle, handleSavePassword, curPwd, setCurPwd, newPwd, setNewPwd, cnfPwd, setCnfPwd, pwdErrs, setPwdErrs, savingPassword, pwdStrength, pwdLabels, pwdColors, inputCls }) => {
    return (
        <motion.form key="security" {...fadeUp(0.08)}
            onSubmit={handleSavePassword}
            className="rounded-2xl p-6 flex flex-col gap-5" style={cardStyle}>

            <div>
                <h3 className="text-[11px] font-bold text-white/45 uppercase tracking-widest">Change Password</h3>
                <p className="text-xs text-white/28 mt-1">Use a strong, unique password you don't use elsewhere.</p>
            </div>

            <Field label="Current Password" error={pwdErrs.cur}>
                <PwdInput placeholder="Your current password"
                    value={curPwd} onChange={e => { setCurPwd(e.target.value); setPwdErrs(p => ({ ...p, cur: "" }));  }} inputCls={inputCls} />
            </Field>

            <Field label="New Password" error={pwdErrs.new}>
                <PwdInput placeholder="Minimum 6 characters"
                    value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdErrs(p => ({ ...p, new: "" })); }} inputCls={inputCls} />
            </Field>

            <Field label="Confirm New Password" error={pwdErrs.cnf}>
                <PwdInput placeholder="Repeat new password"
                    value={cnfPwd} onChange={e => { setCnfPwd(e.target.value); setPwdErrs(p => ({ ...p, cnf: "" })); }} inputCls={inputCls} />
            </Field>

            {/* Strength bar */}
            {newPwd && (
                <div>
                    <p className="text-[11px] text-white/28 mb-1.5">Password strength</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                style={{ background: n <= pwdStrength ? pwdColors[pwdStrength] : "rgba(255,255,255,0.07)" }} />
                        ))}
                    </div>
                    <p className="text-[10px] text-white/25 mt-1"
                        style={{ color: pwdStrength > 0 ? pwdColors[pwdStrength] : undefined }}>
                        {pwdLabels[pwdStrength]}
                    </p>
                </div>
            )}

            <button type="submit" disabled={savingPassword}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-black transition-all active:scale-[0.98] disabled:opacity-55 cursor-pointer border-0"
                style={{ background: "linear-gradient(135deg,#00C9A7,#4DA8DA)", fontFamily: "inherit" }}>
                {savingPassword
                    ? <><ImSpinner9 className="animate-spin" /> Updating…</>
                    : <><LuKey size={15} /> Change Password</>
                }
            </button>
        </motion.form>
    )
}

export default SecurityTab
