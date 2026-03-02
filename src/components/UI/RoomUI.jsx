import React from 'react';

const RoomUI = ({ onBack, visible }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '30px',
            left: '30px',
            zIndex: 9998,
            pointerEvents: 'auto'
        }}>
            <button
                onClick={onBack}
                style={{
                    padding: '12px 24px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #d4af37',
                    color: '#d4af37',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    fontWeight: '600',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#d4af37';
                    e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.target.style.color = '#d4af37';
                }}
            >
                ← QUAY LẠI
            </button>
        </div>
    );
};

export default RoomUI;
