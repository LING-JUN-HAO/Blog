import type * as ThreeTypes from 'three'

export type WhaleColors = {
  body: string
  belly: string
  accent: string
  ink: string
}

export type Whale = {
  group: ThreeTypes.Group
  /** Update the idle animation and water spray. `time` is measured in seconds. */
  animate: (time: number) => void
  /** Make the whale hop happily and burst a big splash of water; `strength` > 1 for a stronger burst (clicks). */
  splash: (strength?: number) => void
  /** Pointer hovering: the tail wags faster, the eyes squint happily and the cheeks blush. */
  setHover: (hovering: boolean) => void
  dispose: () => void
}

/**
 * A chubby baby whale facing +X. The body is one tapered tube that sweeps up
 * into a horizontal two-lobed fluke, so the silhouette reads as a whale even
 * at small sizes.
 */
export function createWhale(
  THREE: typeof ThreeTypes,
  colors: WhaleColors,
): Whale {
  const group = new THREE.Group()
  group.name = 'dream-whale'

  const liftedColor = (color: string, amount: number): ThreeTypes.Color =>
    new THREE.Color(color).lerp(new THREE.Color('#ffffff'), amount)

  // Soft matte clay: high roughness everywhere, no metalness.
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: liftedColor(colors.body, 0.07),
    roughness: 0.74,
    metalness: 0,
  })
  const bellyMaterial = new THREE.MeshStandardMaterial({
    color: liftedColor(colors.belly, 0.04),
    roughness: 0.8,
    metalness: 0,
  })
  const cheekMaterial = new THREE.MeshStandardMaterial({
    color: liftedColor(colors.accent, 0.18),
    roughness: 0.82,
    metalness: 0,
  })
  const inkMaterial = new THREE.MeshStandardMaterial({
    color: colors.ink,
    roughness: 0.25,
    metalness: 0,
  })
  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0,
  })
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: '#8fd0f5',
    emissive: '#4f9fe0',
    emissiveIntensity: 0.4,
    roughness: 0.35,
    metalness: 0,
  })

  // Keeping the anatomy in its own group lets it breathe without making the
  // water spout swell at the same time.
  const anatomy = new THREE.Group()
  anatomy.name = 'anatomy'
  group.add(anatomy)

  // --- Body: a tube along a spine curve, fat at the head and tapering as it
  // rises toward the tail.
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.6, 0, 0),
    new THREE.Vector3(-0.2, -0.1, 0),
    new THREE.Vector3(-2.3, 0.15, 0),
    new THREE.Vector3(-3.9, 0.95, 0),
    new THREE.Vector3(-4.85, 2.05, 0),
    new THREE.Vector3(-5.3, 3.0, 0),
  ])
  const tubularSegments = 72
  const radialSegments = 36
  const bodyGeometry = new THREE.TubeGeometry(spine, tubularSegments, 1, radialSegments, false)
  const bodyRadius = (t: number) => 0.42 + 2.83 * Math.cos((t * Math.PI) / 2) ** 1.5
  const position = bodyGeometry.attributes.position as ThreeTypes.BufferAttribute
  const vertex = new THREE.Vector3()
  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = i / tubularSegments
    const centre = spine.getPointAt(t)
    const radius = bodyRadius(t)
    for (let j = 0; j <= radialSegments; j += 1) {
      const index = i * (radialSegments + 1) + j
      vertex.fromBufferAttribute(position, index).sub(centre).multiplyScalar(radius)
      vertex.z *= 0.95
      vertex.add(centre)
      position.setXYZ(index, vertex.x, vertex.y, vertex.z)
    }
  }
  bodyGeometry.computeVertexNormals()
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.name = 'body'
  anatomy.add(body)

  // The round head caps the front of the tube and gives the face its dome.
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), bodyMaterial)
  head.name = 'head'
  head.position.set(1.6, 0, 0)
  head.scale.set(3.4, 3.25, 3.1)
  anatomy.add(head)

  // A wide creamy belly covering the lower front half.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 28), bellyMaterial)
  belly.name = 'belly'
  belly.position.set(1.15, -1.3, 0)
  belly.scale.set(3.85, 2.0, 2.92)
  anatomy.add(belly)

  // --- Tail: a horizontal two-lobed fluke at the end of the spine.
  const tail = new THREE.Group()
  tail.name = 'tail'
  tail.position.copy(spine.getPointAt(1))
  tail.rotation.z = -0.95
  anatomy.add(tail)

  const tailCap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), bodyMaterial)
  tailCap.name = 'tail-cap'
  tail.add(tailCap)

  // Outline in (span, backward) coordinates with a small notch in the middle
  // of the trailing edge, the detail that separates a whale from a fish.
  const flukeShape = new THREE.Shape()
  flukeShape.moveTo(0, 0)
  flukeShape.bezierCurveTo(0.9, 0.02, 1.85, 0.2, 2.4, 0.92)
  flukeShape.bezierCurveTo(2.25, 1.42, 1.05, 1.32, 0.14, 0.96)
  flukeShape.lineTo(0, 0.78)
  flukeShape.lineTo(-0.14, 0.96)
  flukeShape.bezierCurveTo(-1.05, 1.32, -2.25, 1.42, -2.4, 0.92)
  flukeShape.bezierCurveTo(-1.85, 0.2, -0.9, 0.02, 0, 0)
  const flukeGeometry = new THREE.ExtrudeGeometry(flukeShape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.14,
    bevelThickness: 0.13,
    curveSegments: 24,
    steps: 1,
  })
  flukeGeometry.translate(0, 0, -0.13)
  // Shape x → span along Z, shape y → backward along -X, thickness → Y.
  flukeGeometry.rotateX(Math.PI / 2)
  flukeGeometry.rotateY(-Math.PI / 2)
  const fluke = new THREE.Mesh(flukeGeometry, bodyMaterial)
  fluke.name = 'fluke'
  fluke.position.x = 0.15
  tail.add(fluke)

  // --- Flippers: pivots sit at the shoulder so they swing naturally. The
  // near flipper rests back along the belly; the far one is lifted in a shy
  // little wave.
  const flipperGeometry = new THREE.CapsuleGeometry(0.55, 1.35, 10, 20)
  const createFlipper = (side: -1 | 1) => {
    const pivot = new THREE.Group()
    pivot.name = side > 0 ? 'near-flipper' : 'far-flipper'
    pivot.position.set(2.15, -1.45, side * 2.55)
    const flipper = new THREE.Mesh(flipperGeometry, bodyMaterial)
    flipper.position.y = -1.0
    flipper.scale.set(0.78, 1, 0.4)
    pivot.add(flipper)
    anatomy.add(pivot)
    return pivot
  }
  const nearFlipper = createFlipper(1)
  nearFlipper.rotation.set(-0.55, 0, -0.75)
  const farFlipper = createFlipper(-1)
  farFlipper.rotation.set(1.05, 0, 0.85)

  // --- Face.
  const eyeGeometry = new THREE.SphereGeometry(0.42, 32, 24)
  const largeHighlightGeometry = new THREE.SphereGeometry(0.12, 18, 12)
  const smallHighlightGeometry = new THREE.SphereGeometry(0.06, 14, 10)
  const cheekGeometry = new THREE.SphereGeometry(1, 28, 18)
  const eyeRigs: ThreeTypes.Group[] = []
  const cheeks: ThreeTypes.Mesh[] = []

  for (const side of [-1, 1] as const) {
    const eyeRig = new THREE.Group()
    eyeRig.name = side > 0 ? 'near-eye-rig' : 'far-eye-rig'
    eyeRig.position.set(4.4, 0.4, side * 1.55)
    anatomy.add(eyeRig)
    eyeRigs.push(eyeRig)

    const eye = new THREE.Mesh(eyeGeometry, inkMaterial)
    eye.name = 'eye'
    eyeRig.add(eye)

    const largeHighlight = new THREE.Mesh(largeHighlightGeometry, highlightMaterial)
    largeHighlight.position.set(0.34, 0.17, side * 0.12)
    eyeRig.add(largeHighlight)

    const smallHighlight = new THREE.Mesh(smallHighlightGeometry, highlightMaterial)
    smallHighlight.position.set(0.38, -0.1, side * 0.2)
    eyeRig.add(smallHighlight)

    // Thin discs turned to lie on the head's surface.
    const cheek = new THREE.Mesh(cheekGeometry, cheekMaterial)
    cheek.name = 'cheek'
    cheek.position.set(4.0, -0.42, side * 2.12)
    cheek.rotation.y = -side * 0.8
    cheek.scale.set(0.14, 0.4, 0.5)
    anatomy.add(cheek)
    cheeks.push(cheek)
  }

  // A small, slightly lopsided smile for a shy, playful expression.
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.9, -0.2, -0.42),
    new THREE.Vector3(4.96, -0.4, -0.18),
    new THREE.Vector3(4.97, -0.44, 0.05),
    new THREE.Vector3(4.95, -0.36, 0.28),
    new THREE.Vector3(4.9, -0.18, 0.45),
  ])
  const smile = new THREE.Mesh(
    new THREE.TubeGeometry(smileCurve, 24, 0.05, 8, false),
    inkMaterial,
  )
  smile.name = 'smile'
  anatomy.add(smile)

  // --- Signature three-droplet spout fanning out of the blowhole.
  const spout = new THREE.Group()
  spout.name = 'spout'
  spout.position.set(1.9, 3.05, 0)
  group.add(spout)

  // The water column grows and shrinks; its geometry starts at the blowhole so
  // scaling Y stretches it upward only.
  const stemGeometry = new THREE.CylinderGeometry(0.1, 0.18, 1, 16)
  stemGeometry.translate(0, 0.5, 0)
  const stem = new THREE.Mesh(stemGeometry, waterMaterial)
  stem.name = 'spout-column'
  spout.add(stem)

  // The fan of drops rides on top of the column.
  const crown = new THREE.Group()
  crown.name = 'spout-crown'
  spout.add(crown)

  const dropGeometry = new THREE.SphereGeometry(1, 24, 18)
  const dropData: ReadonlyArray<readonly [number, number, number]> = [
    // [tilt toward Z, height, size]
    [0, 1.0, 0.34],
    [0.75, 0.72, 0.27],
    [-0.75, 0.72, 0.27],
  ]
  dropData.forEach(([tilt, height, size], index) => {
    const drop = new THREE.Mesh(dropGeometry, waterMaterial)
    drop.name = `spout-drop-${index + 1}`
    drop.position.set(0, Math.cos(tilt) * height * 0.6, Math.sin(tilt) * height * 0.6)
    drop.rotation.x = tilt
    drop.scale.set(size * 0.82, size * 1.25, size * 0.82)
    crown.add(drop)
  })

  // Centre the complete silhouette, including fins, tail, and the spout.
  const boundsCenter = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3())
  group.children.forEach(child => child.position.sub(boundsCenter))

  // Guard against future proportion tweaks escaping the intended radius.
  const radius = new THREE.Box3()
    .setFromObject(group)
    .getBoundingSphere(new THREE.Sphere()).radius
  if (radius > 9.8) group.scale.setScalar(9.8 / radius)

  // Sit a little low in the frame so the tall spray has headroom.
  group.children.forEach(child => (child.position.y -= 1.6))

  // --- Spray particles, added after framing so they never affect the bounds.
  const sprayCount = 160
  const spray = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), waterMaterial, sprayCount)
  spray.name = 'spray'
  spray.frustumCulled = false
  group.add(spray)
  const particles = Array.from({ length: sprayCount }, () => ({
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    size: 0,
    age: 0,
    life: 0,
    // 1 = water drop; negative = bubble floating up
    gravityScale: 1,
  }))
  // Where bubbles leave the mouth and where the landing splash starts, in the group's local space.
  group.updateMatrixWorld(true)
  const mouth = group.worldToLocal(smile.getWorldPosition(new THREE.Vector3()))
  const bellyY = group.worldToLocal(new THREE.Box3().setFromObject(anatomy).min.clone()).y
  const dummy = new THREE.Object3D()
  const gravity = 9.5
  let nextParticle = 0

  const emit = (count: number, power: number) => {
    for (let i = 0; i < count; i += 1) {
      const particle = particles[nextParticle]!
      nextParticle = (nextParticle + 1) % sprayCount
      const angle = Math.random() * Math.PI * 2
      const spread = (0.4 + Math.random() * 1.1) * power * 0.18
      particle.position.set(spout.position.x, spout.position.y + stem.scale.y * spout.scale.y, spout.position.z)
      particle.velocity.set(
        Math.cos(angle) * spread,
        power * (0.85 + Math.random() * 0.3),
        Math.sin(angle) * spread,
      )
      particle.size = 0.1 + Math.random() * 0.14
      particle.age = 0
      particle.life = 1.6 + Math.random() * 0.6
      particle.gravityScale = 1
    }
  }

  // Splash ring thrown sideways from the belly when the whale lands.
  const emitSplash = (count: number) => {
    for (let i = 0; i < count; i += 1) {
      const particle = particles[nextParticle]!
      nextParticle = (nextParticle + 1) % sprayCount
      const angle = Math.random() * Math.PI * 2
      const speed = 2.2 + Math.random() * 2.4
      particle.position.set(Math.cos(angle) * 2.6, bellyY + 0.6, Math.sin(angle) * 1.6)
      particle.velocity.set(Math.cos(angle) * speed, 3.5 + Math.random() * 3, Math.sin(angle) * speed * 0.6)
      particle.size = 0.08 + Math.random() * 0.12
      particle.age = 0
      particle.life = 1 + Math.random() * 0.5
      particle.gravityScale = 1
    }
  }

  // Idle bubbles drifting up from the mouth.
  const emitBubbles = (count: number) => {
    for (let i = 0; i < count; i += 1) {
      const particle = particles[nextParticle]!
      nextParticle = (nextParticle + 1) % sprayCount
      particle.position.set(mouth.x + 0.3 + Math.random() * 0.3, mouth.y + Math.random() * 0.3, mouth.z + (Math.random() - 0.5) * 0.6)
      particle.velocity.set(0.3 + Math.random() * 0.3, 0.9 + Math.random() * 0.5, (Math.random() - 0.5) * 0.3)
      particle.size = 0.14 + Math.random() * 0.16
      particle.age = 0
      particle.life = 2.6 + Math.random() * 1.2
      particle.gravityScale = -0.04
    }
  }

  const baseY = group.position.y
  const spoutBaseY = spout.position.y
  const tailBase = tail.rotation.z
  const nearFlipperBase = nearFlipper.rotation.z
  const farFlipperBase = farFlipper.rotation.x
  let disposed = false

  // Playful hops: one every few seconds on its own, or right away on splash().
  const hopDuration = 1.0
  const hopInterval = 5.5
  let clock = 0
  let lastTime: number | undefined
  let hopStart = -Infinity
  let nextHop = 2.5
  let burstPending = false
  let burstStrength = 1
  let landingPending = false
  let emitCarry = 0
  let hoverTarget = 0
  let hover = 0
  let nextBubble = 4

  const startHop = () => {
    if (clock - hopStart < hopDuration * 0.6) return
    hopStart = clock
    nextHop = clock + hopInterval + Math.random() * 2
    burstPending = true
    landingPending = true
  }

  const animate = (time: number): void => {
    if (disposed) return
    const dt = lastTime === undefined ? 0 : Math.min(time - lastTime, 0.05)
    lastTime = time
    clock = time
    if (clock >= nextHop) startHop()

    // 0 → 1 over the hop; `joy` stays high for a moment afterwards.
    const hop = Math.min(Math.max((clock - hopStart) / hopDuration, 0), 1)
    const hopping = hop > 0 && hop < 1
    const joy = Math.max(0, 1 - Math.max(clock - hopStart - hopDuration * 0.5, 0) / 1.2)
    const lift = hopping ? Math.sin(hop * Math.PI) : 0
    // Squash on take-off and landing, stretch in the air.
    const squash = hopping ? Math.sin(hop * Math.PI * 2) * -0.07 * (1 - hop) : 0
    // Ease toward the hover state so entering and leaving never snaps.
    hover += (hoverTarget - hover) * Math.min(1, dt * 6)

    group.position.y = baseY + Math.sin(time * 0.8) * 0.1 + lift * 1.1
    group.rotation.z = Math.sin(time * 0.55) * 0.012 + lift * 0.12
    group.rotation.y = Math.sin(time * 1.3) * 0.06
    group.rotation.x = Math.sin(time * 0.9) * 0.03

    const breath = 1 + Math.sin(time * 1.45) * 0.014
    anatomy.scale.set(
      (1 + (breath - 1) * 0.45) * (1 - squash * 0.6),
      breath * (1 + squash),
      breath * (1 - squash * 0.6),
    )

    // The tail flicks hard during a hop, gently otherwise.
    // Hovering adds a quicker, happier wag on top of the idle sway.
    tail.rotation.z = tailBase + Math.sin(time * 1.08) * 0.14 + Math.sin(time * 6) * 0.22 * hover + Math.sin(hop * Math.PI * 3) * 0.35 * lift
    nearFlipper.rotation.z = nearFlipperBase + Math.sin(time * 1.12) * 0.08 + lift * 0.35
    const wave = Math.max(Math.max(0, Math.sin(time * 0.9)) ** 3, joy)
    farFlipper.rotation.x = farFlipperBase + Math.sin(time * 7) * 0.22 * wave

    // Happy squint while playing, regular blinks otherwise.
    const blinkTime = (time + 0.35) % 4.2
    const blinkProgress = Math.min(blinkTime / 0.2, 1)
    const blink = blinkTime < 0.2
      ? 0.12 + Math.abs(Math.cos(blinkProgress * Math.PI)) * 0.88
      : 1
    const eyeOpen = Math.min(blink, 1 - Math.max(joy * 0.65, hover * 0.45))
    eyeRigs.forEach(eyeRig => eyeRig.scale.set(1, eyeOpen, 1))
    // Blush while hovered or playing.
    const blush = 1 + Math.max(hover, joy) * 0.35
    cheeks.forEach(cheek => cheek.scale.set(0.14, 0.4 * blush, 0.5 * blush))

    // The column stretches tall in a rhythm and shoots highest at a hop.
    const pulse = (Math.sin(time * 2.2) + 1) / 2
    stem.scale.y = 0.9 + pulse * 1.1 + joy * 1.4
    crown.position.y = stem.scale.y
    crown.rotation.y = Math.sin(time * 3) * 0.3
    const spoutPulse = 1 + Math.sin(time * 4.4) * 0.06
    crown.scale.setScalar(spoutPulse + joy * 0.25)
    spout.position.y = spoutBaseY

    // Continuous spray, plus a big burst near the top of every hop.
    emitCarry += dt * (18 + pulse * 20 + joy * 36)
    const steady = Math.floor(emitCarry)
    emitCarry -= steady
    if (steady > 0) emit(steady, 8.5 + pulse * 2.5)
    if (burstPending && hop >= 0.35) {
      burstPending = false
      // Clicks add volume more than height so the column stays inside the canvas.
      emit(Math.round(36 * burstStrength), 11.5 + (burstStrength - 1))
    }
    if (landingPending && hop >= 1) {
      landingPending = false
      emitSplash(Math.round(16 * burstStrength))
      burstStrength = 1
    }
    if (clock >= nextBubble) {
      nextBubble = clock + 3 + Math.random() * 4
      if (!hopping) emitBubbles(1 + Math.floor(Math.random() * 3))
    }

    particles.forEach((particle, index) => {
      if (particle.age < particle.life) {
        particle.age += dt
        particle.velocity.y -= gravity * particle.gravityScale * dt
        particle.position.addScaledVector(particle.velocity, dt)
      }
      const fade = Math.max(0, 1 - particle.age / particle.life)
      const alive = particle.age < particle.life && particle.position.y > bellyY - 1.5
      dummy.position.copy(particle.position)
      // Stretch drops along their direction of travel for a sense of speed.
      dummy.scale.set(1, 1 + Math.min(Math.abs(particle.velocity.y) * 0.08, 0.8), 1)
        .multiplyScalar(alive ? particle.size * (0.4 + fade * 0.6) : 0)
      dummy.updateMatrix()
      spray.setMatrixAt(index, dummy.matrix)
    })
    spray.instanceMatrix.needsUpdate = true
  }

  const splash = (strength = 1): void => {
    if (disposed) return
    // A click during a hop still tops up the burst instead of being ignored.
    burstStrength = Math.max(burstStrength, strength)
    startHop()
  }

  const setHover = (hovering: boolean): void => {
    hoverTarget = hovering ? 1 : 0
  }

  const dispose = (): void => {
    if (disposed) return
    disposed = true
    const geometries = new Set<ThreeTypes.BufferGeometry>()
    const materials = new Set<ThreeTypes.Material>()

    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      geometries.add(object.geometry)
      const meshMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material]
      meshMaterials.forEach(material => materials.add(material))
    })

    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    group.clear()
  }

  return { group, animate, splash, setHover, dispose }
}
