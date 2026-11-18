"use client";
/**
 * Procedural, dependency-free IT product models (no external GLB downloads).
 * Every model is built from primitives + shared materials so the whole hero
 * ships in a few KB and renders consistently in the hero and the studio renders.
 */
import * as THREE from "three";
import { useMemo, useRef, forwardRef, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeElements } from "@react-three/fiber";

export const BRAND = { red: "#ED1018", blue: "#0865C5", navy: "#092D60", glow: "#3B9BFF" };

type G = ThreeElements["group"];

function useMats() {
  return useMemo(() => {
    const alu = new THREE.MeshPhysicalMaterial({ color: "#c9ced6", metalness: 0.9, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.3 });
    const graphite = new THREE.MeshPhysicalMaterial({ color: "#1d2129", metalness: 0.6, roughness: 0.42, clearcoat: 0.3 });
    const black = new THREE.MeshStandardMaterial({ color: "#0b0d12", metalness: 0.3, roughness: 0.55 });
    const key = new THREE.MeshStandardMaterial({ color: "#14171d", metalness: 0.1, roughness: 0.7 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#0a1730", metalness: 0, roughness: 0.05, transmission: 0.0, transparent: true, opacity: 0.16, clearcoat: 1 });
    const blueGlow = new THREE.MeshBasicMaterial({ color: BRAND.glow, toneMapped: false });
    const redGlow = new THREE.MeshBasicMaterial({ color: BRAND.red, toneMapped: false });
    const greenGlow = new THREE.MeshBasicMaterial({ color: "#2bd46b", toneMapped: false });
    const amberGlow = new THREE.MeshBasicMaterial({ color: "#ffb020", toneMapped: false });
    const white = new THREE.MeshPhysicalMaterial({ color: "#f4f6f9", metalness: 0.05, roughness: 0.35, clearcoat: 0.6 });
    const port = new THREE.MeshStandardMaterial({ color: "#05070a", roughness: 0.9 });
    return { alu, graphite, black, key, glass, blueGlow, redGlow, greenGlow, amberGlow, white, port };
  }, []);
}

/** Brand gradient "wallpaper" rendered to a canvas texture — no external images. */
function useScreenTexture(variant: "brand" | "dash" = "brand") {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 640;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 1024, 640);
    grd.addColorStop(0, "#071426"); grd.addColorStop(0.55, "#0a3a7a"); grd.addColorStop(1, "#0865C5");
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 640);
    if (variant === "brand") {
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.strokeStyle = i % 3 === 0 ? "rgba(237,16,24,0.55)" : `rgba(80,170,255,${0.15 + i * 0.06})`;
        g.lineWidth = 3 + i * 1.5;
        g.ellipse(560, 380 + i * 6, 520 - i * 30, 140 - i * 10, -0.18, 0, Math.PI * 2);
        g.stroke();
      }
      const r = g.createRadialGradient(560, 300, 10, 560, 300, 360);
      r.addColorStop(0, "rgba(120,190,255,0.55)"); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, 1024, 640);
    } else {
      g.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 4; i++) g.fillRect(40 + i * 245, 40, 220, 120);
      g.strokeStyle = "#3B9BFF"; g.lineWidth = 5; g.beginPath();
      for (let x = 0; x <= 940; x += 20) g.lineTo(40 + x, 420 - Math.sin(x / 70) * 60 - x / 9);
      g.stroke();
      g.fillStyle = "rgba(237,16,24,0.8)";
      for (let i = 0; i < 12; i++) g.fillRect(60 + i * 75, 600 - (40 + ((i * 37) % 120)), 40, 40 + ((i * 37) % 120));
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [variant]);
}

