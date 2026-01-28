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

  const texture1 = useTexture('/1.jpg'); 
  const texture2 = useTexture('/2.jpg'); 
  const texture3 = useTexture('/3.jpg');

  [texture1, texture2, texture3].forEach(t => {
    t.flipY = true; 
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.rotation = 0; 
    t.repeat.set(1, 1); 
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; // 0 al principio, 1 al final
      
      // --- LÓGICA DE TEXTURAS ---
      let activeTexture = texture1;
      if (r > 0.33) activeTexture = texture2;
      if (r > 0.66) activeTexture = texture3;

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

      // 1. POSICIÓN PENDULAR (Derecha -> Izquierda -> Derecha)
      // Usamos Math.cos para hacer un viaje de ida y vuelta suave.
      // r * PI * 2 es un ciclo completo de coseno (1 -> -1 -> 1)
      // Multiplicado por 1.5 metros de amplitud.
      const targetPosX = Math.cos(r * Math.PI * 2) * 1.5;

      // 2. POSICIÓN Y (FLOTACIÓN)
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.1;

      // 3. ROTACIÓN Y (EL GIRO DE CAMBIO DE PANTALLA)
      // -0.3: Ángulo inicial para que mire un poco hacia el centro.
      // + r * Math.PI * 4: Da 2 vueltas completas (720 grados) durante todo el scroll.
      const targetRotationY = -0.3 + (r * Math.PI * 4);

      // 4. ROTACIÓN X (MIRAR ARRIBA)
      // PI/2 es de pie (90º). Le restamos 0.15 para que mire un poco hacia arriba.
      const targetRotationX = (Math.PI / 2) - 0.15;
      
      // 5. ROTACIÓN Z (INERCIA LATERAL)
      // Un pequeño balanceo según la posición para dar realismo
      const targetRotationZ = Math.sin(r * Math.PI * 2) * 0.1;

      // --- APLICACIÓN CON SUAVIZADO ---
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 3 * delta);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 3 * delta);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 3 * delta);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 3 * delta);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, 3 * delta);
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
               <Iphone />
               
               <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div className="w-screen px-8">
                    
                    {/* SECCIÓN 1: Móvil a la Derecha -> Texto a la Izquierda */}
                    <section className="h-screen flex flex-col justify-center items-start max-w-lg text-white">
                      <h1 className="text-7xl font-bold mb-4 tracking-tighter">NightVibe</h1>
                      <p className="text-xl text-gray-400">La noche cobra vida.</p>
                      <p className="text-sm mt-10 animate-bounce">▼ Haz Scroll</p>
                    </section>
                    
                    {/* SECCIÓN 2: Móvil a la Izquierda -> Texto a la Derecha (items-end) */}
                    <section className="h-screen flex flex-col justify-center items-end text-right text-white">
                      <h2 className="text-5xl font-bold mb-4">Conecta</h2>
                      <p className="text-xl text-gray-400 max-w-md">
                        Descubre eventos exclusivos y gente con tu misma vibra.
                      </p>
                    </section>
                    
                    {/* SECCIÓN 3: Móvil a la Derecha -> Texto a la Izquierda (items-start) */}
                    <section className="h-screen flex flex-col justify-center items-start text-left text-white">
                      <h2 className="text-6xl font-bold mb-6">Descárgala hoy</h2>
                      <p className="text-xl text-gray-400 mb-6 max-w-md">
                        Disponible en iOS y Android.
                      </p>
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

/*'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, Float, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const texture1 = useTexture('/1.jpg'); 
  const texture2 = useTexture('/2.jpg'); 
  const texture3 = useTexture('/3.jpg');

  [texture1, texture2, texture3].forEach(t => {
    t.flipY = true; 
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.rotation = 0; 
    t.repeat.set(1, 1); 
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const r = scroll.offset; 
      
      const sectionIndex = Math.floor(r * 2.9); 
      
      let activeTexture = texture1;
      if (r > 0.33) activeTexture = texture2;
      if (r > 0.66) activeTexture = texture3;

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

      // --- CÁLCULOS DE MOVIMIENTO CORREGIDOS ---

      // 1. POSICIÓN X
      // Empieza en 1.5 (Derecha) y cruza hacia la izquierda (-0.5)
      // Ajustado para que no se salga tanto de la pantalla al final
      const targetPosX = 1.5 - (r * 2.5); 

      // 2. POSICIÓN Y (FLOTACIÓN)
      // Añadimos un leve movimiento vertical para que no parezca pegado al suelo
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.1;

      // 3. ROTACIÓN Y (EL GIRO)
      // Empieza en -0.3 (Mirando sutilmente al centro)
      // El giro de 360 grados por sección se mantiene
      const targetRotationY = -0.3 + (sectionIndex * Math.PI * 2);

      // 4. ROTACIÓN X (LA CLAVE DEL "ESTIRAMIENTO")
      // ANTES: 0.1 (Tumbado) -> MALO
      // AHORA: (Math.PI / 2) es 90 grados (De pie). Le restamos 0.1 para inclinarlo un pelín hacia arriba.
      const targetRotationX = (Math.PI / 2) - 0.1;
      
      // 5. ROTACIÓN Z (BALANCEO)
      const targetRotationZ = (1 - r * 2) * 0.05;

      // --- APLICACIÓN ---
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 3 * delta);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 3 * delta); // Añadido Y
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 3 * delta);
      
      // Aquí aplicamos la corrección de X
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 3 * delta);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, 3 * delta);
    }
  });

  return (
    // Inicialmente lo ponemos de pie (PI / 2) para que no haya saltos raros al cargar
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
               <Iphone />
               
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
}*/