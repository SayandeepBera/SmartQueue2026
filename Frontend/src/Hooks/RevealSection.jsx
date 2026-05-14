import React, { useRef } from 'react'
import UseInView from './UseInView';

// RevealSection component that reveals its children with a fade-in and slide-up animation when it comes into view
const RevealSection = ({ children, delay = 0 }) => {
    const ref = useRef();
    const visibility = UseInView(ref);

    return (
        <div ref={ref} style={{
            transition: `opacity .7s ${delay}s cubic-bezier(.22,1,.36,1), transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`,
            opacity: visibility ? 1 : 0,
            transform: visibility ? "translateY(0)" : "translateY(36px)"
        }}>

            {/* Render the children component */}
            {children}

        </div>
    );
}

export default RevealSection