function Keys({ cols, rows, w, d, y, gap = 0.012, mat }: { cols: number; rows: number; w: number; d: number; y: number; gap?: number; mat: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const kw = w / cols - gap, kd = d / rows - gap;
  const geo = useMemo(() => new THREE.BoxGeometry(kw, 0.012, kd), [kw, kd]);
  useMemo(() => {
    queueMicrotask(() => {
      const m = new THREE.Matrix4();
      let i = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        m.setPosition(-w / 2 + kw / 2 + c * (kw + gap) + gap / 2, y, -d / 2 + kd / 2 + r * (kd + gap) + gap / 2);
        ref.current?.setMatrixAt(i++, m);
      }
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  }, [cols, rows, w, d, y, kw, kd, gap]);
  return <instancedMesh ref={ref} args={[geo, mat, cols * rows]} />;
}

// ───────────────────────── Laptop ─────────────────────────
export const Laptop = forwardRef<THREE.Group, G & { open?: number; tone?: "silver" | "graphite"; lidRef?: React.Ref<THREE.Group> }>(
  function Laptop({ open = 1, tone = "silver", lidRef, ...props }, ref) {
    const m = useMats();
    const tex = useScreenTexture("brand");
    const shell = tone === "silver" ? m.alu : m.graphite;
    return (
      <group ref={ref} {...props}>
        <RoundedBox args={[1.6, 0.05, 1.08]} radius={0.022} smoothness={4} material={shell} castShadow />
        <mesh position={[0, 0.026, -0.12]} material={m.black}><boxGeometry args={[1.42, 0.004, 0.56]} /></mesh>
        <Keys cols={14} rows={5} w={1.36} d={0.5} y={0.032} mat={m.key} />
        <mesh position={[0, 0.026, 0.33]} material={m.black}><boxGeometry args={[0.52, 0.003, 0.3]} /></mesh>
        <mesh position={[0.79, 0.0, 0.0]} material={m.blueGlow}><boxGeometry args={[0.012, 0.012, 0.3]} /></mesh>
        <group ref={lidRef} position={[0, 0.025, -0.54]} rotation={[(1 - open) * (Math.PI / 2) - 0.22 * open, 0, 0]}>
          <group rotation={[0, 0, 0]}>
            <RoundedBox args={[1.6, 1.02, 0.03]} radius={0.02} smoothness={4} position={[0, 0.51, 0]} material={shell} />
            <mesh position={[0, 0.52, 0.0165]}>
              <planeGeometry args={[1.5, 0.92]} />
              <meshBasicMaterial map={tex ?? undefined} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.52, -0.0165]} rotation={[0, Math.PI, 0]}>
              <circleGeometry args={[0.07, 32]} />
              <meshBasicMaterial color={BRAND.glow} toneMapped={false} transparent opacity={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    );
  },
);

// ───────────────────────── Monitor ─────────────────────────
export const Monitor = forwardRef<THREE.Group, G & { variant?: "brand" | "dash" }>(function Monitor({ variant = "dash", ...props }, ref) {
  const m = useMats();
  const tex = useScreenTexture(variant);
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[2.1, 1.25, 0.06]} radius={0.025} smoothness={4} position={[0, 1.15, 0]} material={m.black} castShadow />
      <mesh position={[0, 1.17, 0.031]}><planeGeometry args={[2.0, 1.13]} /><meshBasicMaterial map={tex ?? undefined} toneMapped={false} /></mesh>
      <mesh position={[0, 0.55, -0.08]} material={m.graphite}><boxGeometry args={[0.16, 0.95, 0.06]} /></mesh>
      <RoundedBox args={[0.8, 0.04, 0.5]} radius={0.02} position={[0, 0.03, -0.02]} material={m.graphite} />
      <mesh position={[0, 0.535, 0.032]} material={m.blueGlow}><boxGeometry args={[0.1, 0.008, 0.002]} /></mesh>
    </group>
  );
});

// ───────────────────────── Desktop tower ─────────────────────────
export const Tower = forwardRef<THREE.Group, G>(function Tower(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[0.62, 1.42, 1.3]} radius={0.03} smoothness={4} position={[0, 0.71, 0]} material={m.graphite} castShadow />
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 0.25 + i * 0.12, 0.652]} material={m.black}><boxGeometry args={[0.5, 0.05, 0.004]} /></mesh>
      ))}
      <mesh position={[0, 1.3, 0.653]} rotation={[Math.PI / 2, 0, 0]} material={m.blueGlow}><torusGeometry args={[0.035, 0.006, 8, 32]} /></mesh>
      <mesh position={[-0.28, 0.71, 0.652]} material={m.blueGlow}><boxGeometry args={[0.008, 1.2, 0.004]} /></mesh>
      <mesh position={[0.12, 1.3, 0.653]} material={m.port}><boxGeometry args={[0.07, 0.025, 0.004]} /></mesh>
      <mesh position={[0.22, 1.3, 0.653]} material={m.port}><boxGeometry args={[0.07, 0.025, 0.004]} /></mesh>
    </group>
  );
});

