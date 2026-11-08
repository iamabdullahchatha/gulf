import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

interface StageProps {
  active: boolean
  onReady: () => void
  camera: { position: [number, number, number]; fov?: number }
  children: ReactNode
  shadows?: { scale: number; y?: number; opacity?: number } | false
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(onReady)
  })
  return null
}

/** Canvas with the shared studio lighting, a baked environment for metal reflections and soft contact shadows. */
export function Stage({ active, onReady, camera, children, shadows = { scale: 24 } }: StageProps) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75))
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: camera.position, fov: camera.fov ?? 35, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 5]} intensity={1.7} />
      <directionalLight position={[-7, 4, -6]} intensity={0.7} color="#4dd6bd" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#6cb6f2" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#4dd6bd" position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[0, 2, 7]} scale={3} />
      </Environment>
      {children}
      {shadows && (
        <ContactShadows position={[0, shadows.y ?? 0.002, 0]} scale={shadows.scale} opacity={shadows.opacity ?? 0.55} blur={2.2} far={9} resolution={512} frames={1} color="#000814" />
      )}
      <ReadySignal onReady={onReady} />
    </Canvas>
  )
}

interface RigProps {
  target: THREE.Vector3Tuple
  radius: number
  height: number
  /** Azimuth in radians at scroll 0 and scroll 1. */
  sweep: [number, number]
  scroll: { current: number }
  still: boolean
  /** Optional override, e.g. a focused unit. */
  focus?: { target: THREE.Vector3Tuple; radius: number; height: number; azimuth?: number } | null
  idleSpin?: number
}

const tmpTarget = new THREE.Vector3()
const tmpPos = new THREE.Vector3()

/** Scroll-linked orbit with pointer parallax and smooth focus transitions. */
export function Rig({ target, radius, height, sweep, scroll, still, focus, idleSpin = 0 }: RigProps) {
  const camera = useThree((s) => s.camera)
  const look = useRef(new THREE.Vector3(...target))
  const spin = useRef(0)
  const first = useRef(true)
  useEffect(() => {
    first.current = true
  }, [still])
  useFrame((state, dt) => {
    if (!still) spin.current += dt * idleSpin
    const t = THREE.MathUtils.smootherstep(scroll.current, 0, 1)
    const az = (focus?.azimuth ?? THREE.MathUtils.lerp(sweep[0], sweep[1], t)) + spin.current + (still ? 0 : state.pointer.x * 0.18)
    const r = focus?.radius ?? radius
    const h = (focus?.height ?? height) + (still ? 0 : state.pointer.y * 0.6)
    tmpTarget.set(...(focus?.target ?? target))
    tmpPos.set(tmpTarget.x + Math.sin(az) * r, tmpTarget.y + h, tmpTarget.z + Math.cos(az) * r)
    const k = first.current ? 1 : 1 - Math.exp(-dt * 3)
    first.current = false
    camera.position.lerp(tmpPos, k)
    look.current.lerp(tmpTarget, k)
    camera.lookAt(look.current)
  })
  return null
}
