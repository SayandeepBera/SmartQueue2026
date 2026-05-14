import React from 'react'
import { Link } from 'react-router-dom';
import { LuPencil } from 'react-icons/lu';

const Avatar = ({ user, profile }) => {
    const initials = (profile?.fullName || user?.username || "U")
        .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="relative group">
            <div className="w-30 h-30 rounded-full overflow-hidden"
                style={{ border: "3px solid rgba(0,201,167,0.4)" }}>
                {profile?.avatar?.url
                    ? <img src={profile.avatar.url} alt="avatar"
                        className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-extrabold text-black"
                        style={{ background: "linear-gradient(135deg,#00C9A7,#4DA8DA)" }}>
                        {initials}
                    </div>
                }
            </div>
            {/* Edit overlay */}
            <Link to="/editprofile"
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                style={{ background: "rgba(0,0,0,0.52)" }}>
                <LuPencil size={18} className="text-white" />
            </Link>
        </div>
    );
}

export default Avatar
