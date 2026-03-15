import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const FoamParticle = ({ position, scale, speedMultiplier = 1 }) => {
    const meshRef = useRef();
    // Default base speed that feels good at current scrollSpeed
    const baseSpeed = 0.4;

    useFrame((state) => {
        if (meshRef.current) {
            // Move backward relative to ship
            meshRef.current.position.z -= baseSpeed * speedMultiplier;

            // Reset position when too far back
            if (meshRef.current.position.z < -40) {
                meshRef.current.position.z = position[2];
            }

            // Fade out
            meshRef.current.material.opacity = Math.max(0, 0.6 + (meshRef.current.position.z / 30));
        }
    });

    return (
        <mesh position={position} scale={scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="white" transparent opacity={0.6} flatShading />
        </mesh>
    );
};

const WakeTrail = () => {
    return (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -30]}>
            {/* Main Center Trail */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[15, 120]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} />
            </mesh>
        </group>
    );
};

const Wake = ({ scrollSpeed = 0.15 }) => {
    // Sync foam physics with the visual speed of the environment
    const speedFactor = scrollSpeed * 3.0; // Scale it to feel "right"

    const sternParticles = useMemo(() =>
        Array.from({ length: 30 }).map((_, i) => ({
            position: [(Math.random() - 0.5) * 10, Math.random() * 0.5, Math.random() * 20],
            scale: Math.random() * 1.2 + 0.3,
            speedMultiplier: (Math.random() * 0.5 + 0.5) * speedFactor,
        })), [speedFactor]);

    return (
        <group position={[0, -0.9, 0]}>
            {/* Bow Spray - Left */}
            <FoamParticle position={[-4, 1, 38]} scale={1.5} speedMultiplier={speedFactor} />
            {/* Bow Spray - Right */}
            <FoamParticle position={[4, 1, 38]} scale={1.5} speedMultiplier={speedFactor} />

            {/* Stern Churn */}
            {sternParticles.map((p, i) => (
                <FoamParticle key={i} position={p.position} scale={p.scale} speedMultiplier={p.speedMultiplier} />
            ))}

            <WakeTrail />
        </group>
    );
};

// Add useMemo to imports if not there
import { useMemo } from 'react';
export default Wake;
