'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, Float, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Carga de texturas con nombres exactos
  const texture1 = useTexture('/1.PNG');
  const texture2 = useTexture('/2.JPEG');
  const texture3 = useTexture('/3.PNG');

  [texture1, texture2, texture3].forEach(t => {
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 

      // --- CAMBIO DE PANTALLA (VERSIÓN ULTRA-SEGURA PARA TYPESCRIPT) ---
      const screenMesh = (nodes.Screen || nodes.Body_2 || Object.values(nodes).find((n: any) => n.name.includes('Screen'))) as any;

      if (screenMesh && screenMesh.material) {
        // Forzamos a que trate el material como un objeto con propiedad 'map'
        const targetMaterial = Array.isArray(screenMesh.material) ? screenMesh.material[0] : screenMesh.material;
        
        if (targetMaterial && 'map' in targetMaterial) {
          if (r < 0.33) {
            targetMaterial.map = texture1;
          } else if (r < 0.66) {
            targetMaterial.map = texture2;
          } else {
            targetMaterial.map = texture3;
          }
          targetMaterial.needsUpdate = true;
        }
      }

      // --- TU MOVIMIENTO ORIGINAL ---
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
               <Scroll>
                  <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                      <Iphone />
                  </Float>
               </Scroll>
               
               <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div className="w-screen px-8">
                    <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                      <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                      <p className="text-xl text-gray-400">La noche cobra vida.</p>
                      <p className="text-sm mt-10 animate-bounce">▼ Haz Scroll</p>
                    </section>
                    
                    <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                      <h2 className="text-5xl font-bold mb-4">Conecta</h2>
                      <p className="text-xl text-gray-400 max-w-md">
                        Descubre eventos exclusivos y gente con tu misma vibra.
                      </p>
                    </section>
                    
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