import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { getDocentCueDuration, writeDocentMotion, type DocentMotion } from '../../features/docent/docentMotion'
import type { DocentCue } from '../../features/docent/docentCue'

const MODEL_URL = '/models/docent/u.glb'
const QUESTION_MARK_URL = '/models/docent/question_mark.glb'
const CHECKMARK_URL = '/models/docent/checkmark.glb'
const WING_NAMES = ['joint1_L', 'joint1_R'] as const
const QUESTION_MARK_BASE_ROTATION = -0.1 + Math.PI / 36
const QUESTION_MARK_SCALE = 0.14 * (2 / 3)
const QUESTION_MARK_HEIGHT = 3.25
const LISTEN_CAMERA_FOV = 60
const LISTEN_CAMERA_DISTANCE = 5.5
const CUE_TRANSITION_DURATION = 0.42
const CONTINUITY_WINDOW_MS = 1_000
const neutralMotion: DocentMotion = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  leftWingBow: 0,
  leftWingLift: 0,
  rightWingBow: 0,
  rightWingLift: 0,
}

type Transform = {
  position: THREE.Vector3
  rotation: THREE.Euler
}

type StoredContinuity = {
  motion: DocentMotion
  storedAt: number
}

const continuityMotion = new Map<string, StoredContinuity>()

type MaterialRest = {
  color: THREE.Color
  metalness: number
  roughness: number
  clearcoat: number
  clearcoatRoughness: number
  envMapIntensity: number
}

function applyStudioGoldMaterial(scene: THREE.Group) {
  const materialRest = new Map<THREE.MeshPhysicalMaterial, MaterialRest>()
  const materialAssignments = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    if (object.name === 'Mesh056') {
      const originalMaterial = object.material
      const originalMaterials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial]
      const bodyMaterials = originalMaterials.map((material) => material.clone())

      object.material = Array.isArray(originalMaterial) ? bodyMaterials : bodyMaterials[0]
      materialAssignments.set(object, originalMaterial)
    }

    const materials = Array.isArray(object.material) ? object.material : [object.material]

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshPhysicalMaterial) || materialRest.has(material)) return

      materialRest.set(material, {
        color: material.color.clone(),
        metalness: material.metalness,
        roughness: material.roughness,
        clearcoat: material.clearcoat,
        clearcoatRoughness: material.clearcoatRoughness,
        envMapIntensity: material.envMapIntensity,
      })

      if (object.name === 'Mesh056_1') {
        material.color.set('#4b2908')
        material.roughness = 0.42
        material.clearcoat = 0
        material.clearcoatRoughness = 0.3
        material.envMapIntensity = 0.32
      } else if (object.name === 'Mesh056') {
        material.color.set('#f2d68a')
        material.metalness = 0.78
        material.roughness = 0.34
        material.clearcoat = Math.max(material.clearcoat, 0.18)
        material.clearcoatRoughness = 0.18
        material.envMapIntensity = 0.78
      } else {
        material.color.lerp(new THREE.Color('#d6ba70'), 0.4)
        material.roughness = Math.min(material.roughness, 0.32)
        material.clearcoat = Math.max(material.clearcoat, 0.16)
        material.clearcoatRoughness = 0.2
        material.envMapIntensity = 0.92
      }
      material.needsUpdate = true
    })
  })

  return () => {
    materialRest.forEach((rest, material) => {
      material.color.copy(rest.color)
      material.metalness = rest.metalness
      material.roughness = rest.roughness
      material.clearcoat = rest.clearcoat
      material.clearcoatRoughness = rest.clearcoatRoughness
      material.envMapIntensity = rest.envMapIntensity
      material.needsUpdate = true
    })

    materialAssignments.forEach((originalMaterial, mesh) => {
      const bodyMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      mesh.material = originalMaterial
      bodyMaterials.forEach((material) => material.dispose())
    })
  }
}

