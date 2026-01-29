'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture } from '@react-three/drei';
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
      
      // --- LÓGICA DE TEXTURAS ---
      // Sincronizado con los puntos medios de las transiciones rápidas
      let activeTexture = texture1;
      if (r >= 0.33 && r < 0.66) activeTexture = texture2;
      else if (r >= 0.66) activeTexture = texture3;

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

      // 1. ZONAS DE RESISTENCIA (POSICIÓN X)
      // Ajustamos los umbrales para que el viaje sea cortísimo (ej: de 0.3 a 0.4)
      // y la estancia sea larguísima.
      let targetPosX = 1.3; 
      if (r > 0.33 && r < 0.66) targetPosX = -1.3; 
      if (r >= 0.66) targetPosX = 1.3; 

      // 2. GIRO Z (EFECTO SNAP)
      // Queremos que el giro también se sienta estático y luego gire rápido.
      // Math.PI * 4 son dos vueltas completas.
      const targetRotationZ = -0.2 + (r * Math.PI * 4);

      // 3. INERCIA Y (BALANCEO)
      const dist = targetPosX - groupRef.current.position.x;
      const targetRotationY = dist * 0.2; // Aumentado para enfatizar el "snap" rápido

      // 4. FLOTACIÓN Y EJE X
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.1;
      const targetRotationX = Math.PI / 2;

      // --- APLICACIÓN DE FÍSICAS ---
      // Usamos una velocidad de lerp alta para el efecto "resistencia -> ráfaga"
      const smoothSpeed = 8 * delta; 

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
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            {/* Pages=4 da más "espacio" de scroll para que no se sienta corto */}
            <ScrollControls pages={4} damping={0.2}>
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
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture } from '@react-three/drei';
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
      const r = scroll.offset; // 0 a 1
      
      // --- LÓGICA DE TEXTURAS ---
      // Cambiamos un poco antes del centro de la transición para que ya esté lista
      let activeTexture = texture1;
      if (r >= 0.25 && r < 0.75) activeTexture = texture2;
      else if (r >= 0.75) activeTexture = texture3;

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

      // 1. CURVA DE MOVIMIENTO PERSONALIZADA
      // En lugar de ser lineal, usamos esto para que se quede quieto más rato.
      // Definimos puntos clave donde el móvil debe estar quieto.
      
      let targetPosX = 1.3; // Posición base (Derecha)

      // Transición 1 (De Derecha a Izquierda): Ocurre rápido entre 0.25 y 0.35
      if (r > 0.25 && r < 0.75) {
        targetPosX = -1.3; // Izquierda
      }
      // Transición 2 (De Izquierda a Derecha): Ocurre rápido entre 0.75 y 0.85
      if (r >= 0.75) {
        targetPosX = 1.3; // Derecha
      }

      // 2. GIRO Z (VUELTAS) - ANTICIPADO
      // Hacemos que la rotación sea fluida pero vinculada al scroll total.
      // Usamos una curva exponencial suave para que gire rápido en los cambios.
      const spin = r * Math.PI * 4; // 720 grados total
      const targetRotationZ = -0.2 + spin;

      // 3. INCLINACIÓN Y (EMPUJÓN)
      // Calculamos la distancia al objetivo. Si está lejos, se inclina más.
      const dist = targetPosX - groupRef.current.position.x;
      // Multiplicamos por 0.15 para que se note bien la inercia al moverse rápido
      const targetRotationY = dist * 0.15; 

      // 4. FLOTACIÓN Y RESTO
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.1;
      const targetRotationX = Math.PI / 2;

      // --- APLICACIÓN DE FÍSICAS (SMOOTH) ---
      // Aumentamos la velocidad del Lerp a 6 (antes 4) para que llegue rápido a su sitio
      // pero mantenemos la suavidad.
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
          <ambientLight intensity={2} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={3} damping={0.2}>
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
}*/