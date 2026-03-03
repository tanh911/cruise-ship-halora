import React, { Component, useEffect, useState, useCallback } from 'react';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

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

// TẢI TỪ NGUỒN NGOÀI: Tải trực tiếp từ Dropbox (dùng dl.dropboxusercontent.com để tránh lỗi CORS)
const MODEL_PATH = 'https://dl.dropboxusercontent.com/scl/fi/klx1hqhs5lznm4azlot5i/premiumTripleRoom.glb?rlkey=sfoauoiei8j13qeuju611tv8z&st=hrae7vma';

const Model = () => {
    const { scene } = useGLTF(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    return <primitive object={scene} />;
};

useGLTF.preload(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const RoomScene = ({ onExit }) => {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(2, 1.5, 6);
        camera.lookAt(-13, 5, 0);
        camera.fov = 120;
        camera.updateProjectionMatrix();
    }, [camera]);

    return (
        <>
            <ambientLight intensity={0.1} color="#ffffff" />
            <directionalLight position={[10, 15, 10]} intensity={0.3} />
            <Environment preset="apartment" background blur={0.8} backgroundIntensity={0.3} environmentIntensity={0.4} />
            <Center>
                <Model />
            </Center>
            <OrbitControls
                makeDefault
                target={[0, 2, 0]}
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                minAzimuthAngle={-Math.PI / 180}
                maxAzimuthAngle={Math.PI / 4}
            />
        </>
    );
};

const PremiumTripleRoom = ({ onExit }) => {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" wireframe />
                </mesh>
            }>
                <RoomScene onExit={onExit} />
            </React.Suspense>
        </ErrorBoundary>
    );
};

export default PremiumTripleRoom;