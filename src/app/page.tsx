'use client'; // Importante: Esto le dice a Next.js que esta parte se ejecuta en el navegador

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

// Este componente es nuestro objeto 3D de prueba (un cubo)
function Cube() {
  const meshRef = useRef<Mesh>(null);

  // useFrame se ejecuta 60 veces por segundo (loop de animación)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta; // Girar en X
      meshRef.current.rotation.y += delta; // Girar en Y
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Geometría: Un cubo de 2x2x2 */}
      <boxGeometry args={[2, 2, 2]} />
      {/* Material: Color morado estilo NightVibe */}
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  );
}

export default function Home() {
  return (
    <main className="h-screen w-full">
      {/* Canvas es la ventana al mundo 3D */}
      <Canvas>
        {/* Luces para que se vea el objeto */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Nuestro objeto */}
        <Cube />
      </Canvas>
      
      {/* Una capa de texto HTML por encima (Overlay) */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-tighter">
          NIGHTVIBE
        </h1>
      </div>
    </main>
  );
}
