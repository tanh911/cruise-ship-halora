import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen = () => {
    const { progress } = useProgress();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setIsVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#050812',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                fontSize: '24px',
                letterSpacing: '10px',
                fontWeight: '200',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                HALORA NOVA
            </div>
            <div style={{
                width: '200px',
                height: '2px',
                background: '#111',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    background: '#d4af37',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease-out',
                    boxShadow: '0 0 10px #d4af37'
                }} />
            </div>
            <div style={{
                color: '#d4af37',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '3px',
                marginTop: '15px'
            }}>
                {Math.round(progress)}% - LOADING VOYAGE
            </div>
        </div>
    );
};

export default LoadingScreen;
