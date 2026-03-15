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
    // Scroll coordinate along the forward direction (Y axis)
    // Scale and speed for a "fast moving streaks" look
    float scrollScale = 5.0;
    float scrollSpeed = 2.5;
    float flow = vUv.y * scrollScale + uTime * scrollSpeed;
    
    // Horizontal distortion to create organic, non-linear streaks
    float noise = sin(vUv.x * 12.0 + uTime * 0.8) * 0.3;
    float pattern = sin((flow + noise) * 6.0);
    
    // Map -1..1 to 0..1 for thresholding
    float value = pattern * 0.5 + 0.5;
    
    // 7:3 Ratio Logic (70% blue, 30% white)
    // smoothstep(0.7, 0.8, ...) creates a ~30% white portion at the peaks
    float mask = smoothstep(0.7, 0.8, value);
    
    vec3 blue = vec3(0.16, 0.50, 0.73); // #2980b9
    vec3 white = vec3(1.0, 1.0, 1.0);   // #ffffff
    
    vec3 color = mix(blue, white, mask);
    
    // Soft blending: fade out at the edges of the plane
    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) *
                     smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    
    // Transparency: blue is semi-transparent, white streaks are more opaque
    float alpha = mix(0.3, 0.75, mask) * edgeFade;

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
      <planeGeometry args={[300, 300]} />
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
