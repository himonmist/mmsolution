"use client";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { Laptop, Monitor, Tower, Keyboard, Mouse, ServerRack, RackServer, Switch, Router, AccessPoint, Camera, Printer, Ups, Components, Shield, Photocopier, TonerBottle, TonerSet, Cartridge, BRAND } from "./models";
import type { ReactNode } from "react";

const SHOTS: Record<string, { node: ReactNode; cam: [number, number, number]; target?: [number, number, number]; fov?: number }> = {
  laptop: { node: <Laptop rotation={[0, -0.5, 0]} />, cam: [0, 1.4, 3.1], target: [0, 0.35, 0] },
  "laptop-graphite": { node: <Laptop tone="graphite" rotation={[0, 0.5, 0]} />, cam: [0, 1.4, 3.1], target: [0, 0.35, 0] },
  desktop: { node: <group rotation={[0, -0.3, 0]}><Monitor position={[-0.5, 0, 0]} /><Tower position={[1.2, 0, -0.2]} /><Keyboard position={[-0.5, 0.03, 0.85]} /><Mouse position={[0.5, 0.03, 0.9]} /></group>, cam: [0, 1.9, 5.4], target: [0.2, 0.8, 0] },
  tower: { node: <Tower rotation={[0, -0.6, 0]} />, cam: [0, 1.2, 3.6], target: [0, 0.7, 0] },
  monitor: { node: <Monitor rotation={[0, -0.35, 0]} variant="brand" />, cam: [0, 1.3, 4.0], target: [0, 1.0, 0] },
  components: { node: <Components rotation={[0, -0.5, 0]} />, cam: [0, 1.8, 2.8], target: [0.1, 0.3, 0] },
  printer: { node: <Printer rotation={[0, -0.5, 0]} />, cam: [0, 1.6, 3.4], target: [0, 0.4, 0] },
  accesspoint: { node: <group><AccessPoint position={[-0.4, 0.6, 0]} rotation={[0.9, 0, 0]} /><Router position={[0.5, 0, 0.2]} rotation={[0, -0.6, 0]} scale={0.8} /></group>, cam: [0, 1.4, 3.6], target: [0, 0.5, 0] },
  server: { node: <RackServer rotation={[0.08, -0.55, 0]} />, cam: [0, 1.5, 3.8], target: [0, 0, 0] },
  rack: { node: <ServerRack rotation={[0, -0.45, 0]} />, cam: [0, 1.8, 6.2], target: [0, 1.5, 0] },
  switch: { node: <Switch rotation={[0.18, -0.5, 0]} />, cam: [0, 1.0, 3.6], target: [0, 0, 0] },
  router: { node: <Router rotation={[0, -0.6, 0]} />, cam: [0, 1.4, 3.2], target: [0, 0.4, 0] },
  camera: { node: <Camera rotation={[0, -0.9, 0]} />, cam: [0, 1.2, 3.0], target: [0, 0.6, 0] },
  accessories: { node: <group rotation={[0, -0.3, 0]}><Keyboard /><Mouse position={[1.0, 0, 0.1]} /></group>, cam: [0, 1.5, 2.6], target: [0.2, 0, 0] },
  ups: { node: <Ups rotation={[0, -0.6, 0]} />, cam: [0, 1.2, 3.2], target: [0, 0.55, 0] },
  shield: { node: <Shield rotation={[0, -0.35, 0]} />, cam: [0, 1.1, 3.6], target: [0, 0.85, 0] },
  photocopier: { node: <Photocopier rotation={[0, -0.55, 0]} />, cam: [0, 1.7, 5.0], target: [0, 0.95, 0] },
  toner: { node: <TonerBottle rotation={[0, -0.45, 0]} position={[0, 0.17, 0]} />, cam: [0, 0.9, 2.6], target: [0, 0.12, 0] },
  "toner-set": { node: <TonerSet rotation={[0, -0.5, 0]} />, cam: [0, 1.4, 3.2], target: [0, 0.1, 0] },
  cartridge: { node: <Cartridge rotation={[0, -0.5, 0]} />, cam: [0, 1.1, 2.6], target: [0, 0.2, 0] },
  "software-cad": { node: <Monitor rotation={[0, -0.35, 0]} variant="cad" />, cam: [0, 1.3, 4.0], target: [0, 1.0, 0] },
  "software-creative": { node: <Monitor rotation={[0, -0.35, 0]} variant="creative" />, cam: [0, 1.3, 4.0], target: [0, 1.0, 0] },
};

export function StudioCanvas({ model }: { model: string }) {
  const shot = SHOTS[model] ?? SHOTS.laptop;
  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      dpr={2}
      camera={{ position: shot.cam, fov: shot.fov ?? 30 }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
        camera.lookAt(...(shot.target ?? [0, 0, 0]));
        document.body.dataset.ready = "1";
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <pointLight position={[-4, 2, 2]} intensity={12} color={BRAND.red} distance={10} />
      <pointLight position={[4, 1, 3]} intensity={18} color={BRAND.blue} distance={12} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.5} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.6} position={[-5, 1, 2]} scale={[3, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={1.6} position={[5, 1, 2]} scale={[3, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer intensity={1.2} position={[0, 1, 6]} scale={[8, 3, 1]} />
      </Environment>
      {shot.node}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.35} scale={8} blur={2.4} far={3} frames={1} />
    </Canvas>
  );
}