export const Keyboard = forwardRef<THREE.Group, G>(function Keyboard(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[1.5, 0.05, 0.5]} radius={0.02} material={m.black} castShadow />
      <Keys cols={18} rows={5} w={1.42} d={0.42} y={0.032} mat={m.key} />
    </group>
  );
});

export const Mouse = forwardRef<THREE.Group, G>(function Mouse(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <mesh scale={[0.6, 0.35, 1]} material={m.black} castShadow><sphereGeometry args={[0.16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    </group>
  );
});

// ───────────────────────── Network switch (1U) ─────────────────────────
function PortRow({ count, width, y, z, mats, ledEvery = 1 }: { count: number; width: number; y: number; z: number; mats: ReturnType<typeof useMats>; ledEvery?: number }) {
  const step = width / count;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[-width / 2 + step / 2 + i * step, y, z]}>
          <mesh material={mats.port}><boxGeometry args={[step * 0.72, 0.05, 0.01]} /></mesh>
          {i % ledEvery === 0 && <mesh position={[0, 0.042, 0]} material={i % 5 === 3 ? mats.amberGlow : mats.greenGlow}><boxGeometry args={[0.018, 0.01, 0.012]} /></mesh>}
        </group>
      ))}
    </group>
  );
}

export const Switch = forwardRef<THREE.Group, G>(function Switch(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[2.2, 0.2, 0.9]} radius={0.015} material={m.graphite} castShadow />
      <PortRow count={12} width={1.4} y={0.035} z={0.451} mats={m} />
      <PortRow count={12} width={1.4} y={-0.04} z={0.451} mats={m} ledEvery={99} />
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[0.8 + i * 0.08, 0, 0.451]} material={m.alu}><boxGeometry args={[0.055, 0.07, 0.01]} /></mesh>)}
      <mesh position={[-0.98, 0.03, 0.452]} material={m.blueGlow}><boxGeometry args={[0.05, 0.012, 0.004]} /></mesh>
    </group>
  );
});

// ───────────────────────── Router ─────────────────────────
export const Router = forwardRef<THREE.Group, G>(function Router(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[1.3, 0.22, 0.85]} radius={0.04} smoothness={4} position={[0, 0.11, 0]} material={m.white} castShadow />
      <PortRow count={5} width={0.8} y={0.11} z={-0.426} mats={m} />
      {[-0.5, -0.17, 0.17, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.2, -0.38]} rotation={[-0.18 + (i % 2) * 0.08, 0, (x / 3)]}>
          <mesh position={[0, 0.35, 0]} material={m.black}><cylinderGeometry args={[0.028, 0.034, 0.7, 16]} /></mesh>
        </group>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.35 + i * 0.14, 0.222, 0.3]} material={i === 0 ? m.blueGlow : m.greenGlow}><boxGeometry args={[0.03, 0.004, 0.03]} /></mesh>
      ))}
    </group>
  );
});

