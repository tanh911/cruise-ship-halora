import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGerstnerDisplacement } from '../../utils/GerstnerWaves';

// Reusable Light Component
const DeckLight = ({ position }) => (
    <group position={position}>
        <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
                color="#fff"
                emissive="#ffaa00"
                emissiveIntensity={3}
                toneMapped={false}
            />
        </mesh>
        <pointLight intensity={0.5} distance={3} color="#ffaa00" decay={2} />
    </group>
);

const Ship = () => {
    const { scene } = useGLTF('./models/cruise-ship-opt.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const shipRef = useRef();
    const shipModelRotation = [0, (75 * (-Math.PI / 180)), 0];

    // Buoyancy state
    const targetPos = useMemo(() => new THREE.Vector3(), []);
    const targetQuat = useMemo(() => new THREE.Quaternion(), []);

    React.useLayoutEffect(() => {
        if (scene) {
            const box = new THREE.Box3().setFromObject(scene);
            const center = box.getCenter(new THREE.Vector3());
            scene.position.x = -center.x;
            scene.position.z = -center.z;
            scene.position.y = -box.min.y;

            // Enhance materials for realistic look
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if (child.material) {
                        const mat = child.material;
                        const name = (child.name || '').toLowerCase();

                        // Environment reflections
                        mat.envMapIntensity = 1.5;
                        mat.needsUpdate = true;

                        // Glass / windows — highly reflective
                        if (name.includes('glass') || name.includes('window') || name.includes('vitre')) {
                            mat.metalness = 0.9;
                            mat.roughness = 0.05;
                            mat.transparent = true;
                            mat.opacity = 0.4;
                            mat.envMapIntensity = 2.5;
                        }
                        // Metal / railing / hull
                        else if (name.includes('metal') || name.includes('rail') || name.includes('hull') || name.includes('steel')) {
                            mat.metalness = 0.8;
                            mat.roughness = 0.3;
                        }
                        // Deck / wood
                        else if (name.includes('deck') || name.includes('wood') || name.includes('floor')) {
                            mat.metalness = 0.0;
                            mat.roughness = 0.7;
                        }
                        // Default: moderate quality
                        else {
                            mat.metalness = Math.min(mat.metalness + 0.1, 0.5);
                            mat.roughness = Math.max(mat.roughness - 0.1, 0.2);
                        }

                        // Soften pure blacks
                        if (mat.color && mat.color.r < 0.1 && mat.color.g < 0.1 && mat.color.b < 0.1) {
                            mat.color.set('#1a1a2e');
                        }
                    }
                }
            });
        }
    }, [scene]);

    useFrame((state) => {
        if (shipRef.current) {
            const t = state.clock.getElapsedTime();

            // Get wave data at ship center (0, 0 in local space)
            const { y, normal } = getGerstnerDisplacement(0, 0, t);

            // Apply buoyancy (vertical position)
            // Dampen y displacement and sink further (offset to -0.65)
            shipRef.current.position.y = (y * 0.3);

            // Apply orientation (tilt) based on surface normal
            const up = new THREE.Vector3(0, 1, 0);

            // Dampen the rocking by blending normal with vertical up (0.2 factor for subtle motion)
            const dampenedNormal = new THREE.Vector3().lerpVectors(up, normal, 0.2).normalize();
            targetQuat.setFromUnitVectors(up, dampenedNormal);

            // Smoothly lerp the rotation for stability
            shipRef.current.quaternion.slerp(targetQuat, 0.05);

            // Add subtle engine vibration (keep as is for detail)
            const vibration = Math.sin(t * 30) * 0.0005;
            shipRef.current.position.y += vibration;
        }
    });

    return (
        <group ref={shipRef}>
            {/* The Ship Model */}
            <primitive object={scene} position={[0, 0, 0]} scale={1.0} rotation={shipModelRotation} />

            {/* Đèn Deck cơ bản */}
            <DeckLight position={[0, 10, -18]} />
            <DeckLight position={[0, 12, 10]} />
        </group>
    );
};

useGLTF.preload('./models/cruise-ship-opt.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

export default Ship;