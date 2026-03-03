import React, { Component } from 'react';
import { Text } from '@react-three/drei';

class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error.toString() };
    }

    componentDidCatch(error, errorInfo) {
        console.error("3D Scene Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[10, 10, 10]} />
                        <meshBasicMaterial color="red" wireframe />
                    </mesh>
                    <Text position={[0, 0, 0]} fontSize={2} color="white">
                        {'Lỗi tải mô hình 3D.\nVui lòng kiểm tra Git LFS trên Netlify.'}
                    </Text>
                </group>
            );
        }
        return this.props.children;
    }
}

export default SceneErrorBoundary;
