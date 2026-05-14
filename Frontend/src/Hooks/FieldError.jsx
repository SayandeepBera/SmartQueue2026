import React from 'react'

const FieldError = ({ msg }) => {
    if (!msg) {
        return null;
    }

    return (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
            <span>⚠</span>{msg}
        </p>
    );
}

export default FieldError;
