'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes, materials } = useGLTF(MODEL_PATH);
  const groupRef = useRef<Group>(null);
  
  // Hook que nos dice dónde está el usuario (de 0 a 1)
  const scroll = useScroll();

  // Esto es un truco: Imprime en la consola del navegador los nombres de las piezas
  // Lo usaremos en el siguiente paso para encontrar la pantalla
  useEffect(() => {
    console.log("Piezas del iPhone:", nodes);
    console.log("Materiales:", materials);
  }, [nodes, materials]);

  useFrame((state) => {
    if (groupRef.current) {
      // r es la posición del scroll (0 = arriba, 1 = abajo del todo)
      const r = scroll.offset; 
      
      // ANIMACIÓN:
      // 1. Rotación en Y: Da una vuelta completa (360º) a medida que bajas
      groupRef.current.rotation.y = Math.PI + (r * Math.PI * 2);
      
      // 2. Inclinación leve: Se inclina hacia ti al principio y luego se endereza
      groupRef.current.rotation.x = (1 - r) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center top>
        {/* ESCALA AJUSTADA: 0.15 es un buen tamaño inicial */}
        <primitive object={scene} scale={0.15} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* CAPA 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
          <ambientLight intensity={3} />
          <Environment preset="city" />
          
          {/* CONTROL DEL SCROLL:
              pages={3} define qué tan larga es la web.
              damping={0.2} hace que el movimiento sea suave (con inercia). */}
          <ScrollControls pages={3} damping={0.2}>
             <Iphone />
             
             {/* Aquí podríamos poner texto HTML que se mueva con el scroll si quisiéramos */}
          </ScrollControls>
        </Canvas>
      </div>

      {/* TEXTO INICIAL (Overlay fijo) */}
      <div className="absolute top-10 w-full text-center pointer-events-none z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mix-blend-difference opacity-90">
          NightVibe
        </h1>
        <p className="text-sm text-gray-400 mt-4 animate-bounce">
          ▼ Desliza para descubrir ▼
        </p>
      </div>

    </main>
  );
}