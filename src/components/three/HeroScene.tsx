"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef, type MutableRefObject } from "react";
import {
  Laptop, Monitor, Tower, Keyboard, Mouse, ServerRack, Switch, Router, AccessPoint, Camera, Ups,
  EnergyRing, Particles, NetLink, Floating, BRAND,
} from "./models";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** progress of p inside [a,b] eased */
const seg = (p: number, a: number, b: number) => smooth(clamp((p - a) / (b - a)));
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Key = { p: THREE.Vector3; s: number; ry: number };
/** Keyframe track: interpolates across scene boundaries. */
function track(p: number, keys: [number, Key][]): Key {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ka] = keys[i], [b, kb] = keys[i + 1];
    if (p <= b) {
      const t = smooth(clamp((p - a) / (b - a)));
      return { p: ka.p.clone().lerp(kb.p, t), s: ka.s + (kb.s - ka.s) * t, ry: ka.ry + (kb.ry - ka.ry) * t };
    }
  }
  return keys[keys.length - 1][1];
}
const K = (x: number, y: number, z: number, s: number, ry = 0): Key => ({ p: V(x, y, z), s, ry });
const HIDDEN_LOW = (x: number, z = 0) => K(x, -7, z, 0.001);

export const LABELS = [
  { id: "laptops", text: "Laptops & Notebooks", scene: 2 },
  { id: "monitors", text: "Monitors & Displays", scene: 2 },
  { id: "desktops", text: "Desktop Workstations", scene: 2 },
  { id: "peripherals", text: "Peripherals", scene: 2 },
  { id: "servers", text: "Servers & Storage", scene: 3 },
  { id: "switching", text: "Core Switching", scene: 3 },
  { id: "routers", text: "Routers & Firewalls", scene: 3 },
  { id: "wifi", text: "Enterprise Wi-Fi", scene: 3 },
  { id: "cctv", text: "CCTV & Surveillance", scene: 3 },
] as const;
export type LabelEls = MutableRefObject<Record<string, HTMLElement | null>>;

const anchors: Record<string, THREE.Object3D | null> = {};
function Anchor({ id }: { id: string }) {
  return <group ref={(o) => { anchors[id] = o; }} />;
}

