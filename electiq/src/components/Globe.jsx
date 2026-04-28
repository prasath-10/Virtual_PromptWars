import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { geoCentroid } from 'd3-geo';

function Earth({ onCountrySelect, selectedCountryId, geoData }) {
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
      
      {geoData.map((country) => (
        <Hotspot 
          key={country.id} 
          country={country} 
          isSelected={selectedCountryId === country.name}
          onClick={() => onCountrySelect(country.name)}
        />
      ))}
    </group>
  );
}

function Hotspot({ country, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const [lon, lat] = country.centroid;
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  const radius = 2.02;
  
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  useFrame(() => {
    if (meshRef.current) {
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
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : '#378ADD'} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#378ADD" transparent opacity={0.4} />
      </mesh>

      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-[#0a1628]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none transform -translate-y-full mb-2 shadow-xl flex items-center gap-2">
            <span className="text-white font-medium text-sm">🏳️ {country.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function GlobeSection({ selectedCountryId, onCountrySelect }) {
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(topoData => {
        const geojson = feature(topoData, topoData.objects.countries);
        const countriesData = geojson.features
          .filter(f => f.properties.name !== "Antarctica")
          .map((f, index) => {
            const centroid = geoCentroid(f);
            return {
              id: f.id || index,
              name: f.properties.name,
              centroid
            };
          });
        setGeoData(countriesData);
      });
  }, []);

  return (
    <div className="w-full h-[420px] bg-[#0a1628] relative flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Earth selectedCountryId={selectedCountryId} onCountrySelect={onCountrySelect} geoData={geoData} />
        </Canvas>
      </div>
      <div className="relative z-10 pb-6 pointer-events-none text-center">
        <p className="text-white/60 text-sm tracking-wide">Click a glowing dot to explore that country's election</p>
      </div>
    </div>
  );
}
