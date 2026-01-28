'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, Float, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

// TU ARCHIVO LOCAL
const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene } = useGLTF(MODEL_PATH);
  const phoneRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      const t = state.clock.getElapsedTime();
      phoneRef.current.rotation.y = Math.PI + Math.sin(t / 2) * 0.3; 
    }
  });

  return (
    <group ref={phoneRef}>
      {/* Usamos Center para forzar que esté en medio */}
      <Center>
        {/* IMPORTANTE: Reducimos la escala muchísimo (0.01) */}
        <primitive object={scene} scale={0.01} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          {/* Luces fuertes para ver bien */}
          <ambientLight intensity={3} />
          <spotLight position={[10, 10, 10]} intensity={2} />
          <Environment preset="studio" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
             <Iphone />
          </Float>

          {/* Caja roja de referencia en el centro exacto (0,0,0) */}
          {/* Si ves la caja roja pero no el iPhone, es que el iPhone sigue siendo enorme o invisible */}
          <mesh position={[0,0,0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="red" wireframe />
          </mesh>
          
          {/* Controles para que puedas girar y buscar el móvil si se ha perdido */}
          <OrbitControls />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none text-white select-none">
        <h1 className="text-5xl font-bold mb-4">NightVibe</h1>
        <p className="text-sm text-gray-400">AJUSTANDO ESCALA...</p>
      </div>

    </main>
  );
}