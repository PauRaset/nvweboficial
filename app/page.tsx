'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // r va de 0 a 1 dependiendo del scroll
      const r = scroll.offset; 
      
      // OBJETIVOS DE MOVIMIENTO
      const targetRotationY = Math.PI + 0.5 + (r * Math.PI * 0.5); // Gira un poco
      const targetRotationX = (r * 0.2); // Se inclina
      const targetPosX = r * 2; // Se mueve a la derecha

      // USAMOS 'lerp' (Linear Interpolation) que es estándar y seguro
      // Esto hace que el movimiento sea fluido (el 4 * delta controla la velocidad)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 4 * delta);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 4 * delta);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 4 * delta);
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        {/* ESCALA AJUSTADA: 0.12 */}
        <primitive object={scene} scale={0.12} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="w-full h-full bg-black">
      
      {/* CONTENEDOR FIJO */}
      <div className="fixed top-0 left-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          {/* ScrollControls maneja TODO el scroll de la página */}
          <ScrollControls pages={3} damping={0.3}>
             
             {/* CAPA 1: MUNDO 3D */}
             {/* Usamos <Scroll> normal para el contenido 3D */}
             <Scroll>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Iphone />
                </Float>
             </Scroll>

             {/* CAPA 2: TEXTO HTML */}
             {/* IMPORTANTE: El prop 'html' permite poner divs dentro del Canvas sin errores */}
             <Scroll html style={{ width: '100%', height: '100%' }}>
                
                {/* TEXTOS (HTML PURO) */}
                <div className="w-screen px-8">
                  
                  {/* PANTALLA 1 */}
                  <section className="h-screen flex flex-col justify-center items-start max-w-lg">
                    <h1 className="text-7xl font-bold mb-4 tracking-tighter text-white">NightVibe</h1>
                    <p className="text-xl text-gray-400">La noche cobra vida.</p>
                    <p className="text-sm mt-10 text-white animate-bounce">▼ Haz Scroll</p>
                  </section>

                  {/* PANTALLA 2 */}
                  <section className="h-screen flex flex-col justify-center items-end text-right">
                    <h2 className="text-5xl font-bold mb-4 text-white">Conecta</h2>
                    <p className="text-xl text-gray-400 max-w-md">
                      Descubre eventos exclusivos y gente con tu misma vibra.
                    </p>
                  </section>

                  {/* PANTALLA 3 */}
                  <section className="h-screen flex flex-col justify-center items-center text-center">
                    <h2 className="text-6xl font-bold mb-6 text-white">Descárgala hoy</h2>
                    <button className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                      App Store
                    </button>
                  </section>

                </div>
             </Scroll>

          </ScrollControls>
        </Canvas>
      </div>
    </main>
  );
}