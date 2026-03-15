import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ZoomControls = () => {
    const { camera, controls } = useThree();

    const handleZoom = (direction) => {
        const zoomFactor = direction === 'in' ? 0.8 : 1.25;
        const target = controls?.target || new THREE.Vector3(0, 0, 0);
        const offset = camera.position.clone().sub(target);
        offset.multiplyScalar(zoomFactor);
        const newDist = offset.length();
        if (newDist < 5 && direction === 'in') return;
        if (newDist > 100 && direction === 'out') return;
        camera.position.copy(target).add(offset);
        controls?.update();
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 999
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
                    justifyContent: 'center'
                }}
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
                    justifyContent: 'center'
                }}
            >
                −
            </button>
        </div>
    );
};

export default ZoomControls;
