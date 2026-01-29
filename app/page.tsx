'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Points, PointMaterial, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/iphone.glb';

// --- COMPONENTE LOADER (PANTALLA DE CARGA) ---
function Loader() {
  const { progress } = useProgress();
  
  // Si la carga está completa (100%), ocultamos el loader con CSS (opacity-0)
  // pointer-events-none es vital para poder hacer click en la web después
  return (
    <div 
      className={`fixed top-0 left-0 w-full h-full z-[200] bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="text-white font-black text-6xl tracking-tighter mb-4">
        {Math.round(progress)}%
      </div>
      <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/40 text-xs uppercase tracking-[0.3em] mt-4 font-bold">
        Loading Experience
      </p>
    </div>
  );
}

// --- ESTRELLAS ---
function Stars(props: any) {
  const ref = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const points = new Float32Array(2000 * 3);
    for (let i = 0; i < points.length; i++) {
      const x = (Math.random() - 0.5) * 15; 
      const y = (Math.random() - 0.5) * 15; 
      const z = - (Math.random() * 8 + 2); 
      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    }
    return points;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.z -= delta / 20; 
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffffff" size={0.015} sizeAttenuation={true} depthWrite={false} opacity={0.5} />
      </Points>
    </group>
  );
}

// --- IPHONE ---
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
    <main className="w-full h-full bg-[#0b0c15]">
      
      {/* --- AÑADIMOS EL LOADER AQUÍ --- */}
      <Loader />

      <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 md:px-16 py-8 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="text-white font-black text-2xl tracking-[0.2em] italic">NIGHTVIBE</div>
        <div className="hidden lg:flex gap-12 text-white/60 text-[11px] uppercase tracking-[0.2em] font-semibold">
          <a href="#" className="hover:text-purple-400 transition-colors">Experience</a>
          <a href="#" className="hover:text-purple-400 transition-colors">The Map</a>
          <a href="#" className="hover:text-purple-400 transition-colors">VIP Access</a>
        </div>
        <button className="border border-white/10 bg-white/5 text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-purple-600 hover:border-purple-600 transition-all">
          Join Now
        </button>
      </nav>

      <div className="fixed top-0 left-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#0b0c15']} />
          <fog attach="fog" args={['#0b0c15', 5, 20]} />
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              <Stars />
              <Iphone />
              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} radius={0.5} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                <Noise opacity={0.03} /> 
              </EffectComposer>

              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen font-sans">
                  
                  <section className="h-screen flex flex-col justify-center px-12 md:px-24">
                    <span className="text-purple-400 font-bold tracking-[0.5em] mb-4 text-xs uppercase">Welcome to the future</span>
                    <h1 className="text-[10vw] leading-[0.9] font-black mb-8 tracking-tighter text-white uppercase drop-shadow-lg">
                      Night<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">Vibe</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-md">La noche es joven. Tú también. Descúbrela.</p>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-2 uppercase text-white/5 pointer-events-none select-none absolute right-12 z-0">Discovery</h2>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-white mb-6">ENCUENTRA TU LUGAR</h3>
                        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        El pulso de la ciudad en tu mano. Cada club, cada fiesta, cada secreto.
                        </p>
                    </div>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-2 uppercase text-white/5 pointer-events-none select-none absolute left-12 z-0">Connection</h2>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-white mb-6">NO ESTÁS SOLO</h3>
                        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Encuentra a tu gente entre el neón y el humo. Conecta antes de llegar.
                        </p>
                    </div>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-2 uppercase text-white/5 pointer-events-none select-none absolute right-12 z-0">Booking</h2>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-white mb-6">ACCESO VIP</h3>
                        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Mesas exclusivas en segundos. Sin colas, sin esperas, solo disfrutar.
                        </p>
                    </div>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-2 uppercase text-white/5 pointer-events-none select-none absolute left-12 z-0">Live It</h2>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-white mb-6">MOMENTOS ÚNICOS</h3>
                        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Experiencias inmersivas diseñadas para ser recordadas (o no).
                        </p>
                    </div>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24">
                    <h2 className="text-7xl md:text-9xl font-black mb-2 uppercase text-white/5 pointer-events-none select-none absolute right-12 z-0">Secure</h2>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-white mb-6">100% SEGURO</h3>
                        <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Entradas verificadas con blockchain. Tu noche está garantizada.
                        </p>
                    </div>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center px-12">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                      <button className="relative bg-black text-white px-16 py-5 rounded-full font-bold text-xl tracking-wider uppercase border border-white/10">
                        Download NightVibe
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
