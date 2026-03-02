import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WaterStreaks = () => {
    const count = 1000;
    const mesh = useRef();
    const dummy = new THREE.Object3D();

    // Create random particles
    const particles = useRef(new Array(count).fill().map(() => ({
        position: [
            (Math.random() - 0.5) * 500, // Wide spread X
            0,
            (Math.random() - 0.5) * 500  // Wide spread Z
        ],
        speed: 5 + Math.random() * 10, // FAST speed
        scale: 20 + Math.random() * 30, // Long streaks
    })));

    useFrame(() => {
        particles.current.forEach((particle, i) => {
            let [x, y, z] = particle.position;

            // Move along Z axis (Forward/Backward)
            // Ship faces -Z (Forward). Water should move +Z (Backward relative to ship).

            z += particle.speed;

            if (z > 250) z = -250; // Loop from far ahead to behind

            // particle.position[0] = x; // Static X
            particle.position[2] = z;   // Dynamic Z

            dummy.position.set(x, -0.4, z); // Raised above water surface (-0.5)
            dummy.scale.set(0.1, 0.1, particle.scale); // Scale along Z (Lengthwise)
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <planeGeometry args={[1, 1]} rotation={[-Math.PI / 2, 0, 0]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
};

export default WaterStreaks;
