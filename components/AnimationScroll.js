import React, { useRef, useEffect, useState } from "react";
import  styles from "../styles/AnimationScroll.css"; // ton CSS

export default function AnimationScroll({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current); // stop observer si tu veux que ça s’anime une seule fois
        }
      },
      { threshold: 0.2 } // déclenche quand 20% du composant est visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`fade-in-section ${isVisible ? "is-visible" : ""}`}>
      {children}
    </div>
  );
}
