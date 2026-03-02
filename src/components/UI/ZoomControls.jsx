import React from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const ZoomControls = () => {
    const { camera, controls } = useThree();

    const handleZoom = (direction) => {
        // Zoom logic: Move camera closer or further from target
        // Adjust zoom speed/factor as needed
        const zoomFactor = direction === 'in' ? 0.8 : 1.25;

        const target = controls?.target || new THREE.Vector3(0, 0, 0);

        // Calculate new position relative to target
        const offset = camera.position.clone().sub(target);
        offset.multiplyScalar(zoomFactor);

        // Clamp min/max distance if needed (optional)
        const newDist = offset.length();
        if (newDist < 5 && direction === 'in') return; // Too close
        if (newDist > 100 && direction === 'out') return; // Too far

        camera.position.copy(target).add(offset);
        controls?.update(); // Ensure controls are updated
    };

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'auto'
            }}>
                <button
                    onClick={() => handleZoom('in')}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(5px)',
                        color: '#fff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                    +
                </button>
                <button
                    onClick={() => handleZoom('out')}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(5px)',
                        color: '#fff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                    −
                </button>
            </div>
        </Html>
    );
};

export default ZoomControls;
