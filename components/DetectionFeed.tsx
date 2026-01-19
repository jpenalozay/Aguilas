
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DetectionType, Incident } from '../types';
import { CameraType } from '../App';

interface DetectionFeedProps {
  cameraId: string;
  cameraName: string;
  cameraType: CameraType;
  onNewIncident: (incident: Incident) => void;
  isCompact?: boolean;
}

const LIMA_STREETS = [
  'https://images.unsplash.com/photo-1545147986-a9d6f210df77',
  'https://images.unsplash.com/photo-1519331379826-f10be5486c6f',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
  'https://images.unsplash.com/photo-1575517111478-7f6afd0973db',
  'https://images.unsplash.com/photo-1566438480900-0609be27a4be'
];

const DetectionFeed: React.FC<DetectionFeedProps> = ({ cameraId, cameraName, cameraType, onNewIncident, isCompact = false }) => {
  const [activeDetections, setActiveDetections] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState({ 
    fps: 0, 
    bitrate: 0, 
    anomaly: 12,
    lastPlate: '---',
    lastObject: 'SCANNING',
    threatLvl: 'LOW'
  });

  // Generación de telemetría dinámica
  useEffect(() => {
    const t = setInterval(() => {
      const anomalyVal = Math.floor(Math.random() * 100);
      const plates = ['BKA-902', 'LMA-118', 'P0X-442', 'Z9I-001', 'AXE-772'];
      const objects = ['AUTO', 'MOTO', 'BUS', 'PERSON', 'TRUCK'];
      
      setTelemetry(prev => ({
        fps: Math.floor(22 + Math.random() * 8),
        bitrate: Math.floor(1100 + Math.random() * 600),
        anomaly: anomalyVal,
        lastPlate: anomalyVal > 70 ? plates[Math.floor(Math.random() * plates.length)] : prev.lastPlate,
        lastObject: anomalyVal > 30 ? objects[Math.floor(Math.random() * objects.length)] : prev.lastObject,
        threatLvl: anomalyVal > 85 ? 'CRITICAL' : anomalyVal > 60 ? 'MED' : 'LOW'
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const triggerDetection = useCallback(() => {
    const types = Object.values(DetectionType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const isPredictive = Math.random() > 0.88;
    const finalType = isPredictive ? DetectionType.PREDICTED_CRIME : randomType;

    const newIncident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      location: cameraName,
      type: finalType,
      confidence: 0.82 + Math.random() * 0.17,
      status: 'detectado',
      isPredictive: finalType === DetectionType.SUSPICIOUS_BEHAVIOR || finalType === DetectionType.PREDICTED_CRIME
    };

    if (newIncident.confidence > 0.95 || newIncident.type === DetectionType.WEAPON || newIncident.type === DetectionType.PREDICTED_CRIME) {
      onNewIncident(newIncident);
    }

    const marker = {
      id: newIncident.id,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      type: finalType,
      conf: newIncident.confidence
    };

    setActiveDetections(prev => [...prev, marker].slice(-1));
    setTimeout(() => {
      setActiveDetections(prev => prev.filter(m => m.id !== marker.id));
    }, isCompact ? 1500 : 3000);
  }, [cameraName, onNewIncident, isCompact]);

  useEffect(() => {
    const interval = setInterval(triggerDetection, isCompact ? 8000 + Math.random() * 12000 : 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, [triggerDetection, isCompact]);

  const getColorClass = (type: DetectionType) => {
    switch (type) {
      case DetectionType.WEAPON: return 'border-red-600 bg-red-600/20 text-red-500';
      case DetectionType.PREDICTED_CRIME: return 'border-orange-500 bg-orange-500/20 text-orange-400';
      default: return 'border-cyan-500 bg-cyan-500/10 text-cyan-400';
    }
  };

  const getFilter = () => {
    if (cameraType === 'night') return 'sepia(100%) hue-rotate(90deg) brightness(0.7) contrast(1.4)';
    if (cameraType === 'thermal') return 'grayscale(1) invert(1) brightness(1.1) contrast(3)';
    return 'grayscale(0.3) brightness(0.9)';
  };

  const imageUrl = useMemo(() => {
    const idx = parseInt(cameraId.split('-')[1] || '0') % LIMA_STREETS.length;
    return `${LIMA_STREETS[idx]}?q=80&w=600&auto=format&fit=crop`;
  }, [cameraId]);

  return (
    <div className={`flex flex-col bg-black border border-slate-900 group transition-all duration-300 ${!isCompact ? 'ring-1 ring-cyan-900/30 shadow-2xl' : 'hover:border-cyan-500/40'}`}>
      {/* AREA DE VIDEO */}
      <div className="relative aspect-video overflow-hidden">
        <img src={imageUrl} style={{ filter: getFilter() }} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
        
        {/* HUD SUPERPUESTO (VIDEO) */}
        <div className="absolute inset-0 pointer-events-none p-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-black/80 px-1 py-0.5 rounded-sm flex items-center gap-1 border border-white/5">
              <div className={`w-1 h-1 rounded-full ${telemetry.anomaly > 80 ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
              <span className="text-[6px] font-black text-white tracking-widest">{cameraId}</span>
            </div>
            {!isCompact && (
               <div className="text-[5px] text-cyan-400/80 font-mono bg-black/60 px-1 border border-cyan-900/20">
                 {cameraType.toUpperCase()} // LVL_0{Math.floor(Math.random()*9)}
               </div>
            )}
          </div>
          
          {/* DETECCIONES VISUALES */}
          {activeDetections.map(det => (
            <div key={det.id} style={{ left: `${det.x}%`, top: `${det.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2">
              <div className={`border p-0.5 ${getColorClass(det.type)} scale-[0.7]`}>
                <div className="absolute -top-3 left-0 bg-inherit px-0.5 text-[5px] font-black whitespace-nowrap">
                  {det.type}
                </div>
                <div className="w-12 h-8 border border-white/5"></div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-end">
             <div className="text-[5px] font-mono text-slate-500 bg-black/40 px-0.5">
               {telemetry.fps} FPS // {telemetry.bitrate} KBPS
             </div>
             <div className="text-[6px] text-red-500 font-black animate-pulse bg-black/60 px-1">
               {telemetry.anomaly > 90 ? '!! HIGH ANOMALY !!' : ''}
             </div>
          </div>
        </div>
        
        {/* EFECTO DE SCANLINE */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]"></div>
      </div>

      {/* PANEL DE TELEMETRÍA INFERIOR (DATOS) */}
      <div className="bg-[#05080f] p-1 border-t border-slate-800 flex flex-col gap-0.5 group-hover:bg-[#0a0f1a] transition-colors">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex flex-col">
            <span className="text-[5px] text-slate-500 font-bold uppercase tracking-tighter">Última Placa:</span>
            <span className={`text-[7px] font-mono font-black ${telemetry.anomaly > 70 ? 'text-cyan-400' : 'text-slate-400'}`}>
              {telemetry.lastPlate}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[5px] text-slate-500 font-bold uppercase tracking-tighter">Objeto IA:</span>
            <span className="text-[7px] font-black text-emerald-500 truncate">
              {telemetry.lastObject}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-0.5 pt-0.5 border-t border-slate-900">
          <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-1000 ${telemetry.anomaly > 75 ? 'bg-red-600' : telemetry.anomaly > 40 ? 'bg-orange-500' : 'bg-cyan-600'}`}
               style={{ width: `${telemetry.anomaly}%` }}
             ></div>
          </div>
          <span className={`text-[6px] font-mono font-bold ${telemetry.threatLvl === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
            RISK: {telemetry.anomaly}%
          </span>
        </div>

        {!isCompact && (
          <div className="mt-1 flex justify-between items-center text-[5px] font-mono text-slate-600 italic">
             <span>LIMA_UNIT: {Math.floor(Math.random()*500)}m</span>
             <span className="uppercase text-cyan-900 font-black tracking-widest">Tracking Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionFeed;
