import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform vec4 uWaves[3];
  uniform float uSteepness[3];
  uniform vec2 uShipVelocity;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;

  const float PI = 3.14159265359;

  vec3 gerstnerWave(
    vec3 pos,
    float time,
    vec4 wave,
    float steepness,
    inout vec3 tangent,
    inout vec3 binormal
  ) {
    float wavelength = max(wave.z, 0.01);
    float k = 2.0 * PI / (wavelength + 0.000001); 
    float speed = sqrt(9.8 / (k + 0.000001)) * wave.w;

    float dirRad = radians(wave.x);
    vec2 d = normalize(vec2(cos(dirRad), sin(dirRad)) + 0.000001);

    float f = k * (dot(d, pos.xy) - speed * time);
    float a = steepness / (k + 0.000001);

    float cosF = cos(f);
    float sinF = sin(f);

    tangent += vec3(
        -d.x * d.x * (steepness * sinF),
        -d.x * d.y * (steepness * sinF),
         d.x * (steepness * cosF)
    );
    binormal += vec3(
        -d.x * d.y * (steepness * sinF),
        -d.y * d.y * (steepness * sinF),
         d.y * (steepness * cosF)
    );

    return vec3(
        d.x * (a * cosF),
        d.y * (a * cosF),
        a * sinF
    );
  }

  void main() {
    vec3 displacedPos = position;
    vec3 wavePos = position;
    
    wavePos.xy += uShipVelocity * uTime;

    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 1.0, 0.0);

    displacedPos += gerstnerWave(wavePos, uTime, uWaves[0], uSteepness[0], tangent, binormal);
    displacedPos += gerstnerWave(wavePos, uTime, uWaves[1], uSteepness[1], tangent, binormal);
    displacedPos += gerstnerWave(wavePos, uTime, uWaves[2], uSteepness[2], tangent, binormal);

    vec3 normal = normalize(cross(tangent, binormal));
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vHeight = displacedPos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uSunDirection;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);
    vec3 sunDir = normalize(uSunDirection);

    // Fresnel Reflection
    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.5);

    // Tropical Water Colors
    vec3 deepWater = vec3(0.055, 0.29, 0.45);    // #0e4a73
    vec3 midWater = vec3(0.16, 0.50, 0.73);     // #2980b9
    vec3 shallowWater = vec3(0.43, 0.78, 0.85); // #6ec6d9

    // Calculate base color based on wave height - widened ranges for "slower" gradient
    float heightFactor = smoothstep(-1.5, 1.5, vHeight);
    vec3 waterColor = mix(deepWater, midWater, heightFactor);
    waterColor = mix(waterColor, shallowWater, smoothstep(-0.5, 2.0, vHeight));

    // Specular Highlight
    vec3 reflectDir = reflect(-viewDir, normal);
    float spec = pow(max(dot(reflectDir, sunDir), 0.0), 128.0);
    vec3 highlight = vec3(1.0, 1.0, 1.0) * spec * 0.8;

    // Organic Foam Logic - widened ranges for a smoother, "slower" gradient
    float n = noise((vNormal.xy + uTime * 0.2) * 12.0);
    float foamCrest = smoothstep(-0.5, 2.0, vHeight + n * 0.4);
    float foamNoise = smoothstep(0.2, 0.8, n);
    float foamMask = clamp(foamCrest * foamNoise, 0.0, 1.0);
    
    vec3 foamColor = vec3(0.94, 0.97, 1.0); // #f0f7ff

    // Combine everything
    vec3 skyColor = vec3(0.4, 0.6, 0.9); // Simulating sky reflection
    vec3 reflectionColor = skyColor * 0.2 + highlight;
    
    vec3 finalColor = mix(waterColor, reflectionColor, fresnel * 0.5);
    finalColor = mix(finalColor, foamColor, foamMask * 0.7);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const BASE_WAVES = [
  new THREE.Vector4(0.0, 0.45, 140, 0.25),   // Main swell
  new THREE.Vector4(53.0, 0.25, 75, 0.4),    // Cross swell
  new THREE.Vector4(-17.0, 0.15, 33, 0.6),   // Choppiness
];

const Water = ({ waveAngleRef, scrollSpeed = 0.15 }) => {
  const materialRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
    uShipVelocity: { value: new THREE.Vector2(0, 0) },
    uWaves: {
      value: BASE_WAVES.map(w => new THREE.Vector4(w.x, w.y, w.z, w.w))
    },
    uSteepness: { value: [0.18, 0.1, 0.05] }
  }), [])

  useFrame((state) => {
    const material = materialRef.current;
    if (material && material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime

      const waveAngle = waveAngleRef ? waveAngleRef.current : 0;
      const angleRad = (waveAngle * Math.PI) / 180;
      const speed = scrollSpeed * 100.0;

      material.uniforms.uShipVelocity.value.set(
        Math.cos(angleRad) * speed,
        Math.sin(angleRad) * speed
      );

      const waves = material.uniforms.uWaves.value;
      if (waves && waves.length >= 3) {
        for (let i = 0; i < 3; i++) {
          waves[i].x = BASE_WAVES[i].x + waveAngle;
        }
      }
    }
  })

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.0, 0]}
    >
      <planeGeometry args={[1000, 1000, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={true}
        transparent={false}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

export default Water