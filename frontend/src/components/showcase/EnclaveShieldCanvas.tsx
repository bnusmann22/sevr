import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Shield, Lock, Activity, Sparkles } from "lucide-react";

function ParticleSphere({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const particleCount = 1200;

  // Generate particle positions on a sphere once on mount
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const colorEmerald = new THREE.Color("#10b981");
    const colorCyan = new THREE.Color("#06b6d4");
    const colorAmber = new THREE.Color("#f59e0b");

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + (Math.random() - 0.5) * 0.3;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Mix colors: 70% Emerald, 20% Cyan, 10% Amber
      const rnd = Math.random();
      const c = rnd > 0.3 ? colorEmerald : rnd > 0.1 ? colorCyan : colorAmber;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();

    // Rotate sphere smoothly
    pointsRef.current.rotation.y = t * 0.12 + mouse.current[0] * 0.5;
    pointsRef.current.rotation.x = t * 0.08 + mouse.current[1] * 0.5;

    // Pulse effect
    const scale = 1.0 + Math.sin(t * 1.5) * 0.04;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Fallback2DShield() {
  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
      {/* Animated Glowing CSS Rings */}
      <div className="absolute w-64 h-64 rounded-full border border-emerald-500/30 animate-ping opacity-25" />
      <div className="absolute w-72 h-72 rounded-full border border-cyan-500/20 animate-pulse" />
      <div className="absolute w-80 h-80 rounded-full border border-dashed border-emerald-500/20 animate-[spin_20s_linear_infinite]" />

      {/* Central Shield Graphic */}
      <div className="relative z-10 w-40 h-40 rounded-3xl bg-slate-900/90 border border-emerald-500/50 backdrop-blur-xl flex flex-col items-center justify-center p-4 shadow-2xl shadow-emerald-500/20">
        <div className="relative">
          <Shield className="w-16 h-16 text-emerald-400 animate-pulse" />
          <Lock className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80">
          <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>ENCLAVE SHIELD ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

export default function EnclaveShieldCanvas() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const mouse = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouse.current = [x * 0.3, y * 0.3];
  };

  if (webglSupported === false) {
    return <Fallback2DShield />;
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/80 backdrop-blur-md shadow-2xl"
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050811"), 0);
        }}
      >
        <ambientLight intensity={0.5} />
        <ParticleSphere mouse={mouse} />
      </Canvas>

      {/* Foreground Overlay Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>3D CRYPTOGRAPHIC PARTICLE MESH</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>ZERO LEAKAGE BOUNDARY</span>
      </div>
    </div>
  );
}
