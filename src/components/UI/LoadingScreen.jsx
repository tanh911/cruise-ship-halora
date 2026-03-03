import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen = () => {
    const { active, progress, loaded, total } = useProgress();
    const [hidden, setHidden] = useState(false);

    // Calculate a safe percentage to avoid NaN or Infinity if total is 0
    let safeProgress = 0;
    if (total > 0) {
        safeProgress = (loaded / total) * 100;
    } else if (!active) {
        safeProgress = 100; // If not active and total is 0, we are done
    }

    // Fallback to the provided progress if it's a valid number 
    // (sometimes drei calculates it better based on bytes)
    if (Number.isFinite(progress) && progress > 0) {
        safeProgress = progress;
    }

    // Strictly clamp between 0 and 100
    safeProgress = Math.min(Math.max(safeProgress, 0), 100);

    useEffect(() => {
        // If Drei says it's not active anymore, or we hit 100%
        if (!active || safeProgress >= 100) {
            const timer = setTimeout(() => setHidden(true), 800); // 0.8s fade out
            return () => clearTimeout(timer);
        } else {
            setHidden(false);
        }
    }, [active, safeProgress]);

    if (hidden) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#050510',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            transition: 'opacity 0.8s ease-in-out',
            pointerEvents: 'none',
            opacity: (!active || safeProgress >= 100) ? 0 : 1
        }}>
            <div style={{
                width: '300px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    color: '#d4af37',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    letterSpacing: '5px',
                    marginBottom: '30px',
                    textTransform: 'uppercase'
                }}>
                    Luxury Cruise 3D
                </h1>

                <div style={{
                    width: '100%',
                    height: '2px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        background: '#d4af37',
                        width: `${safeProgress}%`,
                        transition: 'width 0.3s ease-out',
                        boxShadow: '0 0 10px #d4af37'
                    }} />
                </div>

                <div style={{
                    color: '#d4af37',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '3px',
                    marginTop: '15px',
                    opacity: 0.6
                }}>
                    ĐANG TẢI TRẢI NGHIỆM {Math.round(safeProgress)}%
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
