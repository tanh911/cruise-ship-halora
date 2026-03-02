import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Sparkles } from '@react-three/drei';

const FoamParticle = ({ position, scale, speed }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            // Move backwards (towards -Z)
            meshRef.current.position.z -= speed;
            // Fade out as it goes back
            meshRef.current.material.opacity = Math.max(0, 0.8 + (meshRef.current.position.z / 30));
            // Reset position when too far
            if (meshRef.current.position.z < -25) {
                meshRef.current.position.z = position[2];
            }
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
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            // Animate texture offset if we had one, but here we'll just jitter scale
            meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -10]}>
            <planeGeometry args={[12, 30]} />
            <meshStandardMaterial color="#fff" transparent opacity={0.2} depthWrite={false} />
        </mesh>
    );
};

const Wake = () => {
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        position: [(Math.random() - 0.5) * 6, Math.random() * 0.2, Math.random() * 5],
        scale: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.1 + 0.1,
    }));

    return (
        <group position={[0, 0.02, 0]}>
            {/* Bow wave */}
            <FoamParticle position={[0, 0.5, 12]} scale={0.8} speed={0.2} />
            <FoamParticle position={[1.5, 0.5, 11]} scale={0.6} speed={0.15} />
            <FoamParticle position={[-1.5, 0.5, 11]} scale={0.6} speed={0.15} />

            {/* Trailing foam */}
            {particles.map((p, i) => (
                <FoamParticle key={i} position={p.position} scale={p.scale} speed={p.speed} />
            ))}

            {/* V-shaped wake trail */}
            <WakeTrail />
        </group>
    );
};

export default Wake;
