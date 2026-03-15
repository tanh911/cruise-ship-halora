import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, OrbitControls } from '@react-three/drei';
import SkyBox from './Environment/SkyBox';
import Ship from './Ship/Ship';
import Water from './Environment/Water';
import Mountains from './Environment/Mountains';
import Birds from './Environment/Birds';
import WaterStreaks from './Environment/WaterStreaks';

// Preload essential assets for instant switching
useGLTF.preload('/models/base.glb');
useGLTF.preload('/models/premiumTripleRoom-raw-processed.glb');
useGLTF.preload('/models/test-room.glb');

const PremiumTripleRoom = lazy(() => import('./Scenes/PremiumTripleRoom'));
const TestRoom = lazy(() => import('./Scenes/TestRoom'));

const DEFAULT_CAM_POS = new THREE.Vector3(-246.8, 10.4, -90.1);
const DEFAULT_LOOK_AT = new THREE.Vector3(0, 0, 0);

const BaseScene = ({ onReady }) => {
    const waveAngleRef = useRef(180);
    const mountainAngleRef = useRef(180);

    useEffect(() => {
        // Signal ready immediately on mount to avoid artificial delays
        if (onReady) onReady();
    }, [onReady]);

    return (
        <>
            <SkyBox />
            <Water waveAngleRef={waveAngleRef} scrollSpeed={0.15} />
            <Mountains scrollSpeed={0.15} mountainAngleRef={mountainAngleRef} />
            <WaterStreaks />
            <Birds count={50} />
            <group position={[17.5, -2.0, 0.0]} rotation={[0, Math.PI, 0]}>
                <Ship />
            </group>
        </>
    );
};

const Experience = ({ targetView, setTargetView, isZooming, onZoomComplete, setFadeOpacity, onReady }) => {
    const zoomProgress = useRef(0);
    const initialCamPos = useRef(new THREE.Vector3(-246.8, 10.4, -90.1));
    const targetCamPos = useRef(new THREE.Vector3(5, 10, -30)); // Snappier target

    useFrame((state, delta) => {
        if (isZooming) {
            zoomProgress.current += delta * 1.2; // Faster speed

            // Calculate fade: start at 0.7 progress, reach 1.0 at 0.95 progress
            const fadeStart = 0.7;
            const fadeEnd = 0.95;
            if (zoomProgress.current > fadeStart) {
                const alpha = Math.min(1, (zoomProgress.current - fadeStart) / (fadeEnd - fadeStart));
                if (setFadeOpacity) setFadeOpacity(alpha);
            }

            if (zoomProgress.current >= 0.95) {
                zoomProgress.current = 1;
                onZoomComplete();
            }

            // Smooth cubic easing
            const t = zoomProgress.current;
            const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            state.camera.position.lerpVectors(initialCamPos.current, targetCamPos.current, easeT);
            state.camera.lookAt(17.5, 5, 0); // Focus on ship center
        } else if (targetView === 'default') {
            zoomProgress.current = 0;
            state.camera.position.copy(initialCamPos.current);
            state.camera.lookAt(0, 5, 0);
            if (setFadeOpacity) setFadeOpacity(0);
        }
    });

    return (
        <>
            <color attach="background" args={['#050812']} />
            <fog attach="fog" args={['#050812', 100, 1200]} />

            <ambientLight intensity={0.3} color="#ccddff" />
            <directionalLight
                position={[0, 20, -150]}
                intensity={9}
                color="#ffaa66"
            />

            <Suspense fallback={null}>
                {targetView === 'default' ? (
                    <BaseScene onReady={onReady} />
                ) : targetView === 'premium' ? (
                    <PremiumTripleRoom onExit={() => setTargetView('default')} onReady={onReady} />
                ) : targetView === 'test' ? (
                    <TestRoom onExit={() => setTargetView('default')} onReady={onReady} />
                ) : null}
            </Suspense>

            {targetView === 'default' && !isZooming && (
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    dampingFactor={0.05}
                    enableDamping={true}
                />
            )}
        </>
    );
};

export default Experience;