// ───────────────────────── Server rack ─────────────────────────
export const ServerRack = forwardRef<THREE.Group, G & { units?: number }>(function ServerRack({ units = 9, ...props }, ref) {
  const m = useMats();
  const leds = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    leds.current?.children.forEach((c, i) => {
      (c as THREE.Mesh).visible = Math.sin(clock.elapsedTime * (2 + (i % 5)) + i * 1.7) > -0.4;
    });
  });
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[1.25, 3.0, 1.2]} radius={0.03} smoothness={4} position={[0, 1.5, 0]} material={m.black} castShadow />
      <mesh position={[0, 1.5, 0.605]} material={m.glass}><boxGeometry args={[1.1, 2.85, 0.01]} /></mesh>
      <mesh position={[-0.56, 1.5, 0.62]} material={m.blueGlow}><boxGeometry args={[0.012, 2.7, 0.01]} /></mesh>
      <mesh position={[0, 2.92, 0.5]} material={m.blueGlow}><boxGeometry args={[0.9, 0.012, 0.012]} /></mesh>
      <group ref={leds}>
        {Array.from({ length: units }).map((_, i) => (
          <group key={i} position={[0, 0.3 + i * 0.29, 0.55]}>
            <mesh material={m.graphite}><boxGeometry args={[1.02, 0.22, 0.04]} /></mesh>
            {Array.from({ length: 6 }).map((__, j) => (
              <mesh key={j} position={[-0.4 + j * 0.06, 0.05, 0.022]} material={(i + j) % 7 === 0 ? m.amberGlow : (i + j) % 3 === 0 ? m.blueGlow : m.greenGlow}>
                <boxGeometry args={[0.018, 0.018, 0.006]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {Array.from({ length: units }).map((_, i) => (
        <mesh key={i} position={[0.22, 0.3 + i * 0.29, 0.572]} material={m.port}><boxGeometry args={[0.45, 0.12, 0.004]} /></mesh>
      ))}
    </group>
  );
});

/** Stand-alone 2U rack server for product shots. */
export const RackServer = forwardRef<THREE.Group, G>(function RackServer(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[2.2, 0.42, 1.8]} radius={0.015} material={m.graphite} castShadow />
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} position={[-0.75 + i * 0.2, 0, 0.902]}>
          <mesh material={m.black}><boxGeometry args={[0.17, 0.32, 0.01]} /></mesh>
          <mesh position={[0, 0.13, 0.006]} material={i % 3 ? m.greenGlow : m.blueGlow}><boxGeometry args={[0.02, 0.02, 0.004]} /></mesh>
        </group>
      ))}
      <mesh position={[0.95, 0, 0.903]} material={m.alu}><boxGeometry args={[0.14, 0.3, 0.01]} /></mesh>
      <mesh position={[0, 0.211, 0]} material={m.alu}><boxGeometry args={[2.1, 0.002, 1.7]} /></mesh>
    </group>
  );
});

// ───────────────────────── Wi-Fi access point ─────────────────────────
export const AccessPoint = forwardRef<THREE.Group, G>(function AccessPoint(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <mesh material={m.white} castShadow><cylinderGeometry args={[0.55, 0.6, 0.12, 64]} /></mesh>
      <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.blueGlow}><ringGeometry args={[0.16, 0.19, 64]} /></mesh>
    </group>
  );
});

// ───────────────────────── CCTV bullet camera ─────────────────────────
export const Camera = forwardRef<THREE.Group, G>(function Camera(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0.6, -0.55]} material={m.white}><boxGeometry args={[0.4, 0.5, 0.08]} /></mesh>
      <mesh position={[0, 0.6, -0.3]} rotation={[Math.PI / 2, 0, 0]} material={m.white}><cylinderGeometry args={[0.06, 0.06, 0.45, 16]} /></mesh>
      <group position={[0, 0.72, 0.1]} rotation={[0.18, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.white} castShadow><cylinderGeometry args={[0.22, 0.22, 0.9, 48]} /></mesh>
        <mesh position={[0, 0.12, 0.05]} material={m.white}><boxGeometry args={[0.5, 0.06, 1.05]} /></mesh>
        <mesh position={[0, 0, 0.451]} rotation={[Math.PI / 2, 0, 0]} material={m.black}><cylinderGeometry args={[0.19, 0.19, 0.01, 48]} /></mesh>
        <mesh position={[0, 0, 0.457]} rotation={[Math.PI / 2, 0, 0]} material={m.glass}><cylinderGeometry args={[0.09, 0.09, 0.01, 32]} /></mesh>
        <mesh position={[0, -0.12, 0.457]} material={m.redGlow}><sphereGeometry args={[0.014, 12, 12]} /></mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i) * 0.14, Math.sin(i) * 0.14, 0.458]} material={m.port}><sphereGeometry args={[0.012, 8, 8]} /></mesh>
        ))}
      </group>
    </group>
  );
});

