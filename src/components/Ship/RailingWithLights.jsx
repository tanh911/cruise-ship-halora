import React, { useMemo } from 'react';
import * as THREE from 'three';

const RailingWithLights = ({ length = 10, count = 10, height = 1.2, color = '#d4af37' }) => {
    // Generate positions for posts
    const posts = useMemo(() => {
        const items = [];
        const step = length / (count - 1);
        for (let i = 0; i < count; i++) {
            items.push(i * step - length / 2);
        }
        return items;
    }, [length, count]);

    return (
        <group>
            {/* Top Handrail */}
            <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, length, 8]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Middle Rail */}
            <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, length, 8]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Posts with Lights */}
            {posts.map((x, i) => (
                <group key={i} position={[x, height / 2, 0]}>
                    {/* Post */}
                    <mesh>
                        <cylinderGeometry args={[0.04, 0.04, height, 8]} />
                        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Light Fixture on Top */}
                    <mesh position={[0, height / 2 + 0.1, 0]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial
                            color="#fff"
                            emissive="#ffaa00"
                            emissiveIntensity={2}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

export default RailingWithLights;
