import React, { Component } from 'react';
import { useGLTF, Stage, OrbitControls } from '@react-three/drei';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("TestRoom Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <hemisphereLight intensity={0.5} />
                </group>
            );
        }

        return this.props.children;
    }
}

const Model = () => {
    // 1. Use absolute path to avoid relative path issues
    const { scene } = useGLTF('/models/test_room.glb');
    return <primitive object={scene} />;
};

const TestRoom = () => {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            }>
                {/* 2. Add lighting manually to ensure visibility if Stage fails */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* 3. Stage centers the model. If model is huge/tiny, this helps. */}
                <Stage environment="city" intensity={0.6} adjustCamera>
                    <Model />
                </Stage>

                {/* 4. Grid and Axes to help see scale/orientation */}
                <gridHelper args={[20, 20]} position={[0, -0.1, 0]} />
                <axesHelper args={[5]} />

            </React.Suspense>
            <OrbitControls makeDefault />
        </ErrorBoundary>
    );
};

export default TestRoom;
