import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Bird = ({ position, speed, size, delay }) => {
    const meshRef = useRef();
    const wingLRef = useRef();
    const wingRRef = useRef();

    useFrame((state) => {
        if (!meshRef.current) return;

        const t = state.clock.getElapsedTime() + delay;

        // Flight movement - slow forward and subtle oscillation
        meshRef.current.position.z -= speed;
        meshRef.current.position.y += Math.sin(t * 2) * 0.05;
        meshRef.current.position.x += Math.cos(t * 1) * 0.05;

        // Wing flap animation
        const flap = Math.sin(t * 10) * 0.8;
        if (wingLRef.current) wingLRef.current.rotation.z = flap;
        if (wingRRef.current) wingRRef.current.rotation.z = -flap;

        // Simple wrapping
        if (meshRef.current.position.z < -600) {
            meshRef.current.position.z = 600;
        }
    });

    return (
        <group ref={meshRef} position={position}>
            {/* Body */}
            <mesh scale={[size * 0.2, size * 0.1, size * 0.5]}>
                <boxGeometry />
                <meshStandardMaterial color="#222" />
            </mesh>
            {/* Left Wing */}
            <group ref={wingLRef} position={[-size * 0.1, 0, 0]}>
                <mesh position={[-size * 0.5, 0, 0]} scale={[size, size * 0.05, size * 0.3]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>
            {/* Right Wing */}
            <group ref={wingRRef} position={[size * 0.1, 0, 0]}>
                <mesh position={[size * 0.5, 0, 0]} scale={[size, size * 0.05, size * 0.3]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>
        </group>
    );
};

const Birds = ({ count = 20 }) => {
    const birds = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 800,
                80 + Math.random() * 40, // High in the sky
                (Math.random() - 0.5) * 1000
            ],
            speed: 0.1 + Math.random() * 0.2,
            size: 1 + Math.random() * 2,
            delay: Math.random() * 10
        }));
    }, [count]);

    return (
        <group>
            {birds.map((props, i) => (
                <Bird key={i} {...props} />
            ))}
        </group>
    );
};

export default Birds;
