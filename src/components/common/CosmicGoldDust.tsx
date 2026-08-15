import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 480
const FIELD_DEPTH = 3.7
const DRIFT_SPEED = 0.252
const WARP_SPEED = 0.63
const FADE_IN_MS = 2_200

const VERTEX_SHADER = `
attribute float size;
uniform float iTime;
uniform vec3 iShift;
uniform vec2 iResolution;
uniform float uDepth;
varying float transparency;
varying float warmness;

vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
  pos *= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b2;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.z = abs(pos.z);
  return pos.xyz;
}

void main() {
  vec3 v = warp3d(position, iTime);
  v = uDepth * (2. * fract(v + iShift) - 1.);
  vec4 vpos = modelViewMatrix * vec4(v, 1.);
  transparency = step(length(v), uDepth);
  warmness = step(.75, fract(size * 7.13));
  gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
  gl_Position = projectionMatrix * vpos;
}
`

const FRAGMENT_SHADER = `
varying float transparency;
varying float warmness;
uniform float iAlpha;
uniform vec3 uCool;
uniform vec3 uWarm;

void main() {
  vec3 color = mix(uCool * .8, uWarm * .8, warmness);
  float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
  gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
}
`

function smootherstep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10)
}

function DustField() {
  const { gl, size } = useThree()

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3
      positions[offset] = 2 * Math.random() - 1
      positions[offset + 1] = 2 * Math.random() - 1
      positions[offset + 2] = 2 * Math.random() - 1
      sizes[index] = 25 + 25 * Math.random()
    }

    const nextGeometry = new THREE.BufferGeometry()
    nextGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    nextGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const nextMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        iAlpha: { value: 0 },
        iResolution: { value: new THREE.Vector2(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio()) },
        iShift: { value: new THREE.Vector3() },
        iTime: { value: 0 },
        uCool: { value: new THREE.Color('#8a5111') },
        uDepth: { value: FIELD_DEPTH },
        uWarm: { value: new THREE.Color('#f2d68a') },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    })

    return { geometry: nextGeometry, material: nextMaterial }
  }, [gl, size.height, size.width])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  const pointCloud = useMemo(() => new THREE.Points(geometry, material), [geometry, material])

  useFrame(({ camera, clock }) => {
    const elapsedMs = clock.getElapsedTime() * 1_000
    const fadeProgress = Math.min(elapsedMs / FADE_IN_MS, 1)
    const uniforms = material.uniforms

    uniforms.iTime.value = (performance.now() / 1_000) * WARP_SPEED
    uniforms.iAlpha.value = smootherstep(fadeProgress) * 0.68
    uniforms.iShift.value.addScaledVector(camera.position, 0.0022 * DRIFT_SPEED)

    const resolution = uniforms.iResolution.value as THREE.Vector2
    resolution.set(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio())
  })

  return <primitive object={pointCloud} position={[0, 0, -1]} />
}

/** Transparent adaptation of the provided Cosmic Dust scene for the existing bronze surface. */
interface CosmicGoldDustProps {
  isExiting?: boolean
}

export function CosmicGoldDust({ isExiting = false }: CosmicGoldDustProps) {
  return (
    <div aria-hidden="true" className={`cosmic-gold-dust${isExiting ? ' cosmic-gold-dust--exiting' : ''}`}>
      <Canvas
        camera={{ fov: 45, position: [0, 0, 3] }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <DustField />
      </Canvas>
    </div>
  )
}
