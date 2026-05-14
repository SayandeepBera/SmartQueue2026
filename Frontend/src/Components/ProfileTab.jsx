import React from 'react';
import { motion } from 'framer-motion';
import {
    LuUserRound, LuMail, LuPhone, LuMapPin,
    LuCamera, LuTrash2, LuSave, LuKey,
    LuEye, LuEyeOff, LuAtSign, LuFileText, LuUsers
} from "react-icons/lu";
import { ImSpinner9 } from "react-icons/im";
import { toast } from 'react-toastify';
import Field from '../Hooks/Field';
import AvatarUploader from '../Hooks/AvatarUploader';
import WithIcon from '../Hooks/WithIcon';
import { State } from "country-state-city";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ProfileTab = ({ fadeUp, handleSaveProfile, handleUploadAvatar, handleRemoveAvatar, avatarLoading, fullName, setFullName, phone, setPhone, gender, setGender, city, setCity, state, setStatVal, bio, setBio, isOrgRole, org, inputCls, cardStyle, user, profile, saving, }) => {
    const indianStates = State.getStatesOfCountry("IN");

    return (
        <motion.form key="profile" {...fadeUp(0.08)}
            onSubmit={handleSaveProfile} className="flex flex-col gap-5">

            {/* Avatar */}
            <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="text-[11px] font-bold text-white/45 uppercase tracking-widest mb-5">
                    Profile Photo
                </h3>
                <AvatarUploader
                    user={user} 
                    profile={profile}
                    onUpload={handleUploadAvatar}
                    onRemove={handleRemoveAvatar}
                    uploading={avatarLoading}
                />
            </div>

            {/* Personal fields */}
            <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="text-[11px] font-bold text-white/45 uppercase tracking-widest mb-5">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <Field label="Full Name">
                        <WithIcon icon={LuUserRound}>
                            <input type="text" placeholder="Your full name"
                                value={fullName} onChange={e => setFullName(e.target.value)}
                                className={inputCls} style={{ fontFamily: "inherit" }} />
                        </WithIcon>
                    </Field>

                    <Field label="Phone">
                        <WithIcon icon={LuPhone}>
                            <PhoneInput
                                international
                                defaultCountry="IN"
                                placeholder="+91 XXXXX XXXXX"
                                value={phone}
                                onChange={val => setPhone(val)}
                                className={inputCls}
                                style={{ fontFamily: "inherit" }}
                            />
                        </WithIcon>
                    </Field>

                    <Field label="Gender">
                        <WithIcon icon={LuUsers}>
                            <select value={gender} onChange={e => setGender(e.target.value)}
                                className={inputCls} style={{ fontFamily: "inherit" }}>
                                <option value="">Select gender</option>
                                <option className="bg-[#0d1321]">Male</option>
                                <option className="bg-[#0d1321]">Female</option>
                                <option className="bg-[#0d1321]">Other</option>
                            </select>
                        </WithIcon>
                    </Field>

                    <Field label="City">
                        <WithIcon icon={LuMapPin}>
                            <input type="text" placeholder="Your city"
                                value={city} onChange={e => setCity(e.target.value)}
                                className={inputCls} style={{ fontFamily: "inherit" }} />
                        </WithIcon>
                    </Field>

                    <div className="sm:col-span-2">
                        <Field label="State">
                            <select value={state} onChange={e => setStatVal(e.target.value)}
                                className={inputCls} style={{ fontFamily: "inherit" }}>
                                <option value="">Select state</option>
                                {indianStates.map(s => (
                                    <option key={s.isoCode} value={s.isoCode} className="bg-[#0d1321]">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                </div>

                {/* Bio */}
                <div className="mt-4">
                    <Field label="Bio" hint={`${bio.length}/300 characters`}>
                        <div className="relative">
                            <LuFileText size={15} className="absolute left-3.5 top-3.5 text-white/25 pointer-events-none" />
                            <textarea rows={3} placeholder="A short bio about yourself…"
                                value={bio} onChange={e => setBio(e.target.value)}
                                maxLength={300}
                                className={`${inputCls} pl-10 resize-none`}
                                style={{ fontFamily: "inherit" }} />
                        </div>
                    </Field>
                </div>
            </div>

            {/* Non-editable email note */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <LuMail size={15} className="text-white/28 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs text-white/45 font-semibold">Email Address</p>
                    <p className="text-sm text-white/65 font-mono mt-0.5">{user?.email}</p>
                    <p className="text-[11px] text-white/22 mt-1">Email cannot be changed here. Contact support if needed.</p>
                </div>
            </div>

            {/* Org note */}
            {isOrgRole && org && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <span className="text-base shrink-0">🏢</span>
                    <div>
                        <p className="text-xs text-[#fbbf24] font-semibold">Organisation: {org.orgName}</p>
                        <p className="text-[11px] text-white/38 mt-0.5">
                            Org details (address, phone, working hours) can be updated from your Organisation Dashboard.
                        </p>
                    </div>
                </div>
            )}

            <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-black transition-all active:scale-[0.98] disabled:opacity-55 cursor-pointer border-0"
                style={{ background: "linear-gradient(135deg,#00C9A7,#4DA8DA)", fontFamily: "inherit" }}>
                {saving
                    ? <><ImSpinner9 className="animate-spin" /> Saving…</>
                    : <><LuSave size={15} /> Save Changes</>
                }
            </button>
        </motion.form>
    )
}

export default ProfileTab