function Rig({ progress, mobile, labels }: { progress: MutableRefObject<number>; mobile: boolean; labels: LabelEls }) {
  const { camera, size } = useThree();
  const wide = size.width / size.height > 1.15;
  const smoothP = useRef(0);
  const laptop = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const work = useRef<THREE.Group>(null);
  const rack = useRef<THREE.Group>(null);
  const sw = useRef<THREE.Group>(null);
  const router = useRef<THREE.Group>(null);
  const ap = useRef<THREE.Group>(null);
  const cam = useRef<THREE.Group>(null);
  const ups = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const links = useRef(0);
  const s2 = useRef(0), s3 = useRef(0);
  const linkGroup = useRef<THREE.Group>(null);
  const intro = useRef(0);

  // Layout: desktop puts the hero laptop to the right of the headline; mobile stacks.
  const lx = wide ? 1.75 : 0;
  const ly = wide ? -0.35 : -2.15;
  const my = wide ? 0 : -1.0; // mobile: keep scene-3 devices below the heading
  const S = wide ? 1 : 0.62;

  useFrame((state, dt) => {
    const target = progress.current;
    smoothP.current += (target - smoothP.current) * Math.min(1, dt * 6);
    const p = smoothP.current;
    intro.current = Math.min(1, intro.current + dt * 0.7);
    const t = state.clock.elapsedTime;

    const apply = (ref: React.RefObject<THREE.Group | null>, k: Key, extraRy = 0) => {
      if (!ref.current) return;
      ref.current.position.copy(k.p);
      ref.current.scale.setScalar(Math.max(0.001, k.s));
      ref.current.rotation.y = k.ry + extraRy;
    };

    // Laptop: hero → left in computing → recedes → joins ecosystem
    apply(laptop, track(p, [
      [0, K(lx, ly, 0, 1.55 * S, -0.5)],
      [0.14, K(lx, ly, 0, 1.55 * S, -0.35)],
      [0.3, K(wide ? -2.2 : -0.9, wide ? -0.75 : -1.6, 0.6, 1.0 * S, 0.55)],
      [0.42, K(wide ? -2.2 : -0.9, wide ? -0.75 : -1.6, 0.6, 1.0 * S, 0.55)],
      [0.55, K(-6 * S, -6, -6, 0.001, 0.8)],
      [0.66, K(-6 * S, -6, -6, 0.001, 0.8)],
      [0.8, K(-2.9 * S, -1.25, 0.9, 0.85 * S, 0.6)],
      [1, K(-2.9 * S, -1.25, -3, 0.7 * S, 0.6)],
    ]), (p < 0.14 ? Math.sin(t * 0.4) * 0.25 + t * 0.0 : 0) + (p < 0.14 ? (1 - intro.current) * -1.2 : 0));
    if (lid.current) {
      const open = Math.min(intro.current * 1.4, 1);
      lid.current.rotation.x = (1 - smooth(clamp(open))) * (Math.PI / 2) - 0.22 * smooth(clamp(open));
    }

    // Workstation rises in scene 2
    apply(work, track(p, [
      [0.16, HIDDEN_LOW(wide ? 1.2 : 0.6, -0.5)],
      [0.3, K(wide ? 1.0 : 0.5, -1.35, -0.6, 0.95 * S, -0.25)],
      [0.42, K(wide ? 1.0 : 0.5, -1.35, -0.6, 0.95 * S, -0.25)],
      [0.55, K(6 * S, -6, -6, 0.001, -0.5)],
      [0.66, K(6 * S, -6, -6, 0.001, -0.5)],
      [0.8, K(2.7 * S, -1.65, -0.2, 0.6 * S, -0.55)],
      [1, K(2.7 * S, -1.65, -3.5, 0.55 * S, -0.55)],
    ]));

    // Networking: rack, switch, router, AP, camera in scene 3
    apply(rack, track(p, [
      [0.42, HIDDEN_LOW(0, -1)],
      [0.55, K(0, -1.9, -1.2, 0.85 * S, -0.35)],
      [0.66, K(0, -1.9, -1.2, 0.85 * S, -0.35)],
      [0.8, K(0, -2.0, -2.2, 0.65 * S, -0.2)],
      [1, K(0, -2.0, -5, 0.55 * S, -0.2)],
    ]));
    apply(sw, track(p, [
      [0.44, K(2.6 * S, 4.5, -0.4, 0.001)],
      [0.57, K(2.4 * S, 1.0 + my, -0.4, 0.7 * S, -0.35)],
      [0.66, K(2.4 * S, 1.0 + my, -0.4, 0.7 * S, -0.35)],
      [0.8, K(-1.5 * S, -0.15, -1.8, 0.5 * S, 0.3)],
      [1, K(-1.5 * S, -0.15, -4, 0.45 * S, 0.3)],
    ]));
    apply(router, track(p, [
      [0.46, HIDDEN_LOW(2.2 * S, 0.5)],
      [0.58, K(2.4 * S, -1.0, 0.8, 0.8 * S, -0.6)],
      [0.66, K(2.4 * S, -1.0, 0.8, 0.8 * S, -0.6)],
      [0.8, K(1.1 * S, -1.55, 1.5, 0.5 * S, -0.4)],
      [1, K(1.1 * S, -1.55, -2, 0.45 * S, -0.4)],
    ]));
    apply(ap, track(p, [
      [0.48, K(0.9 * S, 4.5, -1.4, 0.001)],
      [0.6, K(0.9 * S, 1.4 + my, -1.4, 0.7 * S, 0)],
      [0.66, K(0.9 * S, 1.4 + my, -1.4, 0.7 * S, 0)],
      [0.8, K(1.6 * S, -0.05, -1.9, 0.55 * S, 0)],
      [1, K(1.6 * S, -0.05, -4, 0.5 * S, 0)],
    ]));
    apply(cam, track(p, [
      [0.5, K(-2.8 * S, 4.5, 0.8, 0.001)],
      [0.61, K(-2.6 * S, -1.2, 1.0, 0.75 * S, 0.6)],
      [0.66, K(-2.6 * S, -1.2, 1.0, 0.75 * S, 0.6)],
      [0.8, K(-0.5 * S, -0.3, 0.4, 0.5 * S, 0.3)],
      [1, K(-0.5 * S, -0.3, -4, 0.45 * S, 0.3)],
    ]));
    apply(ups, track(p, [
      [0.64, HIDDEN_LOW(-1.2 * S, 1.2)],
      [0.8, K(-1.5 * S, -1.75, 1.7, 0.55 * S, 0.4)],
      [1, K(-1.5 * S, -1.75, -2, 0.5 * S, 0.4)],
    ]));

    // Scene weights for labels/links
    s2.current = seg(p, 0.24, 0.3) * (1 - seg(p, 0.42, 0.47));
    s3.current = seg(p, 0.57, 0.61) * (1 - seg(p, 0.66, 0.7));
    links.current = seg(p, 0.55, 0.62) * (1 - seg(p, 0.92, 1));
    if (linkGroup.current) linkGroup.current.visible = links.current > 0.01;

    // Project label anchors to screen space (single DOM overlay, no extra React roots)
    const tmp = V(0, 0, 0);
    for (const l of LABELS) {
      const el = labels.current[l.id], a = anchors[l.id];
      if (!el || !a) continue;
      const w = l.scene === 2 ? s2.current : s3.current;
      if (w < 0.01) { el.style.opacity = "0"; continue; }
      a.getWorldPosition(tmp).project(state.camera);
      const x = Math.min(size.width - 80, Math.max(80, (tmp.x * 0.5 + 0.5) * size.width)), y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.opacity = String(w);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + (1 - w) * 10).toFixed(1)}px, 0) translate(-50%, -100%)`;
    }

    // Rings bloom during the ecosystem reveal
    if (rings.current) {
      const r = 0.42 + seg(p, 0.1, 0.3) * 0.13 + seg(p, 0.66, 0.82) * 0.9 - seg(p, 0.9, 1) * 0.6;
      rings.current.scale.setScalar(r * (wide ? 1 : 0.7));
      rings.current.rotation.x = 1.2 - seg(p, 0.66, 0.82) * 0.25;
      const intoS2 = seg(p, 0.1, 0.3);
      rings.current.position.set(lx * (1 - intoS2), (wide ? -1.1 : -2.0) * (1 - intoS2) + -1.3 * intoS2, -1);
    }

    // Camera: gentle parallax + pull back for the ecosystem
    const pull = seg(p, 0.66, 0.84);
    const z = (wide ? 8 : 10.5) + pull * (wide ? 3.2 : 4) + seg(p, 0.9, 1) * 1.5;
    const mx = mobile ? 0 : state.pointer.x * 0.35, my = mobile ? 0 : state.pointer.y * 0.2;
    camera.position.lerp(V(mx, 0.6 + my + pull * 0.8, z), Math.min(1, dt * 3));
    camera.lookAt(0, -0.3 + pull * 0.85, 0);
    if (world.current) world.current.rotation.y = pull * 0.25 * Math.sin(t * 0.2);
  });

  return (
    <group ref={world}>
      <group ref={laptop}>
        <Floating speed={0.9} amp={0.05}>
          <Laptop lidRef={lid} open={0} />
          <group position={[0, 1.15, 0]}><Anchor id="laptops" /></group>
        </Floating>
      </group>
      <group ref={work}>
        <Monitor position={[0, 0, -0.3]} />
        <Tower position={[1.45, 0, -0.35]} />
        <Keyboard position={[-0.05, 0.03, 0.55]} />
        <Mouse position={[0.95, 0.03, 0.6]} />
        <group position={[-0.4, 2.0, 0]}><Anchor id="monitors" /></group>
        <group position={[1.45, 1.65, 0]}><Anchor id="desktops" /></group>
        <group position={[-0.6, 0.25, 0.9]}><Anchor id="peripherals" /></group>
      </group>
      <group ref={rack}>
        <ServerRack />
        <group position={[0, 3.25, 0]}><Anchor id="servers" /></group>
      </group>
      <group ref={sw}>
        <Floating speed={1.1} amp={0.06}><Switch /></Floating>
        <group position={[0, 0.45, 0]}><Anchor id="switching" /></group>
      </group>
      <group ref={router}>
        <Router />
        <group position={[0, 1.1, 0]}><Anchor id="routers" /></group>
      </group>
      <group ref={ap}>
        <Floating speed={1.3} amp={0.05}><AccessPoint /></Floating>
        <group position={[0, 0.35, 0]}><Anchor id="wifi" /></group>
      </group>
      <group ref={cam}>
        <Camera />
        <group position={[0, 1.2, 0]}><Anchor id="cctv" /></group>
      </group>
      <group ref={ups}><Ups /></group>

      <group ref={linkGroup}>
        <LiveLinks refs={{ rack, sw, router, ap, cam, laptop, work }} strength={links} />
      </group>

      <group ref={rings} position={[0, -1.3, -1]}>
        <EnergyRing radius={3.2} color={BRAND.blue} thickness={0.014} speed={0.12} />
        <EnergyRing radius={3.45} color={BRAND.red} thickness={0.01} speed={-0.09} opacity={0.75} rotation={[0, 0, 2]} />
        <EnergyRing radius={2.7} color="#5fb0ff" thickness={0.006} speed={0.2} opacity={0.5} rotation={[0, 0, 4]} />
      </group>
      <Particles count={mobile ? 350 : 1100} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshBasicMaterial color="#0a2a55" transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Network links that follow the devices as they move. */
function LiveLinks({ refs, strength }: { refs: Record<string, React.RefObject<THREE.Group | null>>; strength: MutableRefObject<number> }) {
  const pairs: [string, string, THREE.Vector3Tuple, THREE.Vector3Tuple][] = [
    ["rack", "sw", [0, 2.6, 0.6], [0, 0, 0]],
    ["rack", "router", [0.4, 1.4, 0.6], [0, 0.2, 0]],
    ["sw", "ap", [0.8, 0, 0], [0, 0, 0]],
    ["sw", "cam", [-0.8, 0, 0], [0, 0.6, 0]],
    ["router", "work", [0, 0.2, 0], [0, 1.1, 0]],
    ["sw", "laptop", [0, 0, 0], [0, 0.5, 0]],
  ];
  return (
    <>
      {pairs.map(([a, b, oa, ob], i) => (
        <FollowLink key={i} a={refs[a]} b={refs[b]} oa={oa} ob={ob} strength={strength} color={i % 3 === 2 ? "#ff4a52" : BRAND.glow} />
      ))}
    </>
  );
}

function FollowLink({ a, b, oa, ob, strength, color }: { a: React.RefObject<THREE.Group | null>; b: React.RefObject<THREE.Group | null>; oa: THREE.Vector3Tuple; ob: THREE.Vector3Tuple; strength: MutableRefObject<number>; color: string }) {
  const line = useRef<THREE.Mesh>(null);
  const dots = useRef<THREE.Group>(null);
  const curve = useRef(new THREE.QuadraticBezierCurve3(V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)));
  const geo = useRef<THREE.TubeGeometry | null>(null);
  const frame = useRef(0);
  useFrame(({ clock }) => {
    if (!a.current || !b.current || !line.current) return;
    const pa = a.current.localToWorld(V(...oa)), pb = b.current.localToWorld(V(...ob));
    const c = curve.current;
    c.v0.copy(pa); c.v2.copy(pb); c.v1.copy(pa).lerp(pb, 0.5).add(V(0, 0.7, 0));
    if (frame.current++ % 2 === 0) {
      geo.current?.dispose();
      geo.current = new THREE.TubeGeometry(c, 32, 0.01, 5, false);
      line.current.geometry = geo.current;
    }
    const s = strength.current;
    (line.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * s;
    dots.current?.children.forEach((d, i) => {
      const t = (clock.elapsedTime * 0.4 + i / 3) % 1;
      d.position.copy(c.getPointAt(t));
      d.scale.setScalar(s);
    });
  });
  return (
    <group>
      <mesh ref={line}><meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <group ref={dots}>
        {[0, 1, 2].map((i) => <mesh key={i}><sphereGeometry args={[0.045, 10, 10]} /><meshBasicMaterial color={i === 1 ? "#ffffff" : color} toneMapped={false} /></mesh>)}
      </group>
    </group>
  );
}

export default function HeroScene({ progress, mobile, active, labels }: { progress: MutableRefObject<number>; mobile: boolean; active: boolean; labels: LabelEls }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0.6, 8], fov: 35, near: 0.1, far: 60 }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      aria-hidden
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-5, 2, 2]} intensity={30} color={BRAND.red} distance={14} />
      <pointLight position={[5, 1, 3]} intensity={40} color={BRAND.blue} distance={16} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.4} color="#7fb6ff" position={[-6, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={1.2} color="#ff6a70" position={[6, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer intensity={0.8} position={[0, 0, 6]} scale={[8, 3, 1]} />
      </Environment>
      <Rig progress={progress} mobile={mobile} labels={labels} />
    </Canvas>
  );
}

export { NetLink };