// ───────────────────────── Printer ─────────────────────────
export const Printer = forwardRef<THREE.Group, G>(function Printer(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[1.5, 0.75, 1.1]} radius={0.05} smoothness={4} position={[0, 0.375, 0]} material={m.white} castShadow />
      <RoundedBox args={[1.3, 0.06, 0.4]} radius={0.02} position={[0, 0.45, 0.68]} rotation={[0.12, 0, 0]} material={m.graphite} />
      <mesh position={[0, 0.48, 0.74]} rotation={[-Math.PI / 2 + 0.12, 0, 0]}><planeGeometry args={[0.8, 0.35]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0.5, 0.65, 0.551]} material={m.black}><boxGeometry args={[0.3, 0.12, 0.004]} /></mesh>
      <mesh position={[0.5, 0.65, 0.554]} material={m.blueGlow}><boxGeometry args={[0.26, 0.08, 0.002]} /></mesh>
      <mesh position={[0, 0.76, 0]} material={m.graphite}><boxGeometry args={[1.3, 0.02, 0.8]} /></mesh>
    </group>
  );
});

// ───────────────────────── UPS ─────────────────────────
export const Ups = forwardRef<THREE.Group, G>(function Ups(props, ref) {
  const m = useMats();
  return (
    <group ref={ref} {...props}>
      <RoundedBox args={[0.6, 1.05, 1.2]} radius={0.04} smoothness={4} position={[0, 0.525, 0]} material={m.black} castShadow />
      <mesh position={[0, 0.8, 0.601]} material={m.graphite}><boxGeometry args={[0.4, 0.22, 0.006]} /></mesh>
      <mesh position={[0, 0.8, 0.605]} material={m.blueGlow}><boxGeometry args={[0.34, 0.14, 0.002]} /></mesh>
      <mesh position={[0, 0.5, 0.605]} rotation={[Math.PI / 2, 0, 0]} material={m.greenGlow}><torusGeometry args={[0.05, 0.008, 8, 32]} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => <mesh key={i} position={[0, 0.15 + i * 0.04, 0.601]} material={m.port}><boxGeometry args={[0.36, 0.012, 0.004]} /></mesh>)}
    </group>
  );
});

// ───────────────────────── Components (RAM + SSD) ─────────────────────────
export const Components = forwardRef<THREE.Group, G>(function Components(props, ref) {
  const m = useMats();
  const pcb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0d3d26", metalness: 0.3, roughness: 0.5 }), []);
  return (
    <group ref={ref} {...props}>
      {[0, 1].map((k) => (
        <group key={k} position={[-0.35 + k * 0.28, 0.35, 0]} rotation={[0, 0, 0]}>
          <mesh material={pcb}><boxGeometry args={[0.04, 0.5, 1.6]} /></mesh>
          <mesh position={[0.025, 0.03, 0]} material={m.graphite}><boxGeometry args={[0.02, 0.4, 1.5]} /></mesh>
          <mesh position={[0, 0.27, 0]} material={k ? m.redGlow : m.blueGlow}><boxGeometry args={[0.05, 0.03, 1.5]} /></mesh>
          {Array.from({ length: 30 }).map((_, i) => <mesh key={i} position={[0, -0.24, -0.75 + i * 0.05]} material={m.alu}><boxGeometry args={[0.042, 0.03, 0.03]} /></mesh>)}
        </group>
      ))}
      <group position={[0.55, 0.03, 0.1]} rotation={[0, -0.4, 0]}>
        <RoundedBox args={[0.7, 0.05, 1.0]} radius={0.015} material={m.graphite} />
        <mesh position={[0, 0.026, 0]} material={m.alu}><boxGeometry args={[0.5, 0.002, 0.6]} /></mesh>
        <mesh position={[0, 0.028, -0.38]} material={m.blueGlow}><boxGeometry args={[0.4, 0.002, 0.02]} /></mesh>
      </group>
    </group>
  );
});

