import * as THREE from 'three';

// Realistic parameters for multiple waves - Expanded for more detail
export const WAVES = [
    { direction: 0.0, amplitude: 0.5, wavelength: 120, speed: 0.3, steepness: 0.2 },
    { direction: 45.0, amplitude: 0.35, wavelength: 55, speed: 0.35, steepness: 0.18 },
    { direction: -30.0, amplitude: 0.2, wavelength: 30, speed: 0.4, steepness: 0.12 },
    { direction: 130.0, amplitude: 0.12, wavelength: 18, speed: 0.5, steepness: 0.08 },
    { direction: 210.0, amplitude: 0.08, wavelength: 10, speed: 0.6, steepness: 0.06 },
    { direction: -110.0, amplitude: 0.04, wavelength: 7, speed: 0.7, steepness: 0.04 },
];

/**
 * Calculates Gerstner Wave displacement at a specific (x, z, time)
 * Returns { x, y, z, normal }
 */
export function getGerstnerDisplacement(x, z, time) {
    let dx = 0;
    let dy = 0;
    let dz = 0;

    // Normal calculation accumulation
    let nx = 0;
    let ny = 1;
    let nz = 0;

    for (const wave of WAVES) {
        // Safe wavelength check
        const wavelength = Math.max(wave.wavelength, 0.01);
        const k = (2 * Math.PI) / wavelength;

        // Safe k for sqrt
        const c = Math.sqrt(Math.max(9.8 / k, 0.0)) * wave.speed;

        const d = new THREE.Vector2(
            Math.cos(THREE.MathUtils.degToRad(wave.direction)),
            Math.sin(THREE.MathUtils.degToRad(wave.direction))
        ).normalize();

        const f = k * (d.dot(new THREE.Vector2(x, z)) - c * time);
        const a = wave.steepness / k;

        dx += d.x * (a * Math.cos(f));
        dy += wave.amplitude * Math.sin(f);
        dz += d.y * (a * Math.cos(f));

        // Accumulate derivatives for normals
        const wa = k * wave.amplitude;
        nx -= d.x * wa * Math.cos(f);
        ny -= wave.steepness * Math.sin(f);
        nz -= d.y * wa * Math.cos(f);
    }

    // Ensure ny (the 'up' component) is not zero before normalizing to avoid NaN
    const normal = new THREE.Vector3(nx, Math.max(ny, 0.001), nz).normalize();
    return { x: x + dx, y: dy, z: z + dz, normal };
}
