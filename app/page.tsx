'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center, Float } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

// USAMOS TU ARCHIVO LOCAL
const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene } = useGLTF(MODEL_PATH);
  const phoneRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      const t = state.clock.getElapsedTime();
      // Rotación suave para que se vea por todos lados
      phoneRef.current.rotation.y = Math.PI + Math.sin(t / 2) * 0.3; 
      phoneRef.current.position.y = Math.sin(t) * 0.1;
    }
  });

  return (
    <group ref={phoneRef}>
      {/* Center arregla el problema de que se vea cortado o descentrado */}
      {/* scale={0.1} reduce el tamaño si el modelo original es gigante */}
      <Center top>
        <primitive object={scene} scale={0.5} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
             <Iphone />
          </Float>
          
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        </Canvas>
      </div>

      {/* CAPA DE TEXTO */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none text-white select-none">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-2 text-center mix-blend-difference">
          NightVibe
        </h1>
        <p className="text-sm md:text-xl text-gray-400 tracking-[0.5em] uppercase">
          La aplicación que te mueve
        </p>
      </div>

    </main>
  );
}