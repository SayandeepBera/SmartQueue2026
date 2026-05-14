import { useRef } from "react";
import { LuCamera, LuTrash2 } from "react-icons/lu";
import { ImSpinner9 } from "react-icons/im";
import { toast } from 'react-toastify';

const AvatarUploader = ({ user, profile, onUpload, onRemove, uploading }) => {
    const fileRef = useRef();
    const initials = (profile?.fullName || user?.username || "U")
        .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Limit file size to 5 MB
        if (file.size > 5 * 1024 * 1024) { 
            toast.error("Image must be under 5 MB"); 
            return; 
        }

        // Basic check for valid image types
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file (JPG, PNG, or WebP)");
            return;
        }

        onUpload(file);

        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    return (
        <div className="flex items-center gap-6 flex-wrap">
            <div className="relative shrink-0">
                <div className="w-30 h-30 rounded-full overflow-hidden"
                    style={{ border: "2px solid rgba(0,201,167,0.35)" }}>
                    {profile?.avatar?.url
                        ? <img src={profile.avatar.url} alt="avatar" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl font-extrabold text-black"
                            style={{ background: "linear-gradient(135deg,#00C9A7,#4DA8DA)" }}>{initials}</div>
                    }
                </div>
                {uploading && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60">
                        <ImSpinner9 className="animate-spin text-white" size={20} />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#00C9A7] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)" }}>
                    <LuCamera size={15} />
                    {profile?.avatar?.url ? "Change Photo" : "Upload Photo"}
                </button>
                {profile?.avatar?.url && (
                    <button type="button" onClick={onRemove} disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#f43f5e] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                        <LuTrash2 size={15} /> Remove Photo
                    </button>
                )}
                <p className="text-[11px] text-white/22">JPG, PNG or WebP · max 5 MB</p>
            </div>
        </div>
    );
};

export default AvatarUploader;