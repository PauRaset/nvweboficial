'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Float } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group } from 'three';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes, materials } = useGLTF(MODEL_PATH);
  const groupRef = useRef<Group>(null);
  const scroll = useScroll();

  // Imprimimos en consola los nombres para el próximo paso (cambiar pantalla)
  useEffect(() => {
    console.log("Nodos:", nodes);
    console.log("Materiales:", materials);
  }, [nodes, materials]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; // 0 (arriba) a 1 (abajo)
      
      // --- COREOGRAFÍA ELEGANTE ---
      
      // 1. ROTACIÓN: Nada de giros locos. 
      // Empieza girado un poco (-0.2) y termina mostrando el perfil (0.5)
      const targetRotationY = Math.PI + 0.2 + (r * Math.PI * 0.5); 
      
      // 2. INCLINACIÓN: Se inclina levemente hacia adelante al bajar
      const targetRotationX = (r * 0.2);

      // 3. POSICIÓN: Se mueve un poco a la derecha al bajar para dejar espacio al texto
      const targetPosX = r * 1.5; 

      // Aplicamos los movimientos con suavidad (damp)
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotationY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotationX, 4, delta);
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetPosX, 4, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        {/* ESCALA: Reducida a 0.12 para que quepa bien sin cortar */}
        <primitive object={scene} scale={0.12} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="w-full h-full bg-black">
      
      {/* EL LIENZO 3D (Fondo Fijo) */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          {/* ScrollControls maneja la página entera ahora */}
          <ScrollControls pages={3} damping={0.3}>
             
             {/* El iPhone flotando */}
             <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Iphone />
             </Float>

             {/* TEXTOS QUE APARECEN AL HACER SCROLL (HTML dentro del 3D) */}
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white px-8">
                
                {/* Sección 1: Inicio */}
                <section className="h-screen flex flex-col justify-center items-start max-w-lg">
                  <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                  <p className="text-xl text-gray-400">La noche cobra vida.</p>
                  <p className="text-sm mt-10 animate-bounce">▼ Haz Scroll</p>
                </section>

                {/* Sección 2: Mitad */}
                <section className="h-screen flex flex-col justify-center items-end text-right">
                  <h2 className="text-5xl font-bold mb-4">Conecta</h2>
                  <p className="text-xl text-gray-400 max-w-md">
                    Descubre eventos exclusivos y gente con tu misma vibra.
                  </p>
                </section>

                {/* Sección 3: Final */}
                <section className="h-screen flex flex-col justify-center items-center text-center">
                  <h2 className="text-6xl font-bold mb-6">Descárgala hoy</h2>
                  <button className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                    App Store
                  </button>
                </section>

             </div>

          </ScrollControls>
        </Canvas>
      </div>
    </main>
  );
}