import React, { useEffect, useState, useRef } from 'react';

const RoomUI = ({ onBack, visible, targetView }) => {
    const [hudPos, setHudPos] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight - 100 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setHudPos({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        if (visible) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [visible]);

    if (!visible) return null;

    const onMouseDown = (e) => {
        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - hudPos.x,
            y: e.clientY - hudPos.y
        };
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
            {/* Back Button */}
            <div style={{
                position: 'absolute',
                top: '30px',
                left: '30px',
                pointerEvents: 'auto'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        padding: '12px 24px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid #d4af37',
                        color: '#d4af37',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase',
                        borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#d4af37';
                        e.target.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                        e.target.style.color = '#d4af37';
                    }}
                >
                    ← QUAY LẠI
                </button>
            </div>

            {/* Instruction HUD (Only for Premium) */}
            {targetView === 'premium' && (
                <div
                    onMouseDown={onMouseDown}
                    style={{
                        position: 'absolute',
                        left: `${hudPos.x}px`,
                        top: `${hudPos.y}px`,
                        color: 'rgba(255, 255, 255, 0.9)',
                        background: 'rgba(15, 15, 15, 0.4)',
                        padding: '14px 32px',
                        borderRadius: '100px',
                        backdropFilter: 'blur(25px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '28px',
                        pointerEvents: 'auto',
                        cursor: 'move',
                        userSelect: 'none',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '26px', height: '26px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #d4af37, #f1c40f)',
                            borderRadius: '8px', color: '#000', fontSize: '14px',
                            boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
                        }}>🖱️</div>
                        <span style={{ opacity: 0.8 }}>Kéo để</span> <span style={{ color: '#fff' }}>Xoay</span>
                    </div>

                    <div style={{ height: '18px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '26px', height: '26px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px', color: '#fff', fontSize: '14px'
                        }}>☸️</div>
                        <span style={{ opacity: 0.8 }}>Cuộn để</span> <span style={{ color: '#fff' }}>Tiến / Lùi</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomUI;
