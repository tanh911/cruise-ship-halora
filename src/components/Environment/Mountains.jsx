// Mountains.jsx
import React, { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const Mountains = React.memo(({ scrollSpeed = 0.15, mountainAngleRef }) => {
    const meshRef = useRef()
    const dummy = new THREE.Object3D()

    // tạo geometry núi karst
    const mountainGeometry = useMemo(() => {
        const geometry = new THREE.CylinderGeometry(
            0.7,   // bán kính đỉnh
            1.3,   // bán kính chân
            2.6,   // chiều cao
            18,    // radial segments
            25,    // height segments
            false
        )

        const pos = geometry.attributes.position

        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i)
            let y = pos.getY(i)
            let z = pos.getZ(i)

            const heightFactor = (y + 1.3) / 2.6
            const noise = (Math.random() - 0.5) * 0.25
            const baseSpread = (1 - heightFactor) * 0.5

            x += noise + baseSpread * (Math.random() - 0.5)
            z += noise + baseSpread * (Math.random() - 0.5)
            x += Math.sin(y * 6) * 0.05
            z += Math.cos(y * 5) * 0.05

            if (heightFactor > 0.85) {
                x *= 0.8
                z *= 0.8
            }

            pos.setXYZ(i, x, y, z)
        }

        pos.needsUpdate = true
        geometry.computeVertexNormals()
        return geometry
    }, [])

    const mountains = useMemo(() => {
        const seedPositions = [
            { x: -120, z: 250, s: 15, h: 90 },
            { x: 110, z: 320, s: 40, h: 50 },
            { x: -60, z: -450, s: 35, h: 140 },
            { x: 220, z: 160, s: 28, h: 80 },
            { x: -260, z: -110, s: 32, h: 100 },
            { x: 100, z: 90, s: 30, h: 70 },
            { x: -300, z: 500, s: 45, h: 100 },
            { x: 400, z: -200, s: 20, h: 85 },
            { x: -450, z: 300, s: 35, h: 95 },
            { x: 50, z: 550, s: 50, h: 130 },
        ]

        return seedPositions.map((pos) => ({
            position: new THREE.Vector3(pos.x, -5, pos.z),
            scale: new THREE.Vector3(pos.s, pos.h, pos.s),
            rotation: new THREE.Euler(0, Math.random() * Math.PI, 0),
        }))
    }, [])

    useFrame((state) => {
        if (!meshRef.current || !mountainAngleRef) return

        const angleRad = (mountainAngleRef.current * Math.PI) / 180
        const dx = Math.cos(angleRad) * scrollSpeed * 2
        const dz = Math.sin(angleRad) * scrollSpeed * 2

        mountains.forEach((mtn, i) => {
            // Move individual mountain
            mtn.position.x -= dx
            mtn.position.z -= dz

            // Looping logic for individual mountain
            // Threshold based on distance from origin (ship)
            const loopThreshold = 800
            const resetDist = 1200

            if (mtn.position.z < -loopThreshold) mtn.position.z += resetDist
            if (mtn.position.z > loopThreshold) mtn.position.z -= resetDist
            if (mtn.position.x < -loopThreshold) mtn.position.x += resetDist
            if (mtn.position.x > loopThreshold) mtn.position.x -= resetDist

            // Update instance matrix
            dummy.position.copy(mtn.position)
            dummy.scale.copy(mtn.scale)
            dummy.rotation.copy(mtn.rotation)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[mountainGeometry, null, mountains.length]}>
            <meshStandardMaterial
                color="#0b1625"
                roughness={1}
                metalness={0}
            />
        </instancedMesh>
    )
})

export default Mountains