// ───────────────────────── Security shield (software) ─────────────────────────
export const Shield = forwardRef<THREE.Group, G>(function Shield(props, ref) {
  const m = useMats();
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.9); s.bezierCurveTo(0.35, 0.8, 0.6, 0.78, 0.7, 0.72); s.lineTo(0.7, 0.1);
    s.bezierCurveTo(0.7, -0.45, 0.25, -0.75, 0, -0.9); s.bezierCurveTo(-0.25, -0.75, -0.7, -0.45, -0.7, 0.1);
    s.lineTo(-0.7, 0.72); s.bezierCurveTo(-0.6, 0.78, -0.35, 0.8, 0, 0.9);
    return new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4 });
  }, []);
  const navy = useMemo(() => new THREE.MeshPhysicalMaterial({ color: BRAND.blue, metalness: 0.7, roughness: 0.25, clearcoat: 1 }), []);
  return (
    <group ref={ref} {...props}>
      <mesh geometry={geo} material={navy} position={[0, 0.9, -0.09]} castShadow />
      <group position={[0, 0.85, 0.16]}>
        <mesh material={m.white}><boxGeometry args={[0.42, 0.34, 0.06]} /></mesh>
        <mesh position={[0, 0.25, 0]} material={m.white}><torusGeometry args={[0.14, 0.04, 12, 32, Math.PI]} /></mesh>
        <mesh position={[0, 0, 0.032]} material={m.redGlow}><circleGeometry args={[0.04, 24]} /></mesh>
      </group>
    </group>
  );
});

// ───────────────────────── FX ─────────────────────────
export function EnergyRing({ radius = 2.6, color = BRAND.blue, thickness = 0.012, opacity = 0.9, speed = 0.15, ...props }: G & { radius?: number; color?: string; thickness?: number; opacity?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * speed; });
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }), [color, opacity]);
  return (
    <group {...props}>
      <mesh ref={ref} material={mat}><torusGeometry args={[radius, thickness, 8, 220, Math.PI * 1.7]} /></mesh>
    </group>
  );
}

export function Particles({ count = 900, radius = 9 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3), c = new Float32Array(count * 3);
    const blue = new THREE.Color(BRAND.glow), red = new THREE.Color(BRAND.red), white = new THREE.Color("#cfe3ff");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(rnd()), th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th)], i * 3);
      const col = rnd() < 0.08 ? red : rnd() < 0.5 ? blue : white;
      c.set([col.r, col.g, col.b], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return g;
  }, [count, radius]);
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.y += dt * 0.02; } });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

/** Glowing link between two points with travelling data pulses. */
export function NetLink({ from, to, color = BRAND.glow, pulses = 3, progress = 1, lift = 0.6 }: { from: THREE.Vector3Tuple; to: THREE.Vector3Tuple; color?: string; pulses?: number; progress?: number; lift?: number }) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5); mid.y += lift;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [from, to, lift]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.008, 6, false), [curve]);
  const dots = useRef<THREE.Group>(null);
  const lineMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (lineMat.current) lineMat.current.opacity = 0.55 * progress;
    dots.current?.children.forEach((d, i) => {
      const t = (clock.elapsedTime * 0.35 + i / pulses) % 1;
      d.position.copy(curve.getPointAt(t));
      d.visible = progress > 0.05;
      d.scale.setScalar(progress);
    });
  });
  return (
    <group>
      <mesh geometry={tube}><meshBasicMaterial ref={lineMat} color={color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <group ref={dots}>
        {Array.from({ length: pulses }).map((_, i) => (
          <mesh key={i}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color={i % 2 ? "#ffffff" : color} toneMapped={false} /></mesh>
        ))}
      </group>
    </group>
  );
}

export function Floating({ children, speed = 1, amp = 0.06 }: { children: ReactNode; speed?: number; amp?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amp;
  });
  return <group ref={ref}>{children}</group>;
}

export const MODEL_KEYS = ["laptop", "laptop-graphite", "desktop", "tower", "monitor", "components", "printer", "accesspoint", "server", "rack", "switch", "router", "camera", "accessories", "ups", "shield"] as const;
export type ModelKey = (typeof MODEL_KEYS)[number];
