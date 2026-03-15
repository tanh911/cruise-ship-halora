import React, { useRef, Suspense, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/premiumTripleRoom-raw-processed.glb';

const Model = React.forwardRef((props, ref) => {
    const { scene } = useGLTF(MODEL_PATH);
    return <primitive ref={ref} object={scene} {...props} />;
});

const CustomControls = () => {
    const { camera, gl } = useThree();
    const keys = useRef({});
    const isDragging = useRef(false);
    const previousMouseX = useRef(0);

    // Draggable HUD Position
    const [hudPos, setHudPos] = useState({ x: 20, y: 20 }); // Start top-left for visibility
    const isHudDragging = useRef(false);
    const hudStartPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        console.log("CustomControls Mounted - HUD Ready");

        const handleKeyDown = (e) => (keys.current[e.key.toLowerCase()] = true);
        const handleKeyUp = (e) => (keys.current[e.key.toLowerCase()] = false);

        const handleMouseDown = (e) => {
            if (e.target.closest('.hud-container')) return;
            isDragging.current = true;
            previousMouseX.current = e.clientX;
        };

        const handleMouseMove = (e) => {
            if (isHudDragging.current) {
                setHudPos({
                    x: e.clientX - hudStartPos.current.x,
                    y: e.clientY - hudStartPos.current.y
                });
                return;
            }
            if (!isDragging.current) return;
            const deltaX = e.clientX - previousMouseX.current;
            camera.rotation.y -= deltaX * 0.005;
            previousMouseX.current = e.clientX;
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            isHudDragging.current = false;
        };

        const handleWheel = (e) => {
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.y = 0; // Lock vertical movement
            forward.normalize();

            // Move along the vector
            const moveSpeed = e.deltaY * 0.005;
            camera.position.addScaledVector(forward, -moveSpeed);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        gl.domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        gl.domElement.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            gl.domElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('mouseup', handleMouseUp);
            gl.domElement.removeEventListener('wheel', handleWheel);
        };
    }, [camera, gl]);

    const onHudMouseDown = (e) => {
        e.stopPropagation();
        isHudDragging.current = true;
        hudStartPos.current = {
            x: e.clientX - hudPos.x,
            y: e.clientY - hudPos.y
        };
    };

    useFrame((state, delta) => {
        const rotateSpeed = 1.2 * delta;
        if (keys.current['k']) camera.rotation.y += rotateSpeed;
        if (keys.current['l']) camera.rotation.y -= rotateSpeed;

        // Clamp Horizontal Rotation: Right (-1.01) to Left (0.99)
        camera.rotation.y = THREE.MathUtils.clamp(camera.rotation.y, -1.01, 0.99);

        // Lock Height at eye-level
        camera.position.y = 2.3;

        // Clamp Position bounds to keep inside room
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, 3.5, 6.5);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1.5, 4.5);
    });

    return null;
};

export default function PremiumTripleRoom({ onExit, onReady }) {
    const groupRef = useRef();

    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    return (
        <group ref={groupRef}>
            <CustomControls />
            <PerspectiveCamera makeDefault position={[5.21, 2.3, 0.97]} fov={50} />
            <Suspense fallback={null}>
                <Environment preset="apartment" />
                <Model position={[0, 0, 0]} scale={1} />
                <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.35} far={10} color="#000000" />
            </Suspense>

            <ambientLight intensity={1.0} />
            <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#444444" />
            <pointLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <pointLight position={[-5, 10, -5]} intensity={1.0} />
        </group>
    );
}
