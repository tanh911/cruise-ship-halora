import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen = () => {
    const { active, progress, loaded, total } = useProgress();
    const [isFinished, setIsFinished] = useState(false);
    const [shouldUnmount, setShouldUnmount] = useState(false);

    // Calculate a safe percentage to avoid NaN or Infinity if total is 0
    let safeProgress = 0;
    if (total > 0) {
        safeProgress = (loaded / total) * 100;
    }

    // Fallback to the provided progress
    if (Number.isFinite(progress) && progress > safeProgress) {
        safeProgress = progress;
    }

    // Strictly clamp between 0 and 100
    safeProgress = Math.min(Math.max(safeProgress, 0), 100);

    useEffect(() => {
        // Chỉ kích hoạt trạng thái "Xong" một lần duy nhất.
        // Khi đã xong (isFinished = true), chúng ta không bao giờ quay lại trạng thái loading nữa,
        // kể cả khi có tài nguyên chạy ngầm khởi động lại useProgress.
        if (!isFinished && (safeProgress >= 100 || (!active && total > 0))) {
            setIsFinished(true);
            const timer = setTimeout(() => {
                setShouldUnmount(true);
            }, 1000); // Đợi 1s (bao gồm 0.8s transition mờ dần) rồi gỡ bỏ hoàn toàn
            return () => clearTimeout(timer);
        }
    }, [safeProgress, active, total, isFinished]);

    if (shouldUnmount) return null;

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
            opacity: isFinished ? 0 : 1
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
