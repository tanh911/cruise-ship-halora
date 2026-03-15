import React, { useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vDir;
  uniform vec3 uSunPosition;

  void main() {
    vec3 dir = normalize(vDir + 0.000001);
    vec3 sunDir = normalize(uSunPosition + 0.000001);
    float sunDot = dot(dir, sunDir);
    float h = clamp(dir.y, 0.0, 1.0);

    // Darker Cinematic Sunset Palette
    vec3 zenith = vec3(0.005, 0.02, 0.08);
    vec3 horizon = vec3(0.7, 0.25, 0.07);
    vec3 atmosphereGlow = vec3(0.7, 0.4, 0.14);
    vec3 sunColor = vec3(0.8, 0.7, 0.5);

    // Balanced sky gradient
    vec3 color = mix(horizon, zenith, pow(max(0.000001, h), 0.5));
    
    // Atmospheric Haze
    float haze = pow(max(0.0, sunDot), 6.0);
    color = mix(color, atmosphereGlow, max(0.0, haze * 0.6 * (1.0 - h)));

    // Highly Visible Sun Disk
    float sunDisc = smoothstep(0.95, 0.99, sunDot); 
    color = mix(color, sunColor, sunDisc);

    // Powerful Core Glow
    float core = pow(max(0.0, sunDot), 256.0);
    color += atmosphereGlow * core * 4.0;

    gl_FragColor = vec4(max(vec3(0.0), color), 1.0);
  }
`;

const SkyBox = () => {
  const uniforms = useMemo(() => ({
    uSunPosition: { value: new THREE.Vector3(150, 20, 150) }
  }), []);

  return (
    <mesh>
      <sphereGeometry args={[4000, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

export default SkyBox;
