// Pages/EditProfile.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
    LuUserRound, LuMail, LuPhone, LuMapPin,
    LuCamera, LuTrash2, LuSave, LuKey,
    LuEye, LuEyeOff, LuAtSign, LuFileText, LuUsers
} from "react-icons/lu";
import { ImSpinner9 } from "react-icons/im";
import ProfileContext from "../Context/Profile/ProfileContext";
import AuthContext from "../Context/Authentication/AuthContext";
import Field from "../Hooks/Field";
import AvatarUploader from "../Hooks/AvatarUploader";
import WithIcon from "../Hooks/WithIcon";
import ProfileTab from "../Components/ProfileTab";
import AccountTab from "../Components/AccountTab";
import SecurityTab from "../Components/SecurityTab";

/* ─── constants ─────────────────────────────────────────────────────── */
const TABS = [
    { id: "profile", label: "Profile", icon: LuUserRound },
    { id: "account", label: "Account", icon: LuAtSign },
    { id: "security", label: "Security", icon: LuKey },
];

const inputCls =
    "w-full px-4 py-3 rounded-xl text-sm text-white/85 bg-white/[0.04] border border-white/10 outline-none transition-all duration-200 placeholder:text-white/20 focus:border-[#00C9A7]/55 focus:ring-2 focus:ring-[#00C9A7]/12";


const EditProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        getMyProfile, profileData,
        updateProfileDetails, updateUsername, updatePassword,
        updateAvatar, deleteAvatar,
    } = useContext(ProfileContext);

    const { userRole, setUsername: setAuthUsername, userId } = useContext(AuthContext);

    // Resolve initial tab from query param
    const qTab = new URLSearchParams(location.search).get("tab");
    const [activeTab, setActiveTab] = useState(
        qTab && TABS.find(t => t.id === qTab) ? qTab : "profile"
    );

    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingUsername, setSavingUsername] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("");
    const [state, setStatVal] = useState("");
    const [bio, setBio] = useState("");

    // ── Account tab state (mirrors User.username) ───────────────
    const [username, setUsername] = useState("");
    const [usernameErr, setUsernameErr] = useState("");

    // ── Security tab state ──────────────────────────────────────
    const [curPwd, setCurPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [cnfPwd, setCnfPwd] = useState("");
    const [pwdErrs, setPwdErrs] = useState({});

    const isOrgRole = ["pending_org", "approved_org", "rejected_org", "suspended_org"].includes(userRole);

    // Fetch profile data on mount
    useEffect(() => {
        (async () => {
            const result = await getMyProfile(userId);
            if (!result.success) {
                toast.error(result.error, { theme: "colored" });
            } else {
                const { user, profile } = result;
                
                // Populate from profile collection
                setFullName(profile?.fullName || "");
                setPhone(profile?.phone || "");
                setGender(profile?.gender || "");
                setCity(profile?.city || "");
                setStatVal(profile?.state || "");
                setBio(profile?.bio || "");
                // Populate from user collection
                setUsername(user?.username || "");
            }

            setPageLoading(false);
        })();
    }, []);

    /* Handlers */
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        const result = await updateProfileDetails(userId, {
            fullName: fullName.trim(),
            phone: phone.trim(),
            gender,
            city: city.trim(),
            state: state,
            bio: bio.trim(),
        });

        if (result.success) {
            toast.success("Profile is updated successfully ✓", { theme: "colored" });
        } else {
            toast.error(result.error, { theme: "colored" });
        }

        setSaving(false);
    };

    // Update username
    const handleSaveUsername = async (e) => {
        e.preventDefault();
        setUsernameErr("");
        
        const trimmed = username.trim().toLowerCase();
        
        // Username cannot be empty
        if (!trimmed) {
            setUsernameErr("Username cannot be empty"); 
            return; 
        }

        // Username must be at least 3 characters
        if (trimmed.length < 3) { 
            setUsernameErr("Minimum 3 characters"); 
            return; 
        }

        // Username can only contain letters, numbers, and underscores
        if (!/^[a-z0-9_]+$/.test(trimmed)) { 
            setUsernameErr("Only lowercase letters, numbers and underscores"); 
            return; 
        }

        setSavingUsername(true);
        const result = await updateUsername(userId, trimmed);
        
        if (result.success) {
            toast.success("Username is updated successfully ✓", { 
                theme: "colored" 
            });

            if (typeof setAuthUsername === "function") 
                setAuthUsername(result.user.username);

        } else {
            setUsernameErr(result.error);
        }

        setSavingUsername(false);
    };

    // Update password
    const handleSavePassword = async (e) => {
        e.preventDefault();
        const errs = {};

        // Basic client-side validation
        if (!curPwd) 
            errs.cur = "Current password is required";
        if (!newPwd || newPwd.length < 6) 
            errs.new = "Minimum 6 characters";
        if (newPwd !== cnfPwd) 
            errs.cnf = "Passwords do not match";
        
        setPwdErrs(errs);
        
        if (Object.keys(errs).length) return;

        setSavingPassword(true);
        const result = await updatePassword(userId, curPwd, newPwd);
        
        if (result.success) {
            toast.success("Password is changed successfully ✓", { 
                theme: "colored" 
            });

            setCurPwd(""); 
            setNewPwd(""); 
            setCnfPwd("");
        } else {
            toast.error(result.error, { 
                theme: "colored" 
            });
        }

        setSavingPassword(false);
    };

    // Upload avatar
    const handleUploadAvatar = async (file) => {
        setAvatarLoading(true);
        const result = await updateAvatar(userId, file);
        
        if (result.success) 
            toast.success("Photo updated successfully ✓", { theme: "colored" });
        else 
            toast.error(result.error, { theme: "colored" });
        
        setAvatarLoading(false);
    };

    // Remove avatar
    const handleRemoveAvatar = async () => {
        setAvatarLoading(true);
        const result = await deleteAvatar(userId);
        
        if (result.success) 
            toast.success("Photo removed successfully ✓", { theme: "colored" });
        else 
            toast.error(result.error, { theme: "colored" });
        
        setAvatarLoading(false);
    };

    /* ── Password strength */
    const pwdStrength = !newPwd ? 0
        : newPwd.length >= 12 && /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) && /[^a-zA-Z0-9]/.test(newPwd) ? 4
            : newPwd.length >= 10 && /[A-Z]/.test(newPwd) ? 3
                : newPwd.length >= 6 ? 2
                    : 1;
    const pwdColors = ["", "#f43f5e", "#f97316", "#fbbf24", "#34d399"];
    const pwdLabels = ["", "Too short", "Weak", "Moderate", "Strong"];

    if (pageLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A]/80">
            <ImSpinner9 className="animate-spin text-[#00C9A7] text-3xl" />
        </div>
    );

    const { user, profile, org } = profileData || {};

    const fadeUp = (d = 0) => ({
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: d, ease: [0.22, 1, 0.36, 1] },
    });

    const cardStyle = {
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.09)",
    };

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 bg-[#0F172A]/80"
            style={{ fontFamily: "'fangsong'" }}>

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute rounded-full"
                    style={{
                        top: "-10%", right: "-5%", width: 460, height: 460, opacity: 0.06,
                        background: "radial-gradient(circle,#00C9A7,transparent 65%)",
                        animation: "blobA 18s ease-in-out infinite"
                    }} />
                <div className="absolute rounded-full"
                    style={{
                        bottom: "-8%", left: "-5%", width: 380, height: 380, opacity: 0.05,
                        background: "radial-gradient(circle,#4DA8DA,transparent 65%)",
                        animation: "blobB 22s ease-in-out infinite"
                    }} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">

                {/* Page header */}
                <motion.div {...fadeUp(0)} className="mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white"
                            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Edit Profile</h1>
                        <p className="text-sm text-white/35 mt-0.5">Manage your personal info and account security</p>
                    </div>
                    <button onClick={() => navigate("/profile")}
                        className="text-sm text-white/45 hover:text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0">
                        ← Back to Profile
                    </button>
                </motion.div>

                {/* Tab bar */}
                <motion.div {...fadeUp(0.05)}
                    className="flex gap-1 p-1 rounded-2xl mb-6"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-0"
                                style={{
                                    background: active ? "rgba(0,201,167,0.12)" : "transparent",
                                    color: active ? "#00C9A7" : "rgba(255,255,255,0.38)",
                                    border: active ? "1px solid rgba(0,201,167,0.28)" : "1px solid transparent",
                                    fontFamily: "inherit",
                                }}>
                                <Icon size={14} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* TAB PANELS */}
                <AnimatePresence mode="wait">

                    {/* Profile tab  */}
                    {activeTab === "profile" && (
                        <ProfileTab fadeUp= {fadeUp} handleSaveProfile={handleSaveProfile} handleUploadAvatar={handleUploadAvatar} handleRemoveAvatar={handleRemoveAvatar} avatarLoading={avatarLoading} fullName={fullName} setFullName={setFullName} phone={phone} setPhone={setPhone} gender={gender} setGender={setGender} city={city} setCity={setCity} state={state} setStatVal={setStatVal} bio={bio} setBio={setBio} isOrgRole={isOrgRole} org={org} inputCls={inputCls} cardStyle={cardStyle} user={user} profile={profile} saving={saving} />
                    )}

                    {/* Account tab  */}
                    {activeTab === "account" && (
                        <AccountTab handleSaveUsername={handleSaveUsername} savingUsername={savingUsername} username={username} setUsername={setUsername} usernameErr={usernameErr} setUsernameErr={setUsernameErr} cardStyle={cardStyle} inputCls={inputCls} fadeUp={fadeUp} user={user} />
                    )}

                    {/* Security tab  */}
                    {activeTab === "security" && (
                        <SecurityTab fadeUp={fadeUp} cardStyle={cardStyle} handleSavePassword={handleSavePassword} curPwd={curPwd} setCurPwd={setCurPwd} newPwd={newPwd} setNewPwd={setNewPwd} cnfPwd={cnfPwd} setCnfPwd={setCnfPwd} pwdErrs={pwdErrs} setPwdErrs={setPwdErrs} savingPassword={savingPassword} pwdStrength={pwdStrength} pwdLabels={pwdLabels} pwdColors={pwdColors} inputCls={inputCls} />
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

export default EditProfile;