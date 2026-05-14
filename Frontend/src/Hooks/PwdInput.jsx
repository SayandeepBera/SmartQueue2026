import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

const PwdInput = ({ placeholder, value, onChange, inputCls }) => {
    const [show, setShow] = useState(false);
    
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`${inputCls} pr-11`}
                style={{ fontFamily: "inherit" }}
            />
            <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors cursor-pointer p-0 border-0 bg-transparent">
                {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
        </div>
    );
};

export default PwdInput;