function Model({ cue, continuityKey, reducedMotion }: { cue: DocentCue; continuityKey?: string; reducedMotion: boolean }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef<THREE.Group>(null)
  const wings = useRef<THREE.Object3D[]>([])
  const groupRest = useRef<Transform | null>(null)
  const wingRest = useRef<Transform[]>([])
  const targetMotion = useRef<DocentMotion>({ ...neutralMotion })
  const appliedMotion = useRef<DocentMotion>({ ...neutralMotion })
  const transitionFromMotion = useRef<DocentMotion>({ ...neutralMotion })
  const cueStartedAt = useRef(performance.now())
  const cueTransitionStartedAt = useRef(performance.now())
  const previousCue = useRef(cue)
  const initialPoseApplied = useRef(false)

  useEffect(() => applyStudioGoldMaterial(scene), [scene])

  useLayoutEffect(() => {
    const foundWings = WING_NAMES.map((name) => scene.getObjectByName(name)).filter(
      (bone): bone is THREE.Object3D => Boolean(bone),
    )

    wings.current = foundWings
    wingRest.current = foundWings.map((wing) => ({
      position: wing.position.clone(),
      rotation: wing.rotation.clone(),
    }))

    return () => {
      wings.current = []
      wingRest.current = []
    }
  }, [scene])

  useLayoutEffect(() => {
    if (group.current && !groupRest.current) {
      groupRest.current = {
        position: group.current.position.clone(),
        rotation: group.current.rotation.clone(),
      }
    }
  }, [])

  useLayoutEffect(() => {
    const motionGroup = group.current
    const rest = groupRest.current

    if (initialPoseApplied.current || !motionGroup || !rest) return

    const continuedMotion = takeContinuityMotion(continuityKey)

    if (continuedMotion) {
      copyMotion(appliedMotion.current, continuedMotion)
      copyMotion(transitionFromMotion.current, continuedMotion)
      cueTransitionStartedAt.current = performance.now()
    } else {
      writeDocentMotion(cue, 0, 0, appliedMotion.current)
      copyMotion(targetMotion.current, appliedMotion.current)
    }

    applyMotionPose(motionGroup, rest, wings.current, wingRest.current, appliedMotion.current)
    initialPoseApplied.current = true
  }, [continuityKey, cue])

  useLayoutEffect(() => {
    if (previousCue.current !== cue) {
      copyMotion(transitionFromMotion.current, appliedMotion.current)
      cueTransitionStartedAt.current = performance.now()
      previousCue.current = cue
    }

    cueStartedAt.current = performance.now()
  }, [cue])

  useEffect(() => {
    if (!reducedMotion) return
    restoreRestPose(group.current, groupRest.current, wings.current, wingRest.current)
  }, [reducedMotion])

  useLayoutEffect(() => {
    const motionGroup = group.current
    const groupTransform = groupRest.current
    const currentWings = wings.current
    const currentWingRest = wingRest.current
    const currentAppliedMotion = appliedMotion

    return () => {
      storeContinuityMotion(continuityKey, currentAppliedMotion.current)
      restoreRestPose(motionGroup, groupTransform, currentWings, currentWingRest)
    }
  }, [continuityKey])

  useFrame(({ clock }, delta) => {
    const motionGroup = group.current
    const rest = groupRest.current

    if (!motionGroup || !rest || document.visibilityState === 'hidden') return

    if (reducedMotion) {
      restoreRestPose(motionGroup, rest, wings.current, wingRest.current)
      return
    }

    const elapsed = (performance.now() - cueStartedAt.current) / 1000
    const duration = getDocentCueDuration(cue)
    const activeCue = duration !== null && elapsed >= duration ? 'idle' : cue
    writeDocentMotion(activeCue, elapsed, clock.elapsedTime, targetMotion.current)
    const transitionProgress = Math.min((performance.now() - cueTransitionStartedAt.current) / 1000 / CUE_TRANSITION_DURATION, 1)
    blendMotion(appliedMotion.current, transitionFromMotion.current, targetMotion.current, smoothstep(transitionProgress))
    const nextMotion = appliedMotion.current
    const blend = 1 - Math.exp(-delta * 13)

    motionGroup.position.x = THREE.MathUtils.lerp(motionGroup.position.x, rest.position.x + nextMotion.positionX, blend)
    motionGroup.position.y = THREE.MathUtils.lerp(motionGroup.position.y, rest.position.y + nextMotion.positionY, blend)
    motionGroup.position.z = THREE.MathUtils.lerp(motionGroup.position.z, rest.position.z + nextMotion.positionZ, blend)
    motionGroup.rotation.x = THREE.MathUtils.lerp(motionGroup.rotation.x, rest.rotation.x + nextMotion.rotationX, blend)
    motionGroup.rotation.y = THREE.MathUtils.lerp(motionGroup.rotation.y, rest.rotation.y + nextMotion.rotationY, blend)
    motionGroup.rotation.z = THREE.MathUtils.lerp(motionGroup.rotation.z, rest.rotation.z + nextMotion.rotationZ, blend)

    wings.current.forEach((wing, index) => {
      const wingTransform = wingRest.current[index]
      if (!wingTransform) return
      const isLeft = index === 0
      const bow = isLeft ? nextMotion.leftWingBow : nextMotion.rightWingBow
      const lift = isLeft ? nextMotion.leftWingLift : nextMotion.rightWingLift

      wing.rotation.x = THREE.MathUtils.lerp(wing.rotation.x, wingTransform.rotation.x + bow, blend)
      wing.rotation.y = THREE.MathUtils.lerp(wing.rotation.y, wingTransform.rotation.y + lift, blend)
      wing.rotation.z = THREE.MathUtils.lerp(wing.rotation.z, wingTransform.rotation.z, blend)
    })
  })

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} />
      </Center>
      {cue === 'listen' ? (
        <Suspense fallback={null}>
          <ListeningQuestion reducedMotion={reducedMotion} />
        </Suspense>
      ) : null}
      {cue === 'scan' ? <ProductRecognitionHalo reducedMotion={reducedMotion} /> : null}
      {cue === 'success' || cue === 'request-success' ? <SuccessSparkles reducedMotion={reducedMotion} /> : null}
      {cue === 'request-success' ? <RequestCheckmark reducedMotion={reducedMotion} /> : null}
    </group>
  )
}

