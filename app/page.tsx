'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const textures = [
    useTexture('/1.jpg'),
    useTexture('/2.jpg'),
    useTexture('/3.jpg'),
    useTexture('/4.jpg'),
    useTexture('/5.jpg'),
    useTexture('/6.jpg'),
    useTexture('/7.jpg'),
  ];

  useMemo(() => {
    textures.forEach(t => {
      t.flipY = true;
      t.colorSpace = THREE.SRGBColorSpace;
      t.center.set(0.5, 0.5);
    });
  }, [textures]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 
      
      const textureIndex = Math.min(Math.floor(r * textures.length), textures.length - 1);
      const activeTexture = textures[textureIndex];

      // --- ACTUALIZACIÓN DE PANTALLA ---
      Object.values(nodes).forEach((node: any) => {
        if (node.isMesh && node.name === 'object010_scr_0') {
          if (!(node.material instanceof THREE.MeshBasicMaterial)) {
            node.material = new THREE.MeshBasicMaterial({
              map: activeTexture,
              toneMapped: false,
            });
          }
          if (node.material.map !== activeTexture) {
            node.material.map = activeTexture;
            node.material.needsUpdate = true;
          }
        }
      });

      // --- CÁLCULOS DE MOVIMIENTO ---

      // 1. POSICIÓN X
      const isEven = textureIndex % 2 === 0;
      let targetPosX = isEven ? 1.3 : -1.3;

      // 2. ROTACIÓN Z (MIRADA CORREGIDA AL CENTRO)
      const baseRotation = textureIndex * Math.PI * 2;
      
      // CORRECCIÓN AQUÍ:
      // Si está a la DERECHA (isEven), rotamos POSITIVO para que la pantalla mire al centro.
      // Si está a la IZQUIERDA (!isEven), rotamos NEGATIVO para que la pantalla mire al centro.
      const lookAtCenterOffset = isEven ? 0.4 : -0.4;
      
      const targetRotationZ = baseRotation + lookAtCenterOffset;

      // 3. INERCIA Y (BALANCEO)
      const dist = targetPosX - groupRef.current.position.x;
      const targetRotationY = dist * 0.2; 

      // 4. ESTÁTICA X Y FLOTACIÓN Y
      const targetRotationX = Math.PI / 2;
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.05;

      // --- APLICACIÓN SUAVE ---
      const smoothSpeed = 6 * delta; 

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, smoothSpeed);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, smoothSpeed);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, smoothSpeed);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, smoothSpeed);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, smoothSpeed);
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
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              <Iphone />
              
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen px-8">
                  {/* Secciones de texto (igual que antes) */}
                  <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                    <h1 className="text-7xl font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">NightVibe</h1>
                    <p className="text-xl text-gray-400">Tu ciudad, tus reglas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Descubre</h2>
                    <p className="text-xl text-gray-400 max-w-md">Explora los eventos más exclusivos cerca de ti.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Conecta</h2>
                    <p className="text-xl text-gray-400 max-w-md">Haz match con personas que comparten tu misma vibra.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Reserva</h2>
                    <p className="text-xl text-gray-400 max-w-md">Tu mesa VIP lista en segundos. Sin esperas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">VIVE</h2>
                    <p className="text-xl text-gray-400 max-w-md">No solo salgas, crea recuerdos inolvidables.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Seguridad</h2>
                    <p className="text-xl text-gray-400 max-w-md">Control total de tus entradas y acceso garantizado.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center text-white">
                    <h2 className="text-7xl font-bold mb-6 italic">Let's vibe.</h2>
                    <button className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:bg-gray-200 transition-colors">
                      Descargar App
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

/*'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const textures = [
    useTexture('/1.jpg'),
    useTexture('/2.jpg'),
    useTexture('/3.jpg'),
    useTexture('/4.jpg'),
    useTexture('/5.jpg'),
    useTexture('/6.jpg'),
    useTexture('/7.jpg'),
  ];

  useMemo(() => {
    textures.forEach(t => {
      t.flipY = true;
      t.colorSpace = THREE.SRGBColorSpace;
      t.center.set(0.5, 0.5);
    });
  }, [textures]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 
      
      // Calculamos el índice actual basado en el scroll (0 a 6)
      const textureIndex = Math.min(Math.floor(r * textures.length), textures.length - 1);
      const activeTexture = textures[textureIndex];

      // --- ACTUALIZACIÓN DE PANTALLA ---
      Object.values(nodes).forEach((node: any) => {
        if (node.isMesh && node.name === 'object010_scr_0') {
          if (!(node.material instanceof THREE.MeshBasicMaterial)) {
            node.material = new THREE.MeshBasicMaterial({
              map: activeTexture,
              toneMapped: false,
            });
          }
          if (node.material.map !== activeTexture) {
            node.material.map = activeTexture;
            node.material.needsUpdate = true;
          }
        }
      });

      // --- CÁLCULOS DE MOVIMIENTO ---

      // 1. POSICIÓN X: Alterna Derecha (1.3) e Izquierda (-1.3)
      const isEven = textureIndex % 2 === 0;
      let targetPosX = isEven ? 1.3 : -1.3;

      // 2. ROTACIÓN Z (GIRO): 
      // Cada sección añade una vuelta completa (Math.PI * 2)
      // Restamos -0.2 inicial para estética.
      const targetRotationZ = -0.2 + (textureIndex * Math.PI * 2);

      // 3. INERCIA Y (BALANCEO): Se inclina según el movimiento lateral
      const dist = targetPosX - groupRef.current.position.x;
      const targetRotationY = dist * 0.2; 

      // 4. ESTÁTICA X Y FLOTACIÓN Y
      const targetRotationX = Math.PI / 2;
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.05;

      // --- APLICACIÓN SUAVE (SMOOTH) ---
      const smoothSpeed = 6 * delta; 

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, smoothSpeed);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, smoothSpeed);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, smoothSpeed);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, smoothSpeed);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, smoothSpeed);
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
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              <Iphone />
              
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen px-8">
                  
                  <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                    <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                    <p className="text-xl text-gray-400">Tu ciudad, tus reglas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Descubre</h2>
                    <p className="text-xl text-gray-400 max-w-md">Explora los eventos más exclusivos cerca de ti.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Conecta</h2>
                    <p className="text-xl text-gray-400 max-w-md">Haz match con personas que comparten tu misma vibra.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Reserva</h2>
                    <p className="text-xl text-gray-400 max-w-md">Tu mesa VIP lista en segundos. Sin esperas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">VIVE</h2>
                    <p className="text-xl text-gray-400 max-w-md">No solo salgas, crea recuerdos inolvidables.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                    <h2 className="text-5xl font-bold mb-4 uppercase italic">Seguridad</h2>
                    <p className="text-xl text-gray-400 max-w-md">Control total de tus entradas y acceso garantizado.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center text-white">
                    <h2 className="text-7xl font-bold mb-6 italic">Let's vibe.</h2>
                    <button className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:bg-gray-200 transition-colors">
                      Descargar App
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
}*/