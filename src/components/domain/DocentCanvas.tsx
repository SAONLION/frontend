import { Canvas, useFrame } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { DocentCue } from './DocentStage'

const MODEL_URL = '/models/docent/u.glb'
const WING_NAMES = ['joint1_L', 'joint1_R'] as const

function Model({ cue }: { cue: DocentCue }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef<THREE.Group>(null)
  const wings = useRef<THREE.Object3D[]>([])
  const greetStartedAt = useRef<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    wings.current = WING_NAMES.map((name) => scene.getObjectByName(name)).filter(
      (bone): bone is THREE.Object3D => Boolean(bone),
    )
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [scene])

  useEffect(() => {
    greetStartedAt.current = cue === 'greet' ? performance.now() : null
  }, [cue])

  useEffect(() => {
    if (!reducedMotion) {
      return
    }

    if (group.current) {
      group.current.position.y = 0
    }

    wings.current.forEach((wing) => {
      wing.rotation.set(0, 0, 0)
    })
  }, [reducedMotion])

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return
    const t = clock.elapsedTime
    group.current.position.y = Math.sin(t * 1.4) * 0.08
    const elapsed = greetStartedAt.current === null ? null : (performance.now() - greetStartedAt.current) / 1000
    wings.current.forEach((wing, index) => {
      const sign = index === 0 ? -1 : 1
      const lift =
        elapsed !== null && elapsed < 1.8
          ? Math.sin((elapsed / 1.8) * Math.PI) * 0.15 * sign
          : Math.sin(t * 0.6) * 0.06 * sign
      wing.rotation.set(0, lift, 0)
    })
  })

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

export default function DocentCanvas({ cue }: { cue: DocentCue }) {
  return (
    <Canvas aria-hidden camera={{ fov: 38, position: [3, 1.8, 5] }} dpr={[1, 1.5]} gl={{ alpha: true }}>
      <ambientLight intensity={2} />
      <directionalLight intensity={3} position={[3, 4, 4]} />
      <Model cue={cue} />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)
