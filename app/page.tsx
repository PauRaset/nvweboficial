'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, Html } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

// --- CONFIGURACIÓN ---
// Ahora usamos el archivo local que acabamos de descargar
const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene } = useGLTF(MODEL_PATH);
  const phoneRef = useRef<Mesh>(null);

  useFrame((state) => {
    // Animación suave de "flotación"
    if (phoneRef.current) {
      const t = state.clock.getElapsedTime();
      phoneRef.current.rotation.y = -Math.PI / 2 + Math.sin(t / 2) * 0.2; // Giro sutil
      phoneRef.current.position.y = Math.sin(t) * 0.1; // Flotar
    }
  });

  return (
    <group ref={phoneRef} position={[0, 0, 0]}>
      {/* Modelo 3D */}
      <primitive object={scene} scale={3} />
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          {/* Iluminación */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Iphone />
          </Float>
          
          <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2} />
        </Canvas>
      </div>

      {/* CAPA DE TEXTO */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none text-white">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 mix-blend-difference">
          NightVibe
        </h1>
        <p className="text-xl text-gray-400 font-light tracking-widest uppercase">
          La aplicación que te mueve
        </p>
      </div>

    </main>
  );
}