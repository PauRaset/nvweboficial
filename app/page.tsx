'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes, materials } = useGLTF(MODEL_PATH);
  const groupRef = useRef<Group>(null);
  
  // Hook para detectar el scroll (va de 0 a 1)
  const scroll = useScroll();

  // Esto es para preparar el cambio de pantalla en el futuro
  useEffect(() => {
    console.log("Partes del modelo:", nodes); 
    console.log("Materiales:", materials);
  }, [nodes, materials]);

  useFrame((state) => {
    if (groupRef.current) {
      // offset es un número entre 0 (arriba del todo) y 1 (abajo del todo)
      const r = scroll.offset; 
      
      // LOGICA DE MOVIMIENTO:
      // 1. Rotación: Gira 360 grados (Math.PI * 2) según bajas
      groupRef.current.rotation.y = Math.PI + (r * Math.PI * 2);
      
      // 2. Inclinación: Se inclina un poco hacia ti al principio
      groupRef.current.rotation.x = (1 - r) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center top>
        {/* ESCALA: Aumentada de 0.01 a 0.15 (15 veces más grande) */}
        <primitive object={scene} scale={0.15} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
          <ambientLight intensity={3} />
          <Environment preset="city" />
          
          {/* ScrollControls crea el espacio para hacer scroll.
              pages={3} significa que la web será 3 veces el alto de la pantalla */}
          <ScrollControls pages={3} damping={0.2}>
             <Iphone />
          </ScrollControls>
        </Canvas>
      </div>

      {/* Texto fijo (overlay) que invita a bajar */}
      <div className="absolute top-10 w-full text-center pointer-events-none z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mix-blend-difference">
          NightVibe
        </h1>
        <p className="text-sm text-gray-400 mt-2 animate-pulse">
          ▼ Haz Scroll para explorar ▼
        </p>
      </div>

    </main>
  );
}