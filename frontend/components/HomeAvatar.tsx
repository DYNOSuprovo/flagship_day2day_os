"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';

function TitanCore() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.005;
            group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group ref={group}>
            {/* Central Core */}
            <mesh>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="#0ea5e9"
                    emissive="#0ea5e9"
                    emissiveIntensity={2}
                    roughness={0.1}
                    metalness={1}
                />
            </mesh>

            {/* Orbiting Rings */}
            <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[1.8, 0.05, 16, 100]} />
                <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.5} />
            </mesh>

            {/* Floating Data Cubes */}
            {Array.from({ length: 8 }).map((_, i) => (
                <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={[
                        Math.sin(i) * 3,
                        Math.cos(i * 2) * 2,
                        Math.cos(i) * 3
                    ]}>
                        <boxGeometry args={[0.2, 0.2, 0.2]} />
                        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

function ValkyrieCore() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y -= 0.01;
            group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group ref={group}>
            {/* Central Essence */}
            <mesh>
                <icosahedronGeometry args={[0.8, 0]} />
                <meshPhysicalMaterial
                    color="#ec4899"
                    emissive="#ec4899"
                    emissiveIntensity={2}
                    roughness={0}
                    metalness={0.5}
                    transmission={0.6}
                    thickness={2}
                />
            </mesh>

            {/* Inner Light */}
            <mesh scale={0.5}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#fbcfe8" />
            </mesh>

            {/* Orbiting Shards */}
            {Array.from({ length: 12 }).map((_, i) => (
                <Float key={i} speed={4} rotationIntensity={4} floatIntensity={1}>
                    <mesh position={[
                        Math.cos(i) * 2.5,
                        Math.sin(i * 3) * 1.5,
                        Math.sin(i) * 2.5
                    ]}>
                        <tetrahedronGeometry args={[0.15, 0]} />
                        <meshStandardMaterial color="#db2777" emissive="#db2777" emissiveIntensity={3} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

export default function HomeAvatar() {
    const [gender, setGender] = useState<'male' | 'female'>('male');

    return (

        <div className="relative w-full h-full flex items-center justify-center">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <Suspense fallback={null}>
                        <color attach="background" args={['transparent']} />

                        {/* Lighting */}
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} intensity={1} color={gender === 'male' ? '#0ea5e9' : '#ec4899'} />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} color="white" />

                        {/* Environment */}
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color={gender === 'male' ? '#7dd3fc' : '#fbcfe8'} />
                        <Environment preset="city" />

                        {/* Avatar */}
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                            {gender === 'male' ? <TitanCore /> : <ValkyrieCore />}
                        </Float>

                        {/* Post Processing */}
                        <EffectComposer disableNormalPass>
                            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
                            <Noise opacity={0.02} />
                            <Vignette eskil={false} offset={0.1} darkness={1.1} />
                        </EffectComposer>

                        {/* Controls */}
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            autoRotate
                            autoRotateSpeed={0.5}
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 1.5}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Gender Selection UI - Moved to Top */}
            <div className="absolute top-4 z-10 flex gap-6 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl scale-90 opacity-80 hover:opacity-100 transition-all">
                <button
                    onClick={() => setGender('male')}
                    className={`relative px-6 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 overflow-hidden group ${gender === 'male'
                        ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/50 shadow-[0_0_30px_rgba(8,145,178,0.4)]'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <span className="relative z-10">TITAN</span>
                </button>
                <button
                    onClick={() => setGender('female')}
                    className={`relative px-6 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 overflow-hidden group ${gender === 'female'
                        ? 'bg-pink-900/50 text-pink-200 border border-pink-500/50 shadow-[0_0_30px_rgba(219,39,119,0.4)]'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <span className="relative z-10">VALKYRIE</span>
                </button>
            </div>
        </div>
    );
}
