import React, { Component, useEffect, useRef, useLayoutEffect, useState } from 'react';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("PremiumTripleRoom Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <group>
                    <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="red" /></mesh>
                    <hemisphereLight intensity={0.5} />
                </group>
            );
        }
        return this.props.children;
    }
}

const MODEL_PATH = './models/premiumTripleRoom-optimized.glb';

const Model = React.forwardRef((props, ref) => {
    const { scene } = useGLTF(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    useEffect(() => {
        console.log('[PremiumTripleRoom] Model loaded successfully');
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log('[PremiumTripleRoom] Model bounds:', {
            min: box.min.toArray(),
            max: box.max.toArray(),
            size: size.toArray(),
            center: center.toArray()
        });

        // Enhance materials for room
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.envMapIntensity = 1.0;
                child.material.needsUpdate = true;
            }
        });
    }, [scene]);

    return <primitive ref={ref} object={scene} />;
});

useGLTF.preload(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

// Known model bounds from debug:
// center: [3.49, -1.25, -5.95], size: [13.18, 8.56, 14.41]
// So room spans approx X: [-3.1, 10.1], Y: [-5.5, 3.1], Z: [-13.2, 1.3]
// Eye level (standing) should be around Y = 0 to 1 (above center)
const ROOM_CAMERA_POS = [5, -7.5, -2];        // Inside room, slightly toward entrance
const ROOM_LOOK_AT = [3.5, -1.5, -7.5];             // Looking toward far wall

const RoomScene = ({ onExit }) => {
    const { camera, scene: threeScene, gl } = useThree();
    const controlsRef = useRef();

    useLayoutEffect(() => {
        // Save and set scene background for room (prevents black bg when Sky/Water hidden)
        const prevBackground = threeScene.background;
        threeScene.background = new THREE.Color('#2a2a3a');

        // Xoá fog khỏi scene khi vào phòng
        const prevFog = threeScene.fog;
        threeScene.fog = null;

        console.log('[PremiumTripleRoom] Setting up camera at', ROOM_CAMERA_POS, 'looking at', ROOM_LOOK_AT);

        // Set camera for interior view
        camera.position.set(...ROOM_CAMERA_POS);
        camera.lookAt(new THREE.Vector3(...ROOM_LOOK_AT));
        camera.fov = 90;
        camera.near = 0.01;
        camera.far = 100;
        camera.updateProjectionMatrix();

        // Đăng ký các hàm global để Debug Panel có thể điều khiển
        window.__setCameraPos = (x, y, z) => {
            camera.position.set(x, y, z);
        };
        window.__setCameraLookAt = (x, y, z) => {
            if (controlsRef.current) {
                controlsRef.current.target.set(x, y, z);
            }
        };
        window.__setCameraFov = (fov) => {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        };

        return () => {
            threeScene.background = prevBackground;
            threeScene.fog = prevFog;
            camera.near = 0.1;
            camera.far = 5000;
            camera.updateProjectionMatrix();
            delete window.__setCameraPos;
            delete window.__setCameraLookAt;
            delete window.__setCameraFov;
        };
    }, [camera, threeScene]);

    return (
        <>
            {/* Room-specific lighting - bright enough for interior */}
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight position={[5, 8, 5]} intensity={2.0} color="#fff5e6" />
            <directionalLight position={[-3, 5, -2]} intensity={1.2} color="#e6f0ff" />
            <pointLight position={[3.5, 2, -6]} intensity={2.0} distance={20} color="#ffeecc" />
            <pointLight position={[3.5, 2, -2]} intensity={1.5} distance={15} color="#ffffff" />
            <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={0.8} />

            {/* Room environment for reflections */}
            <Environment preset="apartment" />

            {/* Model at original coordinates */}
            <Model />

            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableZoom={false}
                minDistance={0.5}
                maxDistance={30}
                enablePan={true}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.5}
                target={ROOM_LOOK_AT}
                // Khóa xoay dọc tại góc nhìn hiện tại
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2.5}
                // Giới hạn góc quay ngang
                minAzimuthAngle={-Math.PI / 24}
                maxAzimuthAngle={Math.PI / 6}
            />
        </>
    );
};

const PremiumTripleRoom = ({ onExit }) => {
    return (
        <ErrorBoundary>
            <RoomScene onExit={onExit} />
        </ErrorBoundary>
    );
};

export default PremiumTripleRoom;