'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, Html } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

// --- CONFIGURACIÓN ---
// Usamos un modelo alojado en la nube para empezar rápido
const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf";

function Iphone() {
  const { scene } = useGLTF(MODEL_URL);
  const phoneRef = useRef<Mesh>(null);

  useFrame((state) => {
    // Animación suave de "flotación" y rotación inicial
    if (phoneRef.current) {
      const t = state.clock.getElapsedTime();
      phoneRef.current.rotation.y = -Math.PI / 2 + Math.sin(t / 2) * 0.3; // Gira suave
      phoneRef.current.position.y = Math.sin(t) * 0.1; // Flota arriba/abajo
    }
  });

  return (
    <group ref={phoneRef} position={[0, 0, 0]}>
      {/* El modelo 3D */}
      <primitive object={scene} scale={3} />
      
      {/* Aquí pondremos la pantalla de la App más adelante */}
      {/* <Html ... /> */}
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA 3D (Fondo) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Environment preset="city" /> {/* Reflejos realistas */}
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Iphone />
          </Float>
          
          <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2} />
        </Canvas>
      </div>

      {/* CAPA HTML (Texto por encima) */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mix-blend-difference">
          NightVibe
        </h1>
        <p className="mt-4 text-xl text-gray-400 font-light tracking-widest uppercase">
          Descubre la noche
        </p>
      </div>

    </main>
  );
}