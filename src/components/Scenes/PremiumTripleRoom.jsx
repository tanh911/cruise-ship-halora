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

// TẢI TỪ NGUỒN NGOÀI: Nếu repo private thì GLB sẽ không tải được qua Github LFS trên Netlify.
// Lựa chọn 1: Cấu hình đúng GIT_LFS_ENABLED = true trên Netlify UI (Khuyên dùng)
// Lựa chọn 2: Up file premiumTripleRoom.glb lên một host public (Google Drive/Dropbox direct link) rồi đổi MODEL_PATH thành link đó.
const MODEL_PATH = '/models/premiumTripleRoom.glb';

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