function RequestCheckmark({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(CHECKMARK_URL)
  const mark = useRef<THREE.Group>(null)
  const startedAt = useRef(performance.now())

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return
        material.color.set('#e7c16a')
        material.emissive.set('#5b3a09')
        material.emissiveIntensity = 0.16
        material.metalness = Math.max(material.metalness, 0.68)
        material.roughness = Math.min(material.roughness, 0.28)
        material.needsUpdate = true
      })
    })
  }, [scene])

  useFrame(({ clock }) => {
    const model = mark.current
    if (!model) return

    const elapsed = (performance.now() - startedAt.current) / 1000
    const progress = reducedMotion ? 1 : Math.min(elapsed / 0.72, 1)
    const spring = reducedMotion ? 0 : Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.18
    const scale = reducedMotion ? 0.1 : 0.08 + progress * 0.02

    model.position.y = 2.35 + spring + Math.sin(clock.elapsedTime * 1.1) * (reducedMotion ? 0 : 0.018)
    model.scale.setScalar(scale)
  })

  return (
    <group ref={mark} position={[0.294, 2.35, 0.42]} scale={0.08}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

function SuccessSparkles({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const materials = useRef<THREE.MeshBasicMaterial[]>([])
  const startedAt = useRef(performance.now())
  const origins = [
    new THREE.Vector3(-0.78, 0.5, 0.35),
    new THREE.Vector3(-0.35, 1.05, 0.42),
    new THREE.Vector3(0.36, 1.1, 0.38),
    new THREE.Vector3(0.8, 0.38, 0.3),
    new THREE.Vector3(0, 1.48, 0.32),
  ]

  useFrame(() => {
    const sparkles = group.current
    if (!sparkles) return

    const elapsed = (performance.now() - startedAt.current) / 1000
    const progress = reducedMotion ? 0.5 : Math.min(elapsed / 1.35, 1)
    const burst = Math.sin(progress * Math.PI)

    sparkles.children.forEach((child, index) => {
      const origin = origins[index]
      if (!origin) return
      const direction = index % 2 === 0 ? 1 : -1
      child.position.set(
        origin.x + direction * burst * 0.17,
        origin.y + burst * 0.2,
        origin.z,
      )
      child.scale.setScalar(reducedMotion ? 0.65 : 0.4 + burst * 0.8)
      const material = materials.current[index]
      if (material) material.opacity = reducedMotion ? 0.34 : burst * 0.72
    })
  })

  return (
    <group ref={group}>
      {origins.map((origin, index) => (
        <mesh key={index} position={origin}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial
            ref={(material) => {
              if (material) materials.current[index] = material
            }}
            color="#ffe6a3"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function ProductRecognitionHalo({ reducedMotion }: { reducedMotion: boolean }) {
  const halo = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const group = halo.current
    if (!group) return

    const breathe = reducedMotion ? 0.5 : (Math.sin(clock.elapsedTime * 0.58) + 1) / 2
    const scale = 0.94 + breathe * 0.09
    group.scale.set(scale, scale * 0.42, 1)
    group.position.y = -1.18 + (reducedMotion ? 0 : breathe * 0.035)
    if (material.current) material.current.opacity = reducedMotion ? 0.1 : 0.075 + breathe * 0.075
  })

  return (
    <group ref={halo} position={[0, -1.18, 0.7]}>
      <mesh>
        <ringGeometry args={[1.14, 1.17, 96]} />
        <meshBasicMaterial ref={material} color="#f2d68a" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}

function ListeningQuestion({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(QUESTION_MARK_URL)
  const question = useRef<THREE.Group>(null)
  const startedAt = useRef(performance.now())

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return
        material.color.set('#fffdf7')
        material.emissive.set('#fff5d6')
        material.emissiveIntensity = 0.18
        material.metalness = 0.76
        material.roughness = 0.2
      })
    })
  }, [scene])

  useFrame(({ clock }) => {
    const model = question.current
    if (!model) return

    if (reducedMotion) {
      model.position.x = 0.32
      model.position.y = QUESTION_MARK_HEIGHT
      model.rotation.z = QUESTION_MARK_BASE_ROTATION
      model.scale.setScalar(QUESTION_MARK_SCALE)
      return
    }

    const elapsed = (performance.now() - startedAt.current) / 1000
    const progress = Math.min(elapsed / 1.1, 1)
    const spring = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.24
    const squash = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.055

    model.position.x = 0.32
    model.position.y = QUESTION_MARK_HEIGHT + spring
    model.rotation.z = QUESTION_MARK_BASE_ROTATION + Math.sin(clock.elapsedTime * 1.2) * (Math.PI / 36)
    model.scale.set(
      QUESTION_MARK_SCALE * (1 - squash),
      QUESTION_MARK_SCALE * (1 + squash),
      QUESTION_MARK_SCALE,
    )
  })

  return (
    <group ref={question} rotation={[0, 0, QUESTION_MARK_BASE_ROTATION]} scale={QUESTION_MARK_SCALE}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function CameraFraming({ cue }: { cue: DocentCue }) {
  const { camera } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return

    if (cue === 'listen') {
      // 물음표까지 담을 만큼 세로 프레임을 넓히되, 카메라를 가까이 옮겨
      // A1의 greet cue와 도슨트 본체가 같은 크기로 보이도록 보정한다.
      camera.fov = LISTEN_CAMERA_FOV
      camera.position.set(0, 0.6, LISTEN_CAMERA_DISTANCE)
    } else {
      camera.fov = 36
      camera.position.set(0, 0, 9.75)
    }
    camera.updateProjectionMatrix()
  }, [camera, cue])

  return null
}

function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl)
    const studio = new RoomEnvironment()
    studio.traverse((object) => {
      if (object instanceof THREE.PointLight) {
        object.color.set('#f4d98f')
        object.intensity = 260
        return
      }

      if (!(object instanceof THREE.Mesh)) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]

      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set('#120b03')
          return
        }

        if (material instanceof THREE.MeshLambertMaterial) {
          material.emissive.set('#e8cb7f')
          material.emissiveIntensity *= 0.28
        }
      })
    })

    const environmentTarget = pmremGenerator.fromScene(studio, 0.04)
    const previousEnvironment = scene.environment

    scene.environment = environmentTarget.texture

    return () => {
      scene.environment = previousEnvironment
      environmentTarget.dispose()
      studio.dispose()
      pmremGenerator.dispose()
    }
  }, [gl, scene])

  return null
}

