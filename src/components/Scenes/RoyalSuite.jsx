import React, { useEffect } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const CameraSetup = () => {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(8, 5, 8);
        camera.lookAt(0, 0, 0);
    }, [camera]);
    return null;
};

const RoyalSuite = () => {
    const { camera, gl } = useThree();

    return (
        <group>
            <CameraSetup />
            {/* Placeholder for Room Model */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 5, 10]} />
                <meshStandardMaterial color="#f5f5dc" side={2} />
            </mesh>

            <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#8b4513" />
            </mesh>

            <mesh position={[0, -1.5, -2]}>
                <boxGeometry args={[4, 2, 4]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            <ambientLight intensity={0.5} />
            <pointLight position={[0, 2, 0]} intensity={1} />
            <orbitControls args={[camera, gl.domElement]} minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} enablePan={false} />
        </group>
    );
};

export default RoyalSuite;
