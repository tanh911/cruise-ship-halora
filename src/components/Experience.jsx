import React, { useEffect, useRef, useState, Suspense, useCallback } from 'react';
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
import PremiumTripleRoom from './Scenes/PremiumTripleRoom';

// Room model is loaded lazily when user enters the room

// Separate component for the ocean scene to isolate hooks
const DEFAULT_CAM_POS = new THREE.Vector3(67.5, 30, 25.5);
const DEFAULT_LOOK_AT = new THREE.Vector3(0, 0, 0);

const BaseScene = ({ targetView, hideShip }) => {
    const controlsRef = useRef();
    const [targetPos, setTargetPos] = useState(new THREE.Vector3(67.5, 30, 25.5));
    const [targetLookAt, setTargetLookAt] = useState(new THREE.Vector3(0, 0, 0));
    const wasInsideRoom = useRef(false);

    const { camera } = useThree();

    useEffect(() => {
        // Detect khi vừa rời phòng → snap camera ngay lập tức
        if (wasInsideRoom.current && !hideShip) {
            camera.position.copy(DEFAULT_CAM_POS);
            camera.fov = 70;
            camera.updateProjectionMatrix();
            if (controlsRef.current) {
                controlsRef.current.target.copy(DEFAULT_LOOK_AT);
                controlsRef.current.update();
            }
        }
        wasInsideRoom.current = hideShip;
    }, [hideShip, camera]);

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
                <Ship />
            </group>
        </>
    );
};

const Experience = ({ targetView, setTargetView, onReady }) => {
    const isInsideRoom = targetView === 'testroom' || targetView === 'premiumtripleroom';

    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    return (
        <>
            {/* STABLE GLOBAL ENVIRONMENT - Hidden when inside room */}
            {!isInsideRoom && <SkyBox />}
            {!isInsideRoom && <Water />}

            {/* Tắt fog khi ở trong phòng để tránh che phủ cảnh phòng */}
            {!isInsideRoom && <fog attach="fog" args={['#1a0a2e', 80, 600]} />}

            <ambientLight intensity={isInsideRoom ? 0.8 : 0.4} color="#ff9966" />
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

            {/* BASE SCENE / CAMERA - Must stay mounted to provide stability */}
            <BaseScene targetView={isInsideRoom ? 'default' : targetView} hideShip={isInsideRoom} />

            {/* ROOMS - PremiumTripleRoom mounted directly (not lazy) for reliable rendering */}
            {targetView === 'premiumtripleroom' && (
                <PremiumTripleRoom onExit={() => setTargetView('default')} />
            )}

            <Suspense fallback={null}>
                {/* Environment and Models can suspend - Background stays stable */}
                <Environment preset="sunset" />

                {/* ROOMS */}
                {targetView === 'testroom' && <TestRoom />}
            </Suspense>

            {!isInsideRoom && (
                <EffectComposer disableNormalPass multisampling={0}>
                    <Bloom luminanceThreshold={0.8} intensity={0.5} radius={0.6} mipmapBlur />
                </EffectComposer>
            )}
        </>
    );
};

export default Experience;
