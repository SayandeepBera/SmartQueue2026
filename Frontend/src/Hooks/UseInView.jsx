import React, { useEffect, useState } from 'react'

// Custom hook to detect if an element is in view using the Intersection Observer API
const UseInView = (ref, threshold = 0.1) => {
    const [visibility, setVisibility] = useState(false);

    // For visibility of the section
    useEffect(() => {
        // Create an Intersection Observer instance
        const io = new IntersectionObserver(([entry]) => {

            // Check if the observed element is intersecting with the viewport
            if (entry.isIntersecting) {
                setVisibility(true); // Set visibility to true when the element is in view
                io.disconnect(); // Stop observing after the element is in view to prevent unnecessary updates
            }
        }, {

            // Threshold defines the percentage of the target's visibility the observer's callback should be executed
            threshold
        });

        // Start observing the target element
        if (ref.current) {
            io.observe(ref.current);
        }

        // Clean up the observer when the component unmounts
        return () => io.disconnect();
    }, []);

    return visibility;
}

export default UseInView