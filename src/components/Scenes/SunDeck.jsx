import React, { useRef, useEffect } from 'react';
import { useGLTF, OrbitControls, Environment, Sky, useThree } from '@react-three/drei';

const CameraSetup = () => {
    const { camera, controls } = useThree();
    useEffect(() => {
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        if (controls) controls.target.set(0, 0, 0);
    }, [camera, controls]);
    return null;
};

const SunDeck = () => {
    // 1. Copy your 3D file to: public/models/sundeck.glb
    // 2. Uncomment the line below:
    // const { scene } = useGLTF('./models/sundeck.glb');

    return (
        <group>
            <CameraSetup />

            {/* 3. If model exists, render it: */}
            {/* <primitive object={scene} /> */}

            {/* Deck Floor (Placeholder) */}
            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#d2b48c" /> {/* Teak wood */}
            </mesh>

            {/* Pool Water */}
            <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8, 4]} />
                <meshStandardMaterial color="#00ffff" transparent opacity={0.8} />
            </mesh>

            {/* Rails */}
            <mesh position={[0, 0, -10]}>
                <boxGeometry args={[20, 2, 0.5]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} />
            <Environment preset="sunset" />
            <Sky sunPosition={[10, 20, 10]} />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enablePan={false} />
        </group>
    );
};

export default SunDeck;
