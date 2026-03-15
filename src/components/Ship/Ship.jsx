import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getGerstnerDisplacement } from '../../utils/GerstnerWaves'

const Ship = () => {
    const { scene } = useGLTF('/models/base.glb')
    const shipRef = useRef()

    const shipModelRotation = [0, (75 * (-Math.PI / 180)) + Math.PI, 0]
    const targetQuat = useMemo(() => new THREE.Quaternion(), [])

    useLayoutEffect(() => {
        if (!scene) return
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false
                child.receiveShadow = true
                if (child.material) {
                    child.material.envMapIntensity = 0.8;
                    child.material.needsUpdate = true
                }
            }
        })
    }, [scene])

    useFrame((state) => {
        if (!shipRef.current) return
        const t = state.clock.getElapsedTime()

        const { y, normal } = getGerstnerDisplacement(15 * t, 10 * t, t)
        shipRef.current.position.y = (y * 0.3) + 0.7

        const up = new THREE.Vector3(0, 1, 0)
        const dampenedNormal = new THREE.Vector3().lerpVectors(up, normal, 0.2).normalize()
        targetQuat.setFromUnitVectors(up, dampenedNormal)
        shipRef.current.quaternion.slerp(targetQuat, 0.05)
    })

    if (!scene) return null

    return (
        <group ref={shipRef}>
            <primitive
                object={scene}
                position={[0, -1, 0]}
                scale={50.0}
                rotation={shipModelRotation}
            />
        </group>
    )
}

export default Ship