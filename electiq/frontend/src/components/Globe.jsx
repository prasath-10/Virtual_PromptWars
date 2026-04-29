import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { geoCentroid } from 'd3-geo';

const FALLBACK_HOTSPOTS = [
  { country: 'India', electionType: 'General Election', daysUntil: 15 },
  { country: 'United States', electionType: 'Presidential Election', daysUntil: 190 },
  { country: 'United Kingdom', electionType: 'General Election', daysUntil: 65 },
  { country: 'Brazil', electionType: 'Municipal Election', daysUntil: 8 },
  { country: 'France', electionType: 'Legislative Election', daysUntil: 42 }
];

function Earth({ onCountrySelect, selectedCountryId, geoData, activeElections }) {
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  // Match active elections with geo coordinates
  const hotspots = activeElections.map(election => {
    const geo = geoData.find(g => g.name.toLowerCase() === election.country.toLowerCase());
    if (!geo) return null;
    return { ...election, centroid: geo.centroid };
  }).filter(h => h !== null);

  return (
    <group ref={earthRef}>
      <Sphere args={[2, 64, 64]}>
        <meshBasicMaterial color="#0c1d36" wireframe={true} transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[1.98, 64, 64]}>
        <meshBasicMaterial color="#08101f" />
      </Sphere>
      
      {hotspots.map((h, idx) => (
        <Hotspot 
          key={`${h.country}-${idx}`} 
          data={h} 
          isSelected={selectedCountryId === h.country}
          onClick={() => onCountrySelect(h.country)}
        />
      ))}
    </group>
  );
}

function Hotspot({ data, isSelected, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const [lon, lat] = data.centroid;
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  const radius = 2.02;
  
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  // Dynamic pulse and color logic
  const days = data.daysUntil;
  let color = '#378ADD'; // Blue (60+ days)
  let period = 400; // Slow pulse

  if (days <= 7) {
    color = '#E24B4A'; // Red (Urgent)
    period = 100; // Fast pulse
  } else if (days <= 30) {
    color = '#F5A623'; // Amber (Upcoming)
    period = 200; // Medium pulse
  } else if (days <= 60) {
    color = '#378ADD'; // Blue
    period = 300;
  }

  useFrame(() => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(Date.now() / period) * 0.2;
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
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {(hovered || isSelected) && (
        <Html distanceFactor={10} position={[0, 0.2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-[#0a1628]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none transform -translate-y-full mb-2 shadow-2xl flex flex-col items-start gap-0.5">
            <span className="text-white font-bold text-xs uppercase tracking-wider">{data.country}</span>
            <span className="text-white/80 text-[10px]">{data.electionType}</span>
            <span className={`text-[10px] font-medium ${days <= 7 ? 'text-red-400' : 'text-amber-400'}`}>
              {days <= 0 ? 'Election Today!' : `${days} days until`}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function GlobeSection({ selectedCountryId, onCountrySelect }) {
  const [geoData, setGeoData] = useState([]);
  const [activeElections, setActiveElections] = useState([]);

  useEffect(() => {
    // Fetch world atlas data
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(topoData => {
        const geojson = feature(topoData, topoData.objects.countries);
        const countriesData = geojson.features
          .filter(f => f.properties.name !== "Antarctica")
          .map((f, index) => ({
            id: f.id || index,
            name: f.properties.name,
            centroid: geoCentroid(f)
          }));
        setGeoData(countriesData);
      });

    // Fetch active elections from backend
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/elections/active`)
      .then(res => res.json())
      .then(data => setActiveElections(data.elections || []))
      .catch(() => setActiveElections(FALLBACK_HOTSPOTS));
  }, []);

  return (
    <div className="w-full h-[450px] bg-[#0a1628] relative flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <Earth 
            selectedCountryId={selectedCountryId} 
            onCountrySelect={onCountrySelect} 
            geoData={geoData} 
            activeElections={activeElections}
          />
        </Canvas>
      </div>
      <div className="relative z-10 pb-6 pointer-events-none text-center px-4">
        <h3 className="text-white/90 text-sm font-semibold mb-1">Live Global Election Watch</h3>
        <p className="text-white/50 text-[11px] tracking-wide">Pulsing dots indicate upcoming elections. Pulse speed reflects urgency.</p>
      </div>
    </div>
  );
}
