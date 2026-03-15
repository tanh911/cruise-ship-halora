import React, { useRef, useEffect } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const CameraSetup = () => {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
    }, [camera]);
    return null;
};

const SunDeck = () => {
    const { camera, gl } = useThree();

    return (
        <group>
            <CameraSetup />

            {/* Deck Floor (Placeholder) */}
            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#d2b48c" />
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
            <orbitControls args={[camera, gl.domElement]} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enablePan={false} />
        </group>
    );
};

export default SunDeck;
