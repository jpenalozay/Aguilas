
import React, { useState, useMemo, useEffect } from 'react';
import { HistoricalDetection } from '../types';

const InvestigationView: React.FC = () => {
  const [searchPlate, setSearchPlate] = useState('BKA-902');
  const [period, setPeriod] = useState('30d');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<HistoricalDetection[]>([]);
  const [activeResIndex, setActiveResIndex] = useState<number | null>(null);
  const [selectedResIndex, setSelectedResIndex] = useState<number | null>(null);

  // Simulación de base de datos histórica con ruta lógica por Jesús María / Lima
  const generateRealisticHistory = (plate: string) => {
    const path = [
      { name: 'Av. Brasil / Jr. Huamachuco', lat: -12.0723, lng: -77.0512, timeOffset: 0 },
      { name: 'Plaza San José', lat: -12.0715, lng: -77.0438, timeOffset: 12 },
      { name: 'Campo de Marte (Puerta 4)', lat: -12.0689, lng: -77.0421, timeOffset: 25 },
      { name: 'Av. Cuba / Jr. Pachacutec', lat: -12.0782, lng: -77.0445, timeOffset: 38 },
      { name: 'Av. Salaverry / San Felipe', lat: -12.0845, lng: -77.0482, timeOffset: 55 },
      { name: 'Residencial San Felipe - Torre A', lat: -12.0861, lng: -77.0504, timeOffset: 72 },
      { name: 'Metro Garzón', lat: -12.0750, lng: -77.0490, timeOffset: 90 },
      { name: 'Av. Arequipa / Cdra 15', lat: -12.0810, lng: -77.0350, timeOffset: 110 }
    ];

    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 3);

    return path.map((point, i) => {
      const time = new Date(baseTime.getTime() + (point.timeOffset * 60000));
      return {
        id: `DET-${plate}-${i}`,
        plate: plate.toUpperCase(),
        timestamp: time,
        nodeId: `NODE-${Math.floor(Math.random() * 48).toString().padStart(3, '0')}`,
        location: point.name,
        coordinates: { lat: point.lat, lng: point.lng },
        speed: Math.floor(Math.random() * 30 + 20)
      };
    }).reverse(); 
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate) return;
    
    setIsSearching(true);
    setResults([]);
    setSelectedResIndex(null);
    
    setTimeout(() => {
      setResults(generateRealisticHistory(searchPlate));
      setIsSearching(false);
    }, 1500);
  };

  // Configuración de proyección del mapa (Enfoque Jesús María)
  const mapConfig = {
    minLat: -12.09,
    maxLat: -12.06,
    minLng: -77.06,
    maxLng: -77.03
  };

  const project = (lat: number, lng: number, containerWidth: number, containerHeight: number) => {
    const x = ((lng - mapConfig.minLng) / (mapConfig.maxLng - mapConfig.minLng)) * containerWidth;
    const y = ((mapConfig.maxLat - lat) / (mapConfig.maxLat - mapConfig.minLat)) * containerHeight;
    return { x, y };
  };

  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const mapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setContainerSize({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Definición de vías principales de Jesús María para el mapa base
  const mainAvenues = [
    // Av. Brasil
    [{ lat: -12.06, lng: -77.0500 }, { lat: -12.09, lng: -77.0520 }],
    // Av. Salaverry
    [{ lat: -12.06, lng: -77.0410 }, { lat: -12.09, lng: -77.0520 }],
    // Av. San Felipe
    [{ lat: -12.0845, lng: -77.06 }, { lat: -12.0845, lng: -77.03 }],
    // Av. Cuba
    [{ lat: -12.0782, lng: -77.06 }, { lat: -12.0782, lng: -77.03 }],
    // Av. Arequipa (Borde Este)
    [{ lat: -12.06, lng: -77.0350 }, { lat: -12.09, lng: -77.0380 }]
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#010409] overflow-hidden">
      {/* SEARCH HEADER - FULL WIDTH */}
      <div className="bg-[#0d1117] border-b border-cyan-900/30 p-4 shrink-0 shadow-lg z-30">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Placa del Vehículo</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="EJ: BKA-902"
                className="bg-black border border-slate-800 text-cyan-400 px-4 py-2.5 text-sm font-mono focus:border-cyan-500 outline-none w-56 uppercase tracking-widest rounded-sm"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filtro Temporal</label>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-black border border-slate-800 text-slate-300 px-4 py-2.5 text-sm font-mono focus:border-cyan-500 outline-none w-52 rounded-sm appearance-none cursor-pointer"
            >
              <option value="24h">ÚLTIMAS 24 HORAS</option>
              <option value="7d">ÚLTIMOS 7 DÍAS</option>
              <option value="30d">ÚLTIMOS 30 DÍAS</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isSearching}
            className="bg-[#06b6d4] hover:bg-cyan-400 text-black font-black px-10 py-3 text-[11px] uppercase tracking-[0.2em] transition-all rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            {isSearching ? 'PROCESANDO...' : 'EJECUTAR BÚSQUEDA FORENSE'}
          </button>
        </form>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* MAP AREA */}
        <div className="flex-1 relative bg-[#010409] flex flex-col border-r border-slate-900">
          <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
             <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">MAPA_DE_RECORRIDOS_V4.1</h3>
             {results.length > 0 && <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 border border-cyan-500/20 rounded-full animate-pulse">RECONSTRUCCIÓN ACTIVA</span>}
          </div>

          <div ref={mapRef} className="flex-1 relative overflow-hidden bg-[#020617]">
             {/* MAP BASE LAYER (Tactical Streets) */}
             <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                {mainAvenues.map((ave, i) => {
                  const p1 = project(ave[0].lat, ave[0].lng, containerSize.width, containerSize.height);
                  const p2 = project(ave[1].lat, ave[1].lng, containerSize.width, containerSize.height);
                  return (
                    <line key={`ave-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1e293b" strokeWidth="4" />
                  );
                })}
                {/* Labels de Calles (Conceptual) */}
                <text x={project(-12.075, -77.051, containerSize.width, containerSize.height).x} y={project(-12.075, -77.051, containerSize.width, containerSize.height).y} fill="#1e293b" fontSize="10" fontWeight="bold" transform="rotate(-70)">AV. BRASIL</text>
                <text x={project(-12.075, -77.042, containerSize.width, containerSize.height).x} y={project(-12.075, -77.042, containerSize.width, containerSize.height).y} fill="#1e293b" fontSize="10" fontWeight="bold" transform="rotate(-60)">AV. SALAVERRY</text>
             </svg>

             {/* GRID BACKGROUND */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
             
             {results.length > 0 ? (
               <div className="w-full h-full animate-fadeIn relative">
                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                      </marker>
                      <filter id="glow-path">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    {results.slice().reverse().map((res, i, arr) => {
                      if (i === arr.length - 1) return null;
                      const next = arr[i+1];
                      const p1 = project(res.coordinates.lat, res.coordinates.lng, containerSize.width, containerSize.height);
                      const p2 = project(next.coordinates.lat, next.coordinates.lng, containerSize.width, containerSize.height);
                      return (
                        <g key={`line-${i}`}>
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#06b6d4" strokeWidth="2" strokeDasharray="15,5" className="opacity-30" filter="url(#glow-path)" />
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arrow)" />
                        </g>
                      );
                    })}
                 </svg>

                 {results.map((res, idx) => {
                    const p = project(res.coordinates.lat, res.coordinates.lng, containerSize.width, containerSize.height);
                    const isActive = activeResIndex === idx || selectedResIndex === idx;
                    return (
                      <div 
                        key={res.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20`}
                        style={{ left: `${p.x}px`, top: `${p.y}px` }}
                        onMouseEnter={() => setActiveResIndex(idx)}
                        onMouseLeave={() => setActiveResIndex(null)}
                        onClick={() => setSelectedResIndex(selectedResIndex === idx ? null : idx)}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-all ${isActive ? 'bg-white scale-125 z-50' : 'bg-cyan-500 hover:scale-110 shadow-[0_0_15px_rgba(6,182,212,0.6)]'}`}>
                          <span className="text-[8px] font-black text-black">{results.length - idx}</span>
                        </div>

                        {/* INFO BOX ON CLICK/HOVER */}
                        {(isActive) && (
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/95 border border-cyan-500 p-3 rounded-sm min-w-[220px] shadow-2xl backdrop-blur-xl z-[60] animate-slideUp">
                             <div className="flex justify-between items-center mb-2 border-b border-cyan-900 pb-1.5">
                               <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">AVISTAMIENTO DETALLADO</span>
                               <span className="text-[7px] text-slate-500 font-mono">{res.nodeId}</span>
                             </div>
                             <p className="text-[11px] font-bold text-white uppercase mb-2 leading-tight">{res.location}</p>
                             <div className="grid grid-cols-2 gap-4 text-[7px] font-mono">
                               <div>
                                 <p className="text-slate-500 uppercase font-black mb-1 tracking-tighter">TIMESTAMP</p>
                                 <p className="text-cyan-200">{res.timestamp.toLocaleDateString()}<br/>{res.timestamp.toLocaleTimeString()}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-slate-500 uppercase font-black mb-1 tracking-tighter">TELEMETRÍA_VEL</p>
                                 <p className="text-emerald-400 font-black">{res.speed} KM/H</p>
                               </div>
                             </div>
                             <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                               <p className="text-[6px] text-slate-600 uppercase">GPS: {res.coordinates.lat.toFixed(6)}, {res.coordinates.lng.toFixed(6)}</p>
                               <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                             </div>
                          </div>
                        )}
                      </div>
                    );
                 })}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                 <div className="w-20 h-20 border border-slate-800 rounded-full flex items-center justify-center animate-pulse mb-6 relative">
                    <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-ping"></div>
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6.418a2 2 0 011.106-1.789L9 2m0 18l6-3m-6 3V2m6 15l4.553 2.276A2 2 0 0021 17.382V8.418a2 2 0 00-1.106-1.789L15 4m0 13V4m0 0L9 2" /></svg>
                 </div>
                 <p className="text-xs font-black tracking-[0.5em] uppercase text-slate-600">Reconstrucción Forense Standby</p>
               </div>
             )}
          </div>

          {/* BOTTOM SUMMARY BAR */}
          {results.length > 0 && (
            <div className="h-24 border-t border-slate-900 bg-black/80 backdrop-blur-md p-6 flex items-center justify-between z-20">
              <div className="flex gap-12">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Nodos Detectados</span>
                   <span className="text-2xl font-black text-cyan-400 leading-none">{results.length}</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-slate-800 pl-12">
                   <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Velocidad Promedio</span>
                   <span className="text-2xl font-black text-emerald-500 leading-none">32 <span className="text-[10px] text-emerald-600">KM/H</span></span>
                </div>
                <div className="flex flex-col gap-1 border-l border-slate-800 pl-12">
                   <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Estado Administrativo</span>
                   <div className="flex items-center gap-2 mt-1 bg-emerald-950/20 px-3 py-1 border border-emerald-900/30 rounded-sm">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">SIN REPORTES DE ROBO</span>
                   </div>
                </div>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-8 py-3.5 rounded-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95">Exportar Evidencia PDF</button>
            </div>
          )}
        </div>

        {/* TIMELINE SIDEBAR */}
        <div className="w-[500px] bg-[#0a0f1a] flex flex-col shrink-0 shadow-2xl z-10">
          <div className="p-4 border-b border-slate-900 bg-black/60 flex justify-between items-center backdrop-blur-md">
             <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase">CRONOLOGÍA_DETALLADA</h3>
             <span className="text-[8px] text-slate-700 font-bold bg-slate-900 px-2 py-0.5 border border-slate-800">ORDEN: DESCENDENTE</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-[#05080f]">
            {results.length > 0 ? (
              results.map((res, i) => (
                <div 
                  key={res.id} 
                  className={`relative pl-8 pb-3 border-l-2 transition-all duration-300 ${selectedResIndex === i ? 'border-cyan-500' : 'border-slate-800'} group cursor-pointer`}
                  onClick={() => setSelectedResIndex(selectedResIndex === i ? null : i)}
                  onMouseEnter={() => setActiveResIndex(i)}
                  onMouseLeave={() => setActiveResIndex(null)}
                >
                  <div className={`absolute -left-[10px] top-0 w-4.5 h-4.5 rounded-full border-4 border-[#0a0f1a] transition-colors ${selectedResIndex === i ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                  <div className={`p-4 border rounded-sm transition-all duration-300 ${selectedResIndex === i ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'bg-black/40 border-slate-900 hover:border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-3">
                       <h4 className={`text-sm font-black uppercase tracking-tight leading-tight transition-colors ${selectedResIndex === i ? 'text-cyan-400' : 'text-slate-200'}`}>{res.location}</h4>
                       <span className={`text-[8px] font-mono px-1.5 rounded-sm border ${selectedResIndex === i ? 'text-cyan-600 border-cyan-900' : 'text-slate-700 border-slate-900'}`}>{res.nodeId}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-5 text-slate-500 font-mono text-[10px]">
                       <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {res.timestamp.toLocaleDateString()}</span>
                       <span className="text-slate-800">|</span>
                       <span className="text-cyan-600 font-bold flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {res.timestamp.toLocaleTimeString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-3 border-t border-slate-900/50">
                       <div className="space-y-1.5">
                         <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Coordenadas GPS</span>
                         <p className="text-[9px] text-slate-400 font-mono leading-none">{res.coordinates.lat.toFixed(6)}, {res.coordinates.lng.toFixed(6)}</p>
                       </div>
                       <div className="text-right space-y-1.5">
                         <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Velocidad Nodo</span>
                         <p className="text-xs text-emerald-500 font-black leading-none">{res.speed} KM/H</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center mb-4">
                  <div className="w-2 h-2 bg-slate-800 rounded-full animate-ping"></div>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.4em] italic text-center leading-loose">Sistema Forense<br/>en Espera de Input</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-black/80 border-t border-slate-900 flex justify-between items-center backdrop-blur-md">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ENLACE DB_LIMA ESTABLE</span>
             </div>
             <span className="text-[8px] text-slate-600 font-mono tracking-widest">MOD: FORENSIC_X_RAY</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 15px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default InvestigationView;
