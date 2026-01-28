'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, Float, useTexture } from '@react-three/drei';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Cargamos las texturas
  const texture1 = useTexture('/1.jpg'); 
  const texture2 = useTexture('/2.jpg'); 
  const texture3 = useTexture('/3.jpg');

  // --- CONFIGURACIÓN DE TEXTURA CORREGIDA ---
  [texture1, texture2, texture3].forEach(t => {
    // 1. FLIP VERTICAL: Ponemos esto en TRUE. 
    // Esto hace el "giro en el eje vertical" (espejo vertical) para ponerla derecha.
    t.flipY = true; 
    
    // 2. Color y Centro
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    
    // 3. ROTACIÓN: La dejamos en 0. 
    // Al usar flipY = true, ya no necesitamos rotarla 180 grados manualmente.
    t.rotation = 0; 
    
    // 4. ESCALA: 1, 1 (Estándar)
    t.repeat.set(1, 1); 
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 
      let activeTexture = texture3;
      if (r < 0.33) activeTexture = texture1;
      else if (r < 0.66) activeTexture = texture2;

      // --- MODO PANTALLA LED ---
      Object.values(nodes).forEach((node: any) => {
        // Seleccionamos la pantalla plana correcta (LCD)
        if (node.isMesh && node.name === 'object010_scr_0') {
             
             // Si el material no es de luz sólida (BasicMaterial), lo cambiamos
             if (!(node.material instanceof THREE.MeshBasicMaterial)) {
                node.material = new THREE.MeshBasicMaterial({
                  map: activeTexture,
                  toneMapped: false, // Colores puros, sin sombras
                });
             }
             
             // Actualizamos la imagen
             node.material.map = activeTexture;
             node.material.needsUpdate = true;
        }
      });

      // Movimiento suave del teléfono
      const targetRotationY = r * Math.PI * 0.5; 
      const targetPosX = r * 1.5; 
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 4 * delta);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 4 * delta);
    }
  });

  return (
    <group ref={groupRef} rotation-x={Math.PI / 2}>
      <Center>
        <primitive object={scene} scale={0.01} /> 
      </Center>
    </group>
  );
}

export default function Home() {
  return (
    <main className="w-full h-full bg-black">
      <div className="fixed top-0 left-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={3} damping={0.3}>
               {/* iPhone flotando (fuera del scroll para estar fijo) */}
               <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Iphone />
               </Float>
               
               {/* Contenido HTML (dentro del scroll para moverse) */}
               <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div className="w-screen px-8">
                    
                    {/* SECCIÓN 1 */}
                    <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                      <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                      <p className="text-xl text-gray-400">La noche cobra vida.</p>
                      <p className="text-sm mt-10 animate-bounce">▼ Haz Scroll</p>
                    </section>
                    
                    {/* SECCIÓN 2 */}
                    <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                      <h2 className="text-5xl font-bold mb-4">Conecta</h2>
                      <p className="text-xl text-gray-400 max-w-md">
                        Descubre eventos exclusivos y gente con tu misma vibra.
                      </p>
                    </section>
                    
                    {/* SECCIÓN 3 */}
                    <section className="h-screen flex flex-col justify-center items-center text-center text-white">
                      <h2 className="text-6xl font-bold mb-6">Descárgala hoy</h2>
                      <button className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                        App Store
                      </button>
                    </section>

                  </div>
               </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </main>
  );
}