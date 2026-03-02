import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Coordinate for the flow
    vec2 st = vUv;
    
    // Scroll the texture along Y (This maps to World Z / Forward-Backward)
    // "Nó phải là trục Y chứ" -> Đúng, UV.y chạy dọc theo thân tàu.
    // uTime * speed
    float flow = st.y * 10.0 + uTime * 2.0; 

    // Create wave lines using sine
    float wave = sin(flow) * 0.5 + 0.5;
    
    // Make them thicker (lower power = thicker)
    wave = pow(wave, 2.0);

    // Color: White foam
    vec3 color = vec3(1.0);
    
    // Alpha: High opacity to be clearly visible
    float alpha = wave * 0.8; 

    gl_FragColor = vec4(color, alpha);
  }
`;

const MovingSea = () => {
    const materialRef = useRef();

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    const uniforms = useRef({
        uTime: { value: 0 }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
            <planeGeometry args={[500, 500]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms.current}
                transparent={true}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default MovingSea;
