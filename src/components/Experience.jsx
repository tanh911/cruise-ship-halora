import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls, Environment, Sky, useGLTF } from '@react-three/drei';
import SkyBox from './Environment/SkyBox';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Ship from './Ship/Ship';
import Water from './Environment/Water';
import Wake from './Environment/Wake';
import ZoomControls from './UI/ZoomControls';

const TestRoom = React.lazy(() => import('./Scenes/TestRoom'));
const PremiumTripleRoom = React.lazy(() => import('./Scenes/PremiumTripleRoom'));

// Room model is loaded lazily when user enters the room

// Separate component for the ocean scene to isolate hooks
const BaseScene = ({ targetView }) => {
    const controlsRef = useRef();
    const [targetPos, setTargetPos] = useState(new THREE.Vector3(67.5, 30, 25.5));
    const [targetLookAt, setTargetLookAt] = useState(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        if (targetView === 'suite') {
            setTargetPos(new THREE.Vector3(15, 2, 5));
            setTargetLookAt(new THREE.Vector3(0, 0, 5));
        } else if (targetView === 'sundeck') {
            setTargetPos(new THREE.Vector3(-10, 10, -5));
            setTargetLookAt(new THREE.Vector3(0, 0, 0));
        } else {
            setTargetPos(new THREE.Vector3(67.5, 30, 25.5));
            setTargetLookAt(new THREE.Vector3(0, 0, 0));
        }
    }, [targetView]);

    // Reset FOV khi quay về toàn cảnh thuyền
    const { camera } = useThree();
    useEffect(() => {
        if (targetView === 'default' || targetView === 'suite' || targetView === 'sundeck') {
            camera.fov = 70;
            camera.updateProjectionMatrix();
        }
    }, [targetView, camera]);

    useFrame((state, delta) => {
        state.camera.position.lerp(targetPos, delta * 2);
        if (controlsRef.current) {
            controlsRef.current.target.lerp(targetLookAt, delta * 2);
            controlsRef.current.update();
        }
    });

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                makeDefault
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2.1}
                enableZoom={false}
                enablePan={false}
            />

            <SkyBox />
            <Environment preset="sunset" />

            {/* Atmospheric fog for depth */}
            <fog attach="fog" args={['#1a0a2e', 80, 600]} />

            {/* Main sun light */}
            <ambientLight intensity={0.4} color="#ff9966" />
            <directionalLight
                position={[150, 20, 150]}
                intensity={2.5}
                color="#ffccaa"
                castShadow={true}
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0003}
                shadow-normalBias={0.02}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={100}
                shadow-camera-near={1}
                shadow-camera-far={500}
            />
            {/* Fill light (cooler) */}
            <directionalLight
                position={[-50, 10, -50]}
                intensity={0.5}
                color="#8899bb"
            />
            {/* Rim/backlight for dramatic silhouette */}
            <directionalLight
                position={[-80, 30, 100]}
                intensity={1.2}
                color="#ffddaa"
            />
            {/* Warm bounce light from water */}
            <hemisphereLight
                skyColor="#ffccaa"
                groundColor="#003366"
                intensity={0.3}
            />

            <group position={[0, 1, 5]}>
                <Ship />
            </group>

            <Water />

            <EffectComposer disableNormalPass multisampling={0}>
                <Bloom
                    luminanceThreshold={0.8}
                    intensity={0.5}
                    radius={0.6}
                    mipmapBlur
                />
            </EffectComposer>

        </>
    );
};

// Experience is now a simple router - no hooks, no conflicts
const Experience = ({ targetView, setTargetView }) => {
    if (targetView === 'testroom') {
        return <TestRoom />;
    }
    if (targetView === 'premiumtripleroom') {
        return <PremiumTripleRoom onExit={() => setTargetView('default')} />;
    }
    return <BaseScene targetView={targetView} />;
};

export default Experience;
