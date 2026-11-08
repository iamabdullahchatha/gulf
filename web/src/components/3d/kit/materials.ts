import * as THREE from 'three'

const std = (color: string, metalness: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })

/** Shared industrial materials, created once per page load and reused by every scene. */
export const M = {
  steel: std('#b9c4d0', 0.85, 0.3),
  darkSteel: std('#3c4a5c', 0.75, 0.42),
  white: std('#e6ebf0', 0.25, 0.45),
  blue: std('#0b6fc0', 0.55, 0.32),
  royal: std('#123f78', 0.5, 0.4),
  teal: std('#00b99a', 0.35, 0.35),
  yellow: std('#d9a521', 0.35, 0.45),
  concrete: std('#6c7887', 0.05, 0.9),
  ground: std('#0a1e38', 0.15, 0.92),
  water: std('#0b2f5a', 0.65, 0.12, { transparent: true, opacity: 0.9 }),
  flame: new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
  glow: new THREE.MeshBasicMaterial({ color: '#4dd6bd', toneMapped: false }),
  highlight: std('#4dd6bd', 0.3, 0.3, { emissive: '#00b99a', emissiveIntensity: 0.6 }),
}
