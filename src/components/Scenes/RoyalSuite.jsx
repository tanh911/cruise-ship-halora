import React, { useRef, useEffect } from 'react';
import { useGLTF, OrbitControls, Environment, useThree } from '@react-three/drei';

const CameraSetup = () => {
    const { camera, controls } = useThree();
    useEffect(() => {
        camera.position.set(8, 5, 8);
        camera.lookAt(0, 0, 0);
        if (controls) controls.target.set(0, 0, 0);
    }, [camera, controls]);
    return null;
};

const RoyalSuite = () => {
    return (
        <group>
            <CameraSetup />
            {/* Placeholder for Room Model */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 5, 10]} />
                <meshStandardMaterial color="#f5f5dc" side={2} /> {/* Beige/Cream walls */}
            </mesh>

            <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#8b4513" /> {/* Wood floor */}
            </mesh>

            {/* Furniture Placeholders */}
            <mesh position={[0, -1.5, -2]}>
                <boxGeometry args={[4, 2, 4]} />
                <meshStandardMaterial color="#ffffff" /> {/* Bed */}
            </mesh>

            <ambientLight intensity={0.5} />
            <pointLight position={[0, 2, 0]} intensity={1} />
            <Environment preset="apartment" />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} enablePan={false} />
        </group>
    );
};

export default RoyalSuite;