function restoreRestPose(
  group: THREE.Group | null,
  groupRest: Transform | null,
  wings: readonly THREE.Object3D[],
  wingRest: readonly Transform[],
) {
  if (group && groupRest) {
    group.position.copy(groupRest.position)
    group.rotation.copy(groupRest.rotation)
  }

  wings.forEach((wing, index) => {
    const rest = wingRest[index]
    if (!rest) return
    wing.position.copy(rest.position)
    wing.rotation.copy(rest.rotation)
  })
}

function applyMotionPose(
  group: THREE.Group,
  groupRest: Transform,
  wings: readonly THREE.Object3D[],
  wingRest: readonly Transform[],
  motion: DocentMotion,
) {
  group.position.set(
    groupRest.position.x + motion.positionX,
    groupRest.position.y + motion.positionY,
    groupRest.position.z + motion.positionZ,
  )
  group.rotation.set(
    groupRest.rotation.x + motion.rotationX,
    groupRest.rotation.y + motion.rotationY,
    groupRest.rotation.z + motion.rotationZ,
  )

  wings.forEach((wing, index) => {
    const rest = wingRest[index]
    if (!rest) return
    const isLeft = index === 0

    wing.rotation.set(
      rest.rotation.x + (isLeft ? motion.leftWingBow : motion.rightWingBow),
      rest.rotation.y + (isLeft ? motion.leftWingLift : motion.rightWingLift),
      rest.rotation.z,
    )
  })
}

