'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Points, PointMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
// Importamos Framer Motion para animar los textos HTML
import { motion } from 'framer-motion';

const MODEL_PATH = '/iphone.glb';

// --- COMPONENTE DE ANIMACIÓN REUTILIZABLE ---
// Todo lo que envuelvas con esto aparecerá suavemente al hacer scroll
function FadeIn({ children, delay = 0, x = 0 }: { children: React.ReactNode, delay?: number, x?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }} // Se activa 100px antes de entrar
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// --- ESTRELLAS (FONDO) ---
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
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.5}
        />
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
        <Canvas camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 2]}>
          <color attach="background" args={['#0b0c15']} />
          <fog attach="fog" args={['#0b0c15', 8, 25]} />
          
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.3}>
              
              <Stars />
              <Iphone />
              
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <div className="w-screen font-sans">
                  
                  <section className="h-screen flex flex-col justify-center px-12 md:px-24">
                    <FadeIn delay={0.2}>
                      <span className="text-purple-400 font-bold tracking-[0.5em] mb-4 text-xs uppercase block">Welcome to the future</span>
                    </FadeIn>
                    <FadeIn delay={0.4}>
                      <h1 className="text-[10vw] leading-[0.9] font-black mb-8 tracking-tighter text-white uppercase drop-shadow-lg">
                        Night<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">Vibe</span>
                      </h1>
                    </FadeIn>
                    <FadeIn delay={0.6}>
                      <p className="text-xl text-gray-400 max-w-md">La noche es joven. Tú también. Descúbrela.</p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 opacity-10 pointer-events-none select-none overflow-hidden">
                       <h2 className="text-[20vh] font-black text-white leading-none tracking-tighter translate-x-12">DISC</h2>
                    </div>

                    <FadeIn x={50}>
                      <h2 className="text-7xl font-black mb-2 text-white/5 uppercase absolute -top-20 right-0">01</h2>
                      <h3 className="text-5xl font-bold text-white mb-6 tracking-tight">ENCUENTRA<br/>TU LUGAR</h3>
                      <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        El pulso de la ciudad en tu mano. Cada club, cada fiesta, cada secreto revelado en tiempo real.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24 relative">
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 -z-10 opacity-10 pointer-events-none select-none">
                       <h2 className="text-[20vh] font-black text-white leading-none tracking-tighter -translate-x-12">CONN</h2>
                    </div>

                    <FadeIn x={-50}>
                      <h2 className="text-7xl font-black mb-2 text-white/5 uppercase absolute -top-20 left-0">02</h2>
                      <h3 className="text-5xl font-bold text-white mb-6 tracking-tight">NO ESTÁS<br/>SOLO</h3>
                      <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Encuentra a tu gente entre el neón y el humo. Conecta antes de llegar al club.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24 relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 opacity-10 pointer-events-none select-none">
                       <h2 className="text-[20vh] font-black text-white leading-none tracking-tighter translate-x-12">VIP</h2>
                    </div>

                    <FadeIn x={50}>
                      <h2 className="text-7xl font-black mb-2 text-white/5 uppercase absolute -top-20 right-0">03</h2>
                      <h3 className="text-5xl font-bold text-white mb-6 tracking-tight">ACCESO<br/>INSTANTÁNEO</h3>
                      <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Mesas exclusivas en segundos. Sin colas, sin esperas, solo disfrutar de la noche.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-12 md:px-24 relative">
                    <FadeIn x={-50}>
                      <h2 className="text-7xl font-black mb-2 text-white/5 uppercase absolute -top-20 left-0">04</h2>
                      <h3 className="text-5xl font-bold text-white mb-6 tracking-tight">MOMENTOS<br/>ÚNICOS</h3>
                      <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Experiencias inmersivas diseñadas para ser recordadas (o no). Tú decides.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-12 md:px-24 relative">
                    <FadeIn x={50}>
                       <h2 className="text-7xl font-black mb-2 text-white/5 uppercase absolute -top-20 right-0">05</h2>
                      <h3 className="text-5xl font-bold text-white mb-6 tracking-tight">100%<br/>SEGURO</h3>
                      <p className="text-lg text-gray-400 max-w-md font-light leading-relaxed">
                        Entradas verificadas con blockchain. Tu noche está garantizada y protegida.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center px-12 relative">
                    <FadeIn>
                      <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                        <button className="relative bg-black text-white px-16 py-5 rounded-full font-bold text-xl tracking-wider uppercase border border-white/10 hover:bg-white hover:text-black transition-colors">
                          Download NightVibe
                        </button>
                      </div>
                      <p className="mt-8 text-white/30 text-xs uppercase tracking-widest">Available on iOS & Android</p>
                    </FadeIn>
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
