import React, { useEffect, useState, useRef } from 'react'
import UseInView from './UseInView';

// AnimatedNumber component that animates a number counting up to a target value when it comes into view
const AnimatedNumber = ({ value, duration = 1400, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Visibility detection for the section
  const ref = useRef();
  const visibility = UseInView(ref);

  useEffect(() => {
    // If the section is not visible, do not start the animation
    if (!visibility || isNaN(value)) {
      return;
    }

    let s = 0; // Current animated value
    const step = value / (duration / 16); // Calculate the step size based on the target value and duration (assuming 60fps, so 16ms per frame)

    const t = setInterval(() => {
      // Increment the current value by the step size
      s += step;

      // If the current value exceeds the target value, set it to the target value and clear the interval
      if (s >= value) {
        setDisplayValue(value);
        clearInterval(t);
      } else {
        // Update the displayed value with the current animated value, rounded down to the nearest integer
        setDisplayValue(Math.floor(s));
      }
    }, 16);

    // Clean up the interval when the component unmounts or when visibility/value changes
    return () => clearInterval(t);
  }, [visibility, value]);

  // Render the animated number, attaching the ref for visibility detection
  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>)
}

export default AnimatedNumber