function takeContinuityMotion(continuityKey: string | undefined): DocentMotion | null {
  if (!continuityKey) return null

  const stored = continuityMotion.get(continuityKey)
  continuityMotion.delete(continuityKey)

  if (!stored || performance.now() - stored.storedAt > CONTINUITY_WINDOW_MS) return null
  return stored.motion
}

function storeContinuityMotion(continuityKey: string | undefined, motion: DocentMotion) {
  if (!continuityKey) return

  continuityMotion.set(continuityKey, {
    motion: { ...motion },
    storedAt: performance.now(),
  })
}

function copyMotion(target: DocentMotion, source: DocentMotion) {
  target.positionX = source.positionX
  target.positionY = source.positionY
  target.positionZ = source.positionZ
  target.rotationX = source.rotationX
  target.rotationY = source.rotationY
  target.rotationZ = source.rotationZ
  target.leftWingBow = source.leftWingBow
  target.leftWingLift = source.leftWingLift
  target.rightWingBow = source.rightWingBow
  target.rightWingLift = source.rightWingLift
}

function blendMotion(target: DocentMotion, from: DocentMotion, to: DocentMotion, progress: number) {
  target.positionX = THREE.MathUtils.lerp(from.positionX, to.positionX, progress)
  target.positionY = THREE.MathUtils.lerp(from.positionY, to.positionY, progress)
  target.positionZ = THREE.MathUtils.lerp(from.positionZ, to.positionZ, progress)
  target.rotationX = THREE.MathUtils.lerp(from.rotationX, to.rotationX, progress)
  target.rotationY = THREE.MathUtils.lerp(from.rotationY, to.rotationY, progress)
  target.rotationZ = THREE.MathUtils.lerp(from.rotationZ, to.rotationZ, progress)
  target.leftWingBow = THREE.MathUtils.lerp(from.leftWingBow, to.leftWingBow, progress)
  target.leftWingLift = THREE.MathUtils.lerp(from.leftWingLift, to.leftWingLift, progress)
  target.rightWingBow = THREE.MathUtils.lerp(from.rightWingBow, to.rightWingBow, progress)
  target.rightWingLift = THREE.MathUtils.lerp(from.rightWingLift, to.rightWingLift, progress)
}

function smoothstep(progress: number) {
  return progress * progress * (3 - 2 * progress)
}

export default function DocentCanvas({ cue, continuityKey }: { cue: DocentCue; continuityKey?: string }) {
  const reducedMotion = useReducedMotionPreference()

  return (
    <>
      <Canvas aria-hidden camera={{ fov: 36, position: [0, 0, 9.75] }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight color="#ffe7a6" intensity={2.2} position={[3, 4, 4]} />
        <pointLight color="#fff2c4" intensity={8} distance={5} position={[0, 1.4, 4]} />
        <StudioEnvironment />
      <CameraFraming cue={cue} />
        <Model continuityKey={continuityKey} cue={cue} reducedMotion={reducedMotion} />
      </Canvas>
    </>
  )
}

useGLTF.preload(MODEL_URL)
useGLTF.preload(CHECKMARK_URL)
