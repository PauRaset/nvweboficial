'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Points, PointMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const MODEL_PATH = '/iphone.glb';

// --- COMPONENTE DE ANIMACIÓN ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, delay: delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// --- ESTRELLAS (INTACTO) ---
function Stars(props: any) {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const points = new Float32Array(2000 * 3);
    for (let i = 0; i < points.length; i++) {
      const x = (Math.random() - 0.5) * 15; 
      const y = (Math.random() - 0.5) * 15; 
      const z = - (Math.random() * 8 + 2); 
      points[i * 3] = x; points[i * 3 + 1] = y; points[i * 3 + 2] = z;
    }
    return points;
  });
  useFrame((state, delta) => { if (ref.current) ref.current.rotation.z -= delta / 20; });
  return (
    <group rotation={[0, 0, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffffff" size={0.015} sizeAttenuation={true} depthWrite={false} opacity={0.5} />
      </Points>
    </group>
  );
}

// --- IPHONE (INTACTO) ---
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
    textures.forEach(t => { t.flipY = true; t.colorSpace = THREE.SRGBColorSpace; t.center.set(0.5, 0.5); });
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
            node.material.map = activeTexture; node.material.needsUpdate = true;
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
    <main className="w-full h-full bg-[#0b0c15] font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 md:px-12 py-6 text-white" style={{ color: 'white' }}>
        <div className="font-bold text-xl tracking-tighter">NIGHTVIBE®</div>
        <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase opacity-70">
          <a href="#" className="hover:opacity-100 transition-opacity">Manifesto</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Locations</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Membership</a>
        </div>
        <button className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform">
          Get App
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
                <div className="w-screen text-white" style={{ color: 'white' }}>
                  
                  {/* SECCIÓN 0: HERO (Titulo NightVibe) */}
                  <section className="h-screen flex flex-col justify-center px-8 md:px-24">
                    <FadeIn>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-purple-500"></div>
                        <span className="text-purple-400 font-medium tracking-[0.4em] text-xs uppercase">Est. 2024</span>
                      </div>
                      <h1 className="text-[13vw] leading-[0.85] font-black tracking-tighter uppercase mix-blend-overlay">
                        Night<br/>Vibe
                      </h1>
                      <p className="mt-8 text-xl font-light max-w-md leading-relaxed tracking-wide opacity-70">
                        La ciudad nunca duerme. Tú tampoco deberías.
                      </p>
                    </FadeIn>
                  </section>

                  {/* SECCIÓN 1: EVENT DETAIL */}
                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                       <div className="relative">
                          <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">01</span>
                          <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[15vh] font-black opacity-[0.03] -z-20 pointer-events-none tracking-tighter">EVENT</span>
                          
                          <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">
                            Event<span className="text-purple-500">Detail</span>
                          </h2>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                            Todo el evento, en una sola pantalla.
                          </h3>
                          <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6 leading-relaxed">
                            Info clara, estética potente y lo que importa: música, hora, lugar, entradas y el ambiente que te espera.
                            <br/><span className="block mt-2 text-white/80">Entra, siente el vibe y decide en segundos.</span>
                          </p>
                       </div>
                    </FadeIn>
                  </section>

                  {/* SECCIÓN 2: LISTA DE ASISTENTES */}
                  <section className="h-screen flex flex-col justify-center items-start px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -left-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">02</span>
                         <span className="absolute top-1/2 left-0 -translate-y-1/2 text-[15vh] font-black opacity-[0.03] -z-20 pointer-events-none tracking-tighter">GUEST</span>

                         <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">
                           Lista<span className="text-blue-500">Asistentes</span>
                         </h2>
                         <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                            No vas solo: mira quién va y quién se apunta.
                         </h3>
                         <p className="text-lg opacity-60 max-w-sm font-light border-l border-white/20 pl-6 leading-relaxed">
                           Descubre la gente que ya está dentro, tus amigos y nuevas conexiones antes de llegar.
                           <br/><span className="block mt-2 text-white/80">La noche empieza en la lista.</span>
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  {/* SECCIÓN 3: MAPA */}
                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">03</span>
                         <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[15vh] font-black opacity-[0.03] -z-20 pointer-events-none tracking-tighter">MAP</span>

                         <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">
                           Ma<span className="text-pink-500">pa</span>
                         </h2>
                         <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                            Explora la noche en tiempo real.
                         </h3>
                         <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6 leading-relaxed">
                           Eventos cerca de ti, filtros por distancia y un mapa que te enseña dónde está pasando “algo”.
                           <br/><span className="block mt-2 text-white/80">Abre el mapa. Encuentra tu plan.</span>
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  {/* SECCIÓN 4: PROMOCIONES */}
                  <section className="h-screen flex flex-col justify-center items-start px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -left-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">04</span>
                         <span className="absolute top-1/2 left-0 -translate-y-1/2 text-[15vh] font-black opacity-[0.03] -z-20 pointer-events-none tracking-tighter">PROMO</span>

                         <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">
                           Promo<span className="text-yellow-500">ciones</span>
                         </h2>
                         <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                            Sube de nivel. Desbloquea perks.
                         </h3>
                         <p className="text-lg opacity-60 max-w-sm font-light border-l border-white/20 pl-6 leading-relaxed">
                           Promos, retos y recompensas dentro de la noche: de lo básico a lo VIP, según lo que hagas.
                           <br/><span className="block mt-2 text-white/80">La fiesta también se juega.</span>
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  {/* SECCIÓN 5: PERFIL */}
                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">05</span>
                         <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[15vh] font-black opacity-[0.03] -z-20 pointer-events-none tracking-tighter">PROFILE</span>

                         <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">
                           Per<span className="text-green-500">fil</span>
                         </h2>
                         <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                            Tu identidad nocturna, en un perfil.
                         </h3>
                         <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6 leading-relaxed">
                           Tus eventos, tu actividad, tu estilo y tu historial de noches. Para clubs y para público.
                           <br/><span className="block mt-2 text-white/80">Construye tu vibe.</span>
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  {/* FOOTER */}
                  <section className="h-screen flex flex-col justify-center items-center text-center px-8">
                    <FadeIn>
                      <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
                        Ready to join?
                      </h2>
                      <div className="group relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative bg-white text-black px-12 py-4 rounded-full font-bold text-sm tracking-[0.2em] uppercase hover:scale-105 transition-transform">
                          Download App
                        </button>
                      </div>
                      <p className="mt-12 opacity-30 text-[10px] uppercase tracking-[0.3em]">
                        © 2024 NightVibe Inc. All rights reserved.
                      </p>
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


/*'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, ScrollControls, useScroll, Scroll, useTexture, Points, PointMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const MODEL_PATH = '/iphone.glb';

// --- COMPONENTE DE ANIMACIÓN ---
function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, delay: delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
      points[i * 3] = x; points[i * 3 + 1] = y; points[i * 3 + 2] = z;
    }
    return points;
  });
  useFrame((state, delta) => { if (ref.current) ref.current.rotation.z -= delta / 20; });
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
    textures.forEach(t => { t.flipY = true; t.colorSpace = THREE.SRGBColorSpace; t.center.set(0.5, 0.5); });
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
            node.material.map = activeTexture; node.material.needsUpdate = true;
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
    <main className="w-full h-full bg-[#0b0c15] font-sans">
      
      <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 md:px-12 py-6 text-white" style={{ color: 'white' }}>
        <div className="font-bold text-xl tracking-tighter">NIGHTVIBE®</div>
        <div className="hidden md:flex gap-8 text-xs font-medium tracking-widest uppercase opacity-70">
          <a href="#" className="hover:opacity-100 transition-opacity">Manifesto</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Locations</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Membership</a>
        </div>
        <button className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform">
          Get App
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
                
                <div className="w-screen text-white" style={{ color: 'white' }}>
                  
                  <section className="h-screen flex flex-col justify-center px-8 md:px-24">
                    <FadeIn>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-purple-500"></div>
                        <span className="text-purple-400 font-medium tracking-[0.4em] text-xs uppercase">Est. 2024</span>
                      </div>
                      <h1 className="text-[13vw] leading-[0.85] font-black tracking-tighter uppercase mix-blend-overlay">
                        Night<br/>Vibe
                      </h1>
                      <p className="mt-8 text-xl font-light max-w-md leading-relaxed tracking-wide opacity-70">
                        La ciudad nunca duerme. Tú tampoco deberías.
                      </p>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                       <div className="relative">
                          <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">01</span>
                          <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
                            Disco<span className="text-purple-500">very</span>
                          </h2>
                          <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6">
                            Acceso curado a los eventos que realmente importan. Sin ruido, solo música.
                          </p>
                       </div>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -left-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">02</span>
                         <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
                           Conn<span className="text-blue-500">ect</span>
                         </h2>
                         <p className="text-lg opacity-60 max-w-sm font-light border-l border-white/20 pl-6">
                           Encuentra tu tribu en la pista de baile. Conexiones reales en tiempo real.
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">03</span>
                         <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
                           VIP<span className="text-pink-500">Access</span>
                         </h2>
                         <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6">
                           Reserva tu mesa con un tap. Entra como si fueras el dueño del lugar.
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-start px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -left-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">04</span>
                         <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
                           Live<span className="text-yellow-500">It</span>
                         </h2>
                         <p className="text-lg opacity-60 max-w-sm font-light border-l border-white/20 pl-6">
                           Experiencias inmersivas que difuminan la línea entre la realidad y la fiesta.
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-end text-right px-8 md:px-24">
                    <FadeIn>
                      <div className="relative">
                         <span className="absolute -top-20 -right-4 text-[12rem] font-black opacity-[0.03] -z-10 leading-none pointer-events-none">05</span>
                         <h2 className="text-6xl md:text-8xl font-black mb-4 uppercase tracking-tighter">
                           Sec<span className="text-green-500">ure</span>
                         </h2>
                         <p className="text-lg opacity-60 max-w-sm ml-auto font-light border-r border-white/20 pr-6">
                           Tecnología Blockchain para entradas infalsificables. Tu noche está segura.
                         </p>
                      </div>
                    </FadeIn>
                  </section>

                  <section className="h-screen flex flex-col justify-center items-center text-center px-8">
                    <FadeIn>
                      <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
                        Ready to join?
                      </h2>
                      <div className="group relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button className="relative bg-white text-black px-12 py-4 rounded-full font-bold text-sm tracking-[0.2em] uppercase hover:scale-105 transition-transform">
                          Download App
                        </button>
                      </div>
                      <p className="mt-12 opacity-30 text-[10px] uppercase tracking-[0.3em]">
                        © 2024 NightVibe Inc. All rights reserved.
                      </p>
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
}*/