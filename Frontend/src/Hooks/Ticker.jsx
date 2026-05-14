import React, { useState, useEffect } from 'react'

// Ticker component that cycles through a list of items with a fade and slide animation
const Ticker = ({ items }) => {
    // Sample items to display in the ticker
    const [i, setI] = useState(0); 
    const [vis, setVis] = useState(true);

    // List of items to cycle through in the ticker
    useEffect(() => {
        const t = setInterval(() => {
            setVis(false);
            setTimeout(() => { setI(x => (x + 1) % items.length); setVis(true); }, 480);
        }, 4500);
        return () => clearInterval(t);
    }, [items.length]);

    return (
        <span style={{
            transition: "opacity .48s, transform .48s",
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(-8px)",
            display: "inline-block"
        }}>
            {items[i]}
        </span>
    );
}

export default Ticker
