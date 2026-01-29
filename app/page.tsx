'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Float } from '@react-three/drei';
import { useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

// Componente para las luces de fondo que se mueven
function BackgroundLights() {
  const light1 = useRef<THREE.Mesh>(null);
  const light2 = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    const r = scroll.offset;
    if (light1.current) {
      light1.current.position.set(-2 - r * 2, 1 + r, -2);
      light1.current.scale.setScalar(2 + Math.sin(state.clock.elapsedTime) * 0.5);
    }
    if (light2.current) {
      light2.current.position.set(2 + r * 2, -1 - r, -2);
      light2.current.scale.setScalar(1.5 + Math.cos(state.clock.elapsedTime) * 0.5);
    }
  });

  return (
    <>
      <mesh ref={light1} position={[-2, 1, -2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#4400ff" transparent opacity={0.15} />
      </mesh>
      <mesh ref={light2} position={[2, -1, -2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ff0088" transparent opacity={0.1} />
      </mesh>
    </>
  );
}

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

      const isEven = textureIndex % 2 === 0;
      let targetPosX = isEven ? 1.3 : -1.3;
      const baseRotation = textureIndex * Math.PI * 2;
      const lookAtCenterOffset = isEven ? 0.4 : -0.4;
      const targetRotationZ = baseRotation + lookAtCenterOffset;
      const dist = targetPosX - groupRef.current.position.x;
      const targetRotationY = dist * 0.2; 
      const targetRotationX = Math.PI / 2;
      const targetPosY = Math.sin(state.clock.elapsedTime) * 0.05;

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
    <main className="w-full h-full bg-[#050505]">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 backdrop-blur-md bg-black/10">
        <div className="text-white font-bold text-2xl tracking-tighter">NIGHTVIBE</div>
        <div className="hidden md:flex gap-8 text-white/60 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Eventos</a>
          <a href="#" className="hover:text-white transition-colors">Clubs</a>
          <a href="#" className="hover:text-white transition-colors">VIP</a>
        </div>
        <button className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
          GET THE APP
        </button>
      </nav>

      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#050505_100%)]">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              <BackgroundLights />
              <Iphone />
              
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen px-12 md:px-24">
                  
                  <section className="h-screen flex flex-col justify-center items-start max-w-2xl">
                    <h1 className="text-8xl font-black mb-4 tracking-tighter text-white">
                      Night<span className="text-purple-600">Vibe</span>
                    </h1>
                    <p className="text-2xl text-white/40 font-light">Tu ciudad, tus reglas. La noche empieza aquí.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right">
                    <h2 className="text-6xl font-bold mb-4 uppercase italic text-white drop-shadow-2xl">Descubre</h2>
                    <p className="text-xl text-white/50 max-w-md">Acceso exclusivo a los eventos más calientes de la ciudad.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start">
                    <h2 className="text-6xl font-bold mb-4 uppercase italic text-white">Conecta</h2>
                    <p className="text-xl text-white/50 max-w-md">Rodéate de personas que vibran en tu misma frecuencia.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right">
                    <h2 className="text-6xl font-bold mb-4 uppercase italic text-white">Reserva</h2>
                    <p className="text-xl text-white/50 max-w-md">Mesas VIP y botellas con un solo tap. Olvida las colas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start">
                    <h2 className="text-6xl font-bold mb-4 uppercase italic text-white">VIVE</h2>
                    <p className="text-xl text-white/50 max-w-md">Experiencias inmersivas diseñadas para ser recordadas.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right">
                    <h2 className="text-6xl font-bold mb-4 uppercase italic text-white">Seguridad</h2>
                    <p className="text-xl text-white/50 max-w-md">Entradas digitales seguras y acceso garantizado.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center">
                    <div className="p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10">
                      <h2 className="text-7xl font-black mb-6 italic text-white">READY?</h2>
                      <p className="text-white/40 mb-10 max-w-xs mx-auto">Únete a la comunidad más exclusiva de la vida nocturna.</p>
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all">
                        DOWNLOAD NOW
                      </button>
                    </div>
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

/*
MÒBIL PERFECTE

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
}*/
