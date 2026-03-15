import React, { Suspense } from 'react';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';

const Model = ({ path }) => {
    const { scene } = useGLTF(path);
    return <primitive object={scene} />;
};

const TestRoom = ({ onReady }) => {
    React.useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={50} />
            <OrbitControls
                enablePan={false}
                minDistance={1}
                maxDistance={10}
                maxPolarAngle={Math.PI / 1.5}
                makeDefault
            />

            <Suspense fallback={null}>
                <Model path="/models/test-room.glb" />
            </Suspense>

            <ambientLight intensity={1.0} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <gridHelper args={[20, 20]} position={[0, -0.01, 0]} />
        </>
    );
};

export default TestRoom;
