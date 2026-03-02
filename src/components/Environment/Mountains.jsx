import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Mountains = () => {
    // Generate random mountains
    const mountainsData = useMemo(() => {
        const temp = [];
        const count = 20; // More mountains for better effect
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 400; // Wide spread
            const z = (Math.random() - 0.5) * 400 - 100; // Push them back a bit more
            const scale = 30 + Math.random() * 50;
            const height = 20 + Math.random() * 40; // Lower height for round hills
            temp.push({
                position: new THREE.Vector3(x, -5, z), // Fixed position
                scale: [scale, height, scale],
                rotation: [0, Math.random() * Math.PI, 0],
            });
        }
        return temp;
    }, []);

    return (
        <group position={[0, -10, 0]}> {/* Sunk to hide bottom of spheres */}
            {mountainsData.map((data, i) => (
                <mesh key={i} position={data.position} rotation={data.rotation} scale={data.scale}>
                    {/* Sphere for round/curved shape */}
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color="#1e293b"
                        roughness={0.9}
                        emissive="#000000"
                    />
                </mesh>
            ))}
        </group>
    );
};

export default Mountains;
