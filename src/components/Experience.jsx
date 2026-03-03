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

            <SkyBox />

            {!hideShip && (
                <>
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
                </>
            )}

            {!hideShip && (
                <group position={[0, 1, 5]}>
                    <Suspense fallback={null}>
                        <Ship />
                    </Suspense>
                </group>
            )}

            <Water />

            {!hideShip && (
                <EffectComposer disableNormalPass multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.8}
                        intensity={0.5}
                        radius={0.6}
                        mipmapBlur
                    />
                </EffectComposer>
            )}

        </>
    );
};

// Experience is now a simple router - no hooks, no conflicts
const Experience = ({ targetView, setTargetView }) => {
    // Luôn giữ BaseScene mounted để tránh chớp giật khi khởi tạo lại Ship/Water
    // Chúng ta chỉ thay đổi góc máy hoặc ẩn model Ship khi cần thiết
    const isInsideRoom = targetView === 'testroom' || targetView === 'premiumtripleroom';

    return (
        <>
            {/* Cảnh nền (Sea, Sky, Environment) luôn hiện diện */}
            {/* Ship chỉ ẩn đi khi thực sự đã ở trong phòng để tiết kiệm tài nguyên và tránh che mắt */}
            <Suspense fallback={null}>
                <BaseScene targetView={isInsideRoom ? 'default' : targetView} hideShip={isInsideRoom} />
            </Suspense>

            {/* Các phòng load theo yêu cầu - Mỗi phòng có Suspense riêng */}
            {targetView === 'testroom' && (
                <Suspense fallback={null}>
                    <TestRoom />
                </Suspense>
            )}

            {targetView === 'premiumtripleroom' && (
                <Suspense fallback={null}>
                    <PremiumTripleRoom onExit={() => setTargetView('default')} />
                </Suspense>
            )}
        </>
    );
};

export default Experience;
