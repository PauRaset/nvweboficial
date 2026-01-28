'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, Float, useTexture, Html } from '@react-three/drei';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const [nombresPiezas, setNombresPiezas] = useState<string[]>([]);

  const texture1 = useTexture('/1.jpg'); 
  const texture2 = useTexture('/2.jpg'); 
  const texture3 = useTexture('/3.jpg');

  // --- CONFIGURACIÓN DE TEXTURA ---
  [texture1, texture2, texture3].forEach(t => {
    t.flipY = false; 
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.rotation = 0; // Empezamos sin rotación
    t.repeat.set(1, 1); 
  });

  useEffect(() => {
    setNombresPiezas(Object.keys(nodes));
  }, [nodes]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 
      let activeTexture = texture3;
      if (r < 0.33) activeTexture = texture1;
      else if (r < 0.66) activeTexture = texture2;

      // --- MODO PANTALLA LED ---
      Object.values(nodes).forEach((node: any) => {
        // AQUÍ ESTABA EL ERROR: Antes seleccionábamos el cristal ('glass')
        // Ahora seleccionamos EXCLUSIVAMENTE la pantalla plana: 'scr'
        if (node.isMesh && node.name === 'object010_scr_0') {
             
             // Convertimos el material a luz sólida si no lo es ya
             if (!(node.material instanceof THREE.MeshBasicMaterial)) {
                node.material = new THREE.MeshBasicMaterial({
                  map: activeTexture,
                  toneMapped: false,
                });
             }
             
             node.material.map = activeTexture;
             node.material.needsUpdate = true;
        }
      });

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
      
      {/* Debug: Muestra si estamos encontrando la pieza */}
      <Html position={[20, 0, 0]} center>
         <div className="bg-white p-2 text-xs">
           Target: object010_scr_0
         </div>
      </Html>
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
               <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Iphone />
               </Float>
               <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div className="w-screen px-8">
                    <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                      <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                      <p className="text-xl text-gray-400">La noche cobra vida.</p>
                      <p className="text-sm mt-10 animate-bounce">▼ Haz Scroll</p>
                    </section>
                    <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                      <h2 className="text-5xl font-bold mb-4">Conecta</h2>
                    </section>
                    <section className="h-screen flex flex-col justify-center items-center text-center text-white">
                      <h2 className="text-6xl font-bold mb-6">Descárgala hoy</h2>
                      <button className="bg-white text-black px-8 py-3 rounded-full font-bold">App Store</button>
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