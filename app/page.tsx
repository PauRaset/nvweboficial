'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center, Float } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

// Usamos este modelo que es el estándar de la industria (iPhone 13 Pro)
// Es una URL directa a un CDN rápido, así evitamos errores de descarga local
const MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-13/model.gltf";

function Iphone() {
  const { scene } = useGLTF(MODEL_URL);
  const phoneRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      const t = state.clock.getElapsedTime();
      // Animación suave: flota y gira un poco
      phoneRef.current.rotation.y = Math.PI + Math.sin(t / 2) * 0.3; 
      phoneRef.current.position.y = Math.sin(t) * 0.1;
    }
  });

  return (
    <group ref={phoneRef}>
      {/* Center asegura que el modelo esté SIEMPRE en el medio, da igual su tamaño original */}
      <Center top>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
             <Iphone />
          </Float>
          
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        </Canvas>
      </div>

      {/* CAPA DE TEXTO */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none text-white select-none">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-2 text-center">
          NightVibe
        </h1>
        <p className="text-sm md:text-xl text-gray-400 tracking-[0.5em] uppercase">
          La aplicación que te mueve
        </p>
      </div>

    </main>
  );
}