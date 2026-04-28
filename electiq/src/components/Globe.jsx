import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { countries } from '../data/countries';

function Earth({ onCountrySelect, selectedCountry }) {
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={earthRef}>
      <Sphere args={[2, 64, 64]}>
        <meshBasicMaterial color="#0c1d36" wireframe={true} transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[1.98, 64, 64]}>
        <meshBasicMaterial color="#08101f" />
      </Sphere>
      
      {countries.map((country) => (
        <Hotspot 
          key={country.id} 
          country={country} 
          isSelected={selectedCountry?.id === country.id}
          onClick={() => onCountrySelect(country.id)}
        />
      ))}
    </group>
  );
}

function Hotspot({ country, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Convert lat/lon to 3D Cartesian coordinates
  const latRad = country.globeCoords.lat * (Math.PI / 180);
  const lonRad = -country.globeCoords.lon * (Math.PI / 180); // Negative because of Three.js coord system
  const radius = 2.02; // Slightly above earth surface
  
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  useFrame(() => {
    if (meshRef.current) {
      // Pulse animation using sin(Date.now())
      const scale = 1 + Math.sin(Date.now() / 200) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : country.accentColor} />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={country.accentColor} transparent opacity={0.4} />
      </mesh>

      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-[#0a1628]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none transform -translate-y-full mb-2 shadow-xl flex items-center gap-2">
            <span className="text-lg">{country.flag}</span>
            <span className="text-white font-medium text-sm">{country.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function GlobeSection({ selectedCountry, onCountrySelect }) {
  return (
    <div className="w-full h-[420px] bg-[#0a1628] relative flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Earth selectedCountry={selectedCountry} onCountrySelect={onCountrySelect} />
        </Canvas>
      </div>
      <div className="relative z-10 pb-6 pointer-events-none text-center">
        <p className="text-white/60 text-sm tracking-wide">Click a glowing dot to explore that country's election</p>
      </div>
    </div>
  );
}
