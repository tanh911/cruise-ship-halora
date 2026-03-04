import React, { Component, Suspense } from 'react';
import { useGLTF, OrbitControls, Environment, Stage } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

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

// TẢI TỪ NGUỒN NGOÀI: Tải trực tiếp từ Dropbox
const MODEL_PATH = './models/premiumTripleRoom-optimized.glb';

const Model = () => {
    const { scene } = useGLTF(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    return <primitive object={scene} />;
};

useGLTF.preload(MODEL_PATH, 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const RoomScene = ({ onExit }) => {
    const { camera } = useThree();
    const controlsRef = React.useRef();

    React.useLayoutEffect(() => {
        // Cố định góc nhìn theo yêu cầu của user ngay lập tức
        camera.position.set(1.5, -0.5, 6);
        camera.lookAt(2, 2, 3.5);
        camera.fov = 90;
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
            delete window.__setCameraPos;
            delete window.__setCameraLookAt;
            delete window.__setCameraFov;
        };
    }, [camera]);

    return (
        <>
            <Stage
                environment="apartment"
                intensity={0.5}
                adjustCamera={false}
                center={true}
            >
                <Model />
            </Stage>

            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableZoom={true}
                minDistance={1}
                maxDistance={30}
                enablePan={true}
                // Smoothing settings
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.5}
                // Target quan trọng để đồng bộ lookAt
                target={[2, 2, 3.5]}
                // Khóa xoay dọc tại góc nhìn hiện tại
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 2.5}
                // Giới hạn góc quay ngang trong khoảng 30 độ (±15 độ)
                minAzimuthAngle={-Math.PI / 12}
                maxAzimuthAngle={Math.PI / 8}
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