
import React, { useState, useMemo, useEffect } from 'react';
import { Incident, DetectionType } from './types';
import DetectionFeed from './components/DetectionFeed';
import DashboardStats from './components/DashboardStats';
import PoliceAlert from './components/PoliceAlert';
import InvestigationView from './components/InvestigationView';
import { PYTHON_CORE_CODE } from './constants';

export type CameraType = 'standard' | 'night' | 'thermal';

interface Camera {
  id: string;
  name: string;
  type: CameraType;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'stats' | 'code' | 'investigation'>('feed');
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [criticalQueue, setCriticalQueue] = useState<Incident[]>([]);
  const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);
  const [threatLevel, setThreatLevel] = useState(34);

  // Generación de 48 cámaras en puntos estratégicos de Lima
  const cameras: Camera[] = useMemo(() => {
    const locations = [
      'Av. Salaverry', 'Av. Brasil', 'Res. San Felipe', 'Campo de Marte', 
      'Av. San Felipe', 'Jr. Huamachuco', 'Plaza San José', 'Av. Cuba',
      'Jr. Pachacutec', 'Av. Pershing', 'Parque Habich', 'Jr. Urteaga',
      'Metro Garzón', 'Av. Arequipa', 'C. Militar', 'Real Plaza',
      'Hosp. Rebagliati', 'Min. Salud', 'Canal 2', 'Parque Bomberos'
    ];
    return Array.from({ length: 48 }, (_, i) => ({
      id: `NODE-${(i + 1).toString().padStart(3, '0')}`,
      name: `${locations[i % locations.length]} - Sector ${Math.floor(i/4) + 1}`,
      type: i % 5 === 0 ? 'thermal' : i % 3 === 0 ? 'night' : 'standard'
    }));
  }, []);

  const handleNewIncident = (incident: Incident) => {
    setRecentIncidents(prev => [incident, ...prev].slice(0, 100));
    if (incident.type === DetectionType.WEAPON || incident.type === DetectionType.PREDICTED_CRIME) {
      setCriticalQueue(prev => [...prev, incident]);
    }
    if (incident.isPredictive) setThreatLevel(t => Math.min(100, t + 3));
  };

  const handleDismissAlert = () => {
    setCriticalQueue(prev => prev.slice(1));
    setThreatLevel(t => Math.max(15, t - 6));
  };

  const predictiveIncidents = recentIncidents.filter(i => i.isPredictive);

  return (
    <div className="h-screen bg-[#010409] text-slate-100 flex flex-col font-mono overflow-hidden">
      {/* C4 TOP BAR */}
      <header className="h-10 border-b border-cyan-900/40 flex items-center justify-between px-3 bg-[#0d1117] z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-cyan-600 flex items-center justify-center rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h1 className="text-[10px] font-black tracking-widest text-cyan-500 uppercase">LIMA_METRO_C4 // EAGLE_EYE_v4.0</h1>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex gap-4">
             <span className={`text-[9px] font-bold ${threatLevel > 70 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>THREAT_LVL: {threatLevel}%</span>
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">NODES: 48/48 ONLINE</span>
          </div>
        </div>

        <nav className="flex gap-1">
          {(['feed', 'investigation', 'stats', 'code'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-[9px] font-black uppercase transition-all border-b-2 ${
                activeTab === tab ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-transparent text-slate-600 hover:text-slate-400'
              }`}
            >
              {tab === 'feed' ? 'SURVEILLANCE_GRID' : 
               tab === 'investigation' ? 'INVESTIGATION_CORE' :
               tab === 'stats' ? 'TELEMETRY' : 'SYS_CORE'}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
           <div className="text-[8px] font-mono text-emerald-500 bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded-sm">SECURE_CHANNEL_ENCRYPTED</div>
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-0.5 gap-1">
        {activeTab === 'feed' && (
          <>
            {/* 48-CAMERA ULTRA DENSE GRID */}
            <div className="flex-1 overflow-hidden relative bg-black border border-slate-900/60 rounded-sm">
              {!fullscreenCam ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 overflow-y-auto h-full custom-scrollbar p-0.5">
                  {cameras.map(cam => (
                    <div 
                      key={cam.id} 
                      onDoubleClick={() => setFullscreenCam(cam.id)}
                      className="cursor-crosshair transition-transform duration-200 active:scale-95"
                    >
                      <DetectionFeed 
                        cameraId={cam.id} 
                        cameraName={cam.name} 
                        cameraType={cam.type}
                        onNewIncident={handleNewIncident} 
                        isCompact
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full w-full relative animate-fadeIn flex flex-col">
                  <div className="flex-1">
                    <DetectionFeed 
                      cameraId={fullscreenCam} 
                      cameraName={cameras.find(c => c.id === fullscreenCam)?.name || ''} 
                      cameraType={cameras.find(c => c.id === fullscreenCam)?.type || 'standard'}
                      onNewIncident={handleNewIncident} 
                    />
                  </div>
                  <button 
                    onClick={() => setFullscreenCam(null)}
                    className="absolute top-4 right-4 bg-red-600/30 hover:bg-red-600 text-white px-4 py-2 text-[10px] font-black border border-red-600/50 transition-all z-20 backdrop-blur-md uppercase tracking-widest shadow-xl"
                  >
                    CLOSE_TACTICAL_VIEW [ESC]
                  </button>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="w-80 shrink-0 flex flex-col gap-1">
               <div className="h-1/2 bg-[#0a0f1a] border border-cyan-950/40 rounded-sm overflow-hidden flex flex-col shadow-inner">
                 <div className="px-3 py-1.5 bg-red-950/20 border-b border-red-900/40 flex justify-between items-center">
                   <h2 className="text-[8px] font-black text-red-500 tracking-[0.3em] uppercase animate-pulse flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                     ATK_PREDICTION_ENGINE
                   </h2>
                   <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1 bg-[#05080f]">
                   {predictiveIncidents.map(inc => (
                     <div key={inc.id} className="p-2 bg-black/60 border border-red-900/20 rounded-sm hover:border-red-500/50 transition-all group animate-slideIn">
                       <div className="flex justify-between items-start mb-1">
                         <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter truncate w-32">{inc.type}</span>
                         <span className="text-[6px] text-slate-600 font-mono italic">SIG_{inc.id.substr(0,4).toUpperCase()}</span>
                       </div>
                       <p className="text-[8px] text-slate-300 font-bold leading-tight uppercase truncate">{inc.location}</p>
                       <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[5px] text-slate-500 block uppercase font-black">Probabilidad</span>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600" style={{ width: `${inc.confidence*100}%` }}></div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[5px] text-slate-500 block uppercase font-black">Proximidad QRU</span>
                            <span className="text-[8px] text-cyan-400 font-bold block">{Math.floor(Math.random()*600 + 100)}m</span>
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="flex-1 bg-[#0a0f1a] border border-slate-900/60 flex flex-col shadow-inner">
                 <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center">
                   <h2 className="text-[8px] font-black text-slate-500 tracking-[0.3em] uppercase">GLOBAL_TELEMETRY</h2>
                   <span className="text-[7px] text-emerald-500/60 font-mono">v4.0.2-STABLE</span>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#05080f]">
                   {recentIncidents.map(inc => (
                     <div key={inc.id} className={`px-3 py-2 border-b border-slate-900/40 hover:bg-cyan-950/10 flex gap-2 items-center transition-colors ${inc.type === DetectionType.WEAPON ? 'bg-red-900/10' : ''}`}>
                       <div className="w-1 h-5 bg-slate-800 shrink-0">
                         <div className={`h-full w-full ${inc.type === DetectionType.WEAPON ? 'bg-red-600' : 'bg-cyan-600'}`}></div>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-200 uppercase truncate">{inc.type}</span>
                            <span className="text-[6px] text-slate-600 font-mono">{inc.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                         </div>
                         <p className="text-[7px] text-slate-500 font-bold truncate uppercase">{inc.location}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </>
        )}
        
        {activeTab === 'investigation' && <InvestigationView />}
        {activeTab === 'stats' && <div className="flex-1 p-4 overflow-y-auto bg-[#010409]"><DashboardStats /></div>}
        {activeTab === 'code' && (
          <div className="flex-1 p-6 bg-[#010409] overflow-y-auto custom-scrollbar border border-cyan-900/20 m-1 rounded-sm">
            <pre className="text-[11px] font-mono text-cyan-400/80 leading-relaxed"><code>{PYTHON_CORE_CODE}</code></pre>
          </div>
        )}
      </main>

      {criticalQueue.length > 0 && (
        <PoliceAlert 
          incident={criticalQueue[0]} 
          totalInQueue={criticalQueue.length}
          onDismiss={handleDismissAlert} 
        />
      )}

      {/* FOOTER BAR */}
      <footer className="h-6 bg-[#0a0f1a] border-t border-slate-900/60 flex items-center justify-between px-3 text-[7px] text-slate-500 font-bold uppercase tracking-[0.3em] shrink-0">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">LATENCY: 14ms <div className="w-1 h-1 bg-emerald-500 rounded-full"></div></span>
          <span className="text-cyan-500/60">G_ANALYTICS: PROCESSING_LAYER_09</span>
          <span className="text-slate-700">COORD: 12.0464° S, 77.0428° W</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-slate-600 font-black">EAGLE-EYE METROPOLITAN DEFENSE SYSTEM</span>
           <span className="text-slate-400">UNI 2024 - LIMA</span>
        </div>
      </footer>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a2c3a; }
      `}</style>
    </div>
  );
};

export default App;
