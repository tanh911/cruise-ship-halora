import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform vec4 uWaves[6];
  uniform float uSteepness[6];

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
    float k = 2.0 * PI / wavelength;
    float speed = sqrt(9.8 / k) * wave.w;

    float dirRad = radians(wave.x);
    vec2 d = normalize(vec2(cos(dirRad), sin(dirRad)));

    // Use pos.xy because planeGeometry is in XY plane before rotation
    float f = k * (dot(d, pos.xy) - speed * time);
    float a = steepness / k;

    float cosF = cos(f);
    float sinF = sin(f);

    // Update tangent/binormal based on XY plane
    // Plane is in XY, normal is in Z
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

    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 1.0, 0.0);

    displacedPos += gerstnerWave(position, uTime, uWaves[0], uSteepness[0], tangent, binormal);
    displacedPos += gerstnerWave(position, uTime, uWaves[1], uSteepness[1], tangent, binormal);
    displacedPos += gerstnerWave(position, uTime, uWaves[2], uSteepness[2], tangent, binormal);
    displacedPos += gerstnerWave(position, uTime, uWaves[3], uSteepness[3], tangent, binormal);
    displacedPos += gerstnerWave(position, uTime, uWaves[4], uSteepness[4], tangent, binormal);
    displacedPos += gerstnerWave(position, uTime, uWaves[5], uSteepness[5], tangent, binormal);

    // Correct world-space normal
    vec3 normal = normalize(cross(tangent, binormal));
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);

    vViewDir = normalize(cameraPosition - worldPos.xyz);
    vHeight = displacedPos.z;

    // Correct transform
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uSunDirection;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);
    vec3 sunDir = normalize(uSunDirection);

    // Fresnel (Schlick-like)
    float vDotN = clamp(dot(normal, viewDir), 0.0, 1.0);
    float fresnel = pow(1.0 - vDotN, 5.0);

    // Subsurface look
    float sss = smoothstep(-0.5, 1.0, vHeight);
    vec3 deepColor = vec3(0.001, 0.008, 0.02);
    vec3 sssColor = vec3(0.01, 0.08, 0.12) * sss;
    vec3 waterColor = deepColor + sssColor;

    // Fake sky reflection
    vec3 reflectDir = reflect(-viewDir, normal);
   // Stable sky gradient (NO SEAM)
float skyFactor = viewDir.y * 0.5 + 0.5;
skyFactor = clamp(skyFactor, 0.0, 1.0);
skyFactor = smoothstep(0.0, 1.0, skyFactor);

vec3 horizonColor = vec3(0.6, 0.3, 0.1);
vec3 zenithColor  = vec3(0.05, 0.1, 0.2);

vec3 skyColor = mix(horizonColor, zenithColor, skyFactor);

    // Sun specular - much softer to avoid sharp streaks
    float rDotS = max(dot(reflectDir, sunDir), 0.0);
    float sunSpec = pow(rDotS, 16.0); // Broader highlight
    vec3 highlights = vec3(1.0, 0.9, 0.7) * sunSpec * 0.25;

    vec3 finalColor = mix(
      waterColor,
      skyColor + highlights,
      clamp(fresnel * 0.6, 0.0, 1.0)
    );

    // Subtle crest foam
    float foamMask = smoothstep(0.7, 1.1, vHeight);
    vec3 foamColor = vec3(0.75, 0.85, 0.95);
    finalColor = mix(finalColor, foamColor, foamMask * 0.05);

    // Subtle sparkle
    float sparkle = pow(max(dot(normal, sunDir), 0.0), 128.0) * 0.1;
    finalColor += vec3(1.0, 0.9, 0.8) * sparkle;

    gl_FragColor = vec4(max(finalColor, vec3(0.0)), 1.0);
  }
`

const Water = () => {
  const materialRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
    uWaves: {
      value: [
        new THREE.Vector4(0.0, 0.5, 120, 0.3),    // Sóng dài, chậm (sóng lớn đại dương)
        new THREE.Vector4(45.0, 0.35, 55, 0.35),   // Sóng trung bình
        new THREE.Vector4(-30.0, 0.2, 30, 0.4),    // Sóng chéo
        new THREE.Vector4(130.0, 0.12, 18, 0.5),   // Sóng ngắn phụ
        new THREE.Vector4(210.0, 0.08, 10, 0.6),   // Gợn sóng nhỏ
        new THREE.Vector4(-110.0, 0.04, 7, 0.7),   // Gợn sóng rất nhỏ
      ]
    },
    uSteepness: { value: [0.2, 0.18, 0.12, 0.08, 0.06, 0.04] }
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.0, 0]}
    >
      <planeGeometry args={[2000, 2000, 256, 256]} />
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