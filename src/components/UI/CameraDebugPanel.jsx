import React, { useState, useCallback } from 'react';

const CameraDebugPanel = () => {
    const [pos, setPos] = useState({ x: 1.5, y: -0.5, z: 6 });
    const [lookAt, setLookAt] = useState({ x: 2, y: 2, z: 3.5 });
    const [fov, setFov] = useState(90);

    const updatePos = useCallback((axis, value) => {
        const newPos = { ...pos, [axis]: value };
        setPos(newPos);
        if (window.__setCameraPos) {
            window.__setCameraPos(newPos.x, newPos.y, newPos.z);
        }
    }, [pos]);

    const updateLookAt = useCallback((axis, value) => {
        const newLookAt = { ...lookAt, [axis]: value };
        setLookAt(newLookAt);
        if (window.__setCameraLookAt) {
            window.__setCameraLookAt(newLookAt.x, newLookAt.y, newLookAt.z);
        }
    }, [lookAt]);

    const updateFov = useCallback((value) => {
        setFov(value);
        if (window.__setCameraFov) {
            window.__setCameraFov(value);
        }
    }, []);

    const sliderStyle = { width: '100%', margin: '2px 0', accentColor: '#d4af37' };
    const labelStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#d4af37', fontFamily: 'monospace' };

    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px',
            background: 'rgba(0,0,0,0.9)', border: '1px solid #d4af37',
            borderRadius: '8px', padding: '15px', width: '280px',
            color: 'white', fontFamily: 'monospace', fontSize: '11px',
            zIndex: 99999, backdropFilter: 'blur(10px)',
            pointerEvents: 'auto'
        }}>
            <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', fontSize: '13px' }}>
                CAMERA DEBUG
            </div>

            <div style={labelStyle}><span>Pos X: {pos.x.toFixed(1)}</span></div>
            <input type="range" min="-20" max="20" step="0.5" value={pos.x}
                onChange={(e) => updatePos('x', parseFloat(e.target.value))} style={sliderStyle} />

            <div style={labelStyle}><span>Pos Y: {pos.y.toFixed(1)}</span></div>
            <input type="range" min="-20" max="20" step="0.5" value={pos.y}
                onChange={(e) => updatePos('y', parseFloat(e.target.value))} style={sliderStyle} />

            <div style={labelStyle}><span>Pos Z: {pos.z.toFixed(1)}</span></div>
            <input type="range" min="-20" max="20" step="0.5" value={pos.z}
                onChange={(e) => updatePos('z', parseFloat(e.target.value))} style={sliderStyle} />

            <div style={labelStyle}><span>FOV: {fov}</span></div>
            <input type="range" min="20" max="120" step="5" value={fov}
                onChange={(e) => updateFov(parseInt(e.target.value))} style={sliderStyle} />

            <div style={{ borderTop: '1px solid #333', marginTop: '8px', paddingTop: '8px' }}>
                <div style={{ color: '#888', marginBottom: '5px' }}>LookAt Target:</div>

                <div style={labelStyle}><span>LookAt X: {lookAt.x.toFixed(1)}</span></div>
                <input type="range" min="-20" max="20" step="0.5" value={lookAt.x}
                    onChange={(e) => updateLookAt('x', parseFloat(e.target.value))} style={sliderStyle} />

                <div style={labelStyle}><span>LookAt Y: {lookAt.y.toFixed(1)}</span></div>
                <input type="range" min="-20" max="20" step="0.5" value={lookAt.y}
                    onChange={(e) => updateLookAt('y', parseFloat(e.target.value))} style={sliderStyle} />

                <div style={labelStyle}><span>LookAt Z: {lookAt.z.toFixed(1)}</span></div>
                <input type="range" min="-20" max="20" step="0.5" value={lookAt.z}
                    onChange={(e) => updateLookAt('z', parseFloat(e.target.value))} style={sliderStyle} />
            </div>

            <div style={{
                marginTop: '10px', padding: '8px',
                background: 'rgba(212,175,55,0.15)', borderRadius: '4px',
                textAlign: 'center', fontSize: '10px', color: '#d4af37',
                userSelect: 'all', cursor: 'text'
            }}>
                position: [{pos.x}, {pos.y}, {pos.z}]<br />
                lookAt: [{lookAt.x}, {lookAt.y}, {lookAt.z}]<br />
                fov: {fov}
            </div>
        </div>
    );
};

export default CameraDebugPanel;
