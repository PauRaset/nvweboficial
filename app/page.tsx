'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Points, PointMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

// Fondo de partículas nativo (sin librerías externas)
function Particles() {
  const ref = useRef<THREE.Points>(null);
  
  // Generamos 5000 puntos aleatorios de forma nativa
  const sphere = useMemo(() => {
    const points = new Float32Array(5000 * 3);
    for (let i = 0; i < points.length; i++) {
      points[i] = (Math.random() - 0.5) * 10; // Esparcidas en un cubo de 10x10
    }
    return points;
  }, []);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

function Iphone() {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const textures = [
    useTexture('/1.jpg'), useTexture('/2.jpg'), useTexture('/3.jpg'),
    useTexture('/4.jpg'), useTexture('/5.jpg'), useTexture('/6.jpg'),
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
            node.material = new THREE.MeshBasicMaterial({ map: activeTexture, toneMapped: false });
          }
          if (node.material.map !== activeTexture) {
            node.material.map = activeTexture;
            node.material.needsUpdate = true;
          }
        }
      });

      const isEven = textureIndex % 2 === 0;
      const targetPosX = isEven ? 1.3 : -1.3;
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
    <main className="w-full h-full bg-[#020203]">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 md:px-16 py-8 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="text-white font-black text-2xl tracking-[0.2em]">NIGHTVIBE</div>
        <div className="hidden lg:flex gap-12 text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">
          <a href="#" className="hover:text-purple-500 transition-colors">Experience</a>
          <a href="#" className="hover:text-purple-500 transition-colors">The Map</a>
          <a href="#" className="hover:text-purple-500 transition-colors">VIP Access</a>
        </div>
        <button className="border border-white/20 text-white px-8 py-2 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
          Join Now
        </button>
      </nav>

      {/* BACKGROUND CANVAS */}
      <div className="fixed top-0 left-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 2]}>
          <color attach="background" args={['#020203']} />
          <ambientLight intensity={1} />
          <Environment preset="night" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              <Particles />
              <Iphone />
              
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen font-sans">
                  
                  <section className="h-screen flex flex-col justify-center px-12 md:px-24">
                    <span className="text-purple-500 font-bold tracking-[0.5em] mb-4 text-sm uppercase">Welcome to the future</span>
                    <h1 className="text-[12vw] leading-[0.8] font-black mb-8 tracking-tighter text-white uppercase">
                      Night<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Vibe</span>
                    </h1>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-6 uppercase text-white opacity-20">Discovery</h2>
                    <p className="text-2xl text-white/60 max-w-md font-light leading-relaxed">The city's heartbeat, curated for you. Every club, every vibe, one app.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-6 uppercase text-white">Connection</h2>
                    <p className="text-2xl text-white/60 max-w-md font-light leading-relaxed">Don't just go out. Find your tribe in the neon haze.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-6 uppercase text-white">Booking</h2>
                    <p className="text-2xl text-white/60 max-w-md font-light leading-relaxed">VIP tables in seconds. No lines, no drama. Just pure access.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-6 uppercase text-white italic">LIVE IT</h2>
                    <p className="text-2xl text-white/60 max-w-md font-light leading-relaxed">Immersive experiences built for the legends of the night.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-6 uppercase text-purple-600">Secure</h2>
                    <p className="text-2xl text-white/60 max-w-md font-light leading-relaxed">Blockchain verified entries. Your night is guaranteed.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center px-12">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <button className="relative bg-black text-white px-20 py-6 rounded-full font-black text-2xl tracking-tighter uppercase border border-white/10">
                        Download Now
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
