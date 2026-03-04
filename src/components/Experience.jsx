import React, { useEffect, useRef, useState, Suspense } from 'react';
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
const BaseScene = ({ targetView, hideShip }) => {
    const controlsRef = useRef();
    const [targetPos, setTargetPos] = useState(new THREE.Vector3(67.5, 30, 25.5));
    const [targetLookAt, setTargetLookAt] = useState(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        // Chỉ chạy logic camera nếu KHÔNG ở trong phòng
        if (hideShip) return;

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
    }, [targetView, hideShip]);

    // Reset FOV khi quay về toàn cảnh thuyền
    const { camera } = useThree();
    useEffect(() => {
        if (!hideShip && (targetView === 'default' || targetView === 'suite' || targetView === 'sundeck')) {
            camera.fov = 70;
            camera.updateProjectionMatrix();
        }
    }, [targetView, camera, hideShip]);

    useFrame((state, delta) => {
        // Chỉ lerp camera nếu không ở trong phòng
        if (hideShip) return;

        state.camera.position.lerp(targetPos, delta * 2);
        if (controlsRef.current) {
            controlsRef.current.target.lerp(targetLookAt, delta * 2);
            controlsRef.current.update();
        }
    });

    return (
        <>
            {/* Chỉ bật OrbitControls của BaseScene khi không ở trong phòng */}
            {!hideShip && (
                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.1}
                    enableZoom={false}
                    enablePan={false}
                />
            )}

            {/* Ship Model - Hidden when inside room to save resources */}
            <group position={[0, 1, 5]} visible={!hideShip}>
                <Suspense fallback={null}>
                    <Ship />
                </Suspense>
            </group>
        </>
    );
};

const Experience = ({ targetView, setTargetView }) => {
    const isInsideRoom = targetView === 'testroom' || targetView === 'premiumtripleroom';

    return (
        <>
            {/* STABLE GLOBAL ENVIRONMENT - Stays put, no remounting */}
            <SkyBox />
            <Water />
            <Environment preset="sunset" />

            <fog attach="fog" args={['#1a0a2e', 80, 600]} />

            <ambientLight intensity={0.4} color="#ff9966" />
            <directionalLight
                position={[150, 20, 150]}
                intensity={2.5}
                color="#ffccaa"
                castShadow={true}
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0003}
                shadow-normalBias={0.02}
            />
            <directionalLight position={[-50, 10, -50]} intensity={0.5} color="#8899bb" />
            <directionalLight position={[-80, 30, 100]} intensity={1.2} color="#ffddaa" />
            <hemisphereLight skyColor="#ffccaa" groundColor="#003366" intensity={0.3} />

            <EffectComposer disableNormalPass multisampling={0}>
                <Bloom luminanceThreshold={0.8} intensity={0.5} radius={0.6} mipmapBlur />
            </EffectComposer>

            {/* BASE SCENE / SHIP - Controlled by visibility */}
            {/* We don't hide BaseScene entirely, just the Ship inside it */}
            <BaseScene targetView={isInsideRoom ? 'default' : targetView} hideShip={isInsideRoom} />

            {/* ROOMS - No local Suspense here so App's startTransition can hold the previous view */}
            {targetView === 'testroom' && <TestRoom />}
            {targetView === 'premiumtripleroom' && (
                <PremiumTripleRoom onExit={() => setTargetView('default')} />
            )}
        </>
    );
};

export default Experience;
