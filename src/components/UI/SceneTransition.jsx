import React, { useState, useEffect, useCallback } from 'react';

/**
 * SceneTransition: Hiệu ứng chuyển cảnh fade-in → hold → fade-out
 * 
 * Props:
 * - isTransitioning: boolean - bắt đầu transition khi true
 * - onMidpoint: () => void - gọi khi màn hình đã tối hoàn toàn (để swap scene)
 * - onComplete: () => void - gọi khi transition kết thúc
 * - noLoader: boolean - ẩn vòng xoay và text loading, chuyển cảnh nhanh hơn
 */
const SceneTransition = ({ isTransitioning, onMidpoint, onComplete, noLoader }) => {
    const [visible, setVisible] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        if (!isTransitioning) return;

        // Phase 1: Show overlay and fade in
        setVisible(true);
        setOpacity(0);

        // Timings based on mode
        const fadeInDuration = noLoader ? 300 : 700;
        const holdDuration = noLoader ? 200 : 1300; // Total stay at full opacity
        const fadeOutDuration = noLoader ? 400 : 900;

        // Small delay to ensure DOM renders before opacity transition starts
        const startTimer = setTimeout(() => {
            setOpacity(1);
        }, 10);

        // Phase 2: After fade-in completes, call midpoint
        const midpointTimer = setTimeout(() => {
            if (!noLoader) setShowLoader(true);
            onMidpoint?.();
        }, fadeInDuration);

        // Phase 3: Start fade out
        const fadeOutTimer = setTimeout(() => {
            setShowLoader(false);
            setOpacity(0);
        }, fadeInDuration + holdDuration);

        // Phase 4: Hide and cleanup
        const cleanupTimer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, fadeInDuration + holdDuration + fadeOutDuration);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(midpointTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(cleanupTimer);
        };
    }, [isTransitioning, noLoader, onMidpoint, onComplete]);

    if (!visible) return null;

    const transitionTime = noLoader ? '0.3s' : '0.7s';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#0a0a1a',
                opacity: opacity,
                transition: `opacity ${transitionTime} ease`,
                zIndex: 99999,
                pointerEvents: 'all',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px'
            }}
        >
            {!noLoader && (
                <>
                    {/* Loading spinner */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(212, 175, 55, 0.2)',
                        borderTopColor: '#d4af37',
                        borderRadius: '50%',
                        animation: 'scene-spin 1s linear infinite',
                        opacity: showLoader ? 1 : 0,
                        transition: 'opacity 0.3s'
                    }} />
                    <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                        letterSpacing: '3px',
                        color: 'rgba(212, 175, 55, 0.8)',
                        textTransform: 'uppercase',
                        opacity: showLoader ? 1 : 0,
                        transition: 'opacity 0.3s'
                    }}>
                        Đang tải...
                    </div>
                </>
            )}
            <style>{`
                @keyframes scene-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SceneTransition;
