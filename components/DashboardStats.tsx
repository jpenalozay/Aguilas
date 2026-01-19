
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, AreaChart, Area, PieChart, Pie, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ScatterChart, Scatter, ZAxis,
  ComposedChart, Legend
} from 'recharts';

// --- DATASETS COMBINADOS ---

const trafficData = [
  { name: '00:00', total: 12, motos: 4 },
  { name: '04:00', total: 8, motos: 2 },
  { name: '08:00', total: 145, motos: 60 },
  { name: '12:00', total: 188, motos: 95 },
  { name: '16:00', total: 212, motos: 110 },
  { name: '20:00', total: 94, motos: 45 },
];

const sectorEfficiency = [
  { subject: 'Sector 1', A: 120, B: 110, fullMark: 150 },
  { subject: 'Sector 2', A: 98, B: 130, fullMark: 150 },
  { subject: 'Sector 3', A: 86, B: 130, fullMark: 150 },
  { subject: 'Sector 4', A: 99, B: 100, fullMark: 150 },
  { subject: 'Sector 5', A: 85, B: 90, fullMark: 150 },
];

const sensorDistribution = [
  { name: 'Estándar', value: 32, fill: '#06b6d4' },
  { name: 'Nocturna', value: 10, fill: '#8b5cf6' },
  { name: 'Térmica', value: 6, fill: '#ec4899' },
];

const threatTrends = [
  { day: 'Lun', armas: 0, prediccion: 2 },
  { day: 'Mar', armas: 1, prediccion: 1 },
  { day: 'Mie', armas: 0, prediccion: 4 },
  { day: 'Jue', armas: 2, prediccion: 3 },
  { day: 'Vie', armas: 3, prediccion: 8 },
  { day: 'Sab', armas: 4, prediccion: 12 },
  { day: 'Dom', armas: 2, prediccion: 5 },
];

const spatialIncidents = [
  { x: 10, y: 30, z: 200, type: 'Arma' },
  { x: 45, y: 50, z: 400, type: 'Robo' },
  { x: 30, y: 10, z: 150, type: 'Moto' },
  { x: 70, y: 80, z: 500, type: 'Arma' },
  { x: 85, y: 25, z: 250, type: 'Robo' },
  { x: 50, y: 65, z: 300, type: 'Moto' },
  { x: 20, y: 90, z: 100, type: 'Arma' },
];

const infrastructureLoad = [
  { time: '00:00', gpu: 45, npu: 30, latency: 12 },
  { time: '04:00', gpu: 32, npu: 25, latency: 10 },
  { time: '08:00', gpu: 78, npu: 65, latency: 45 },
  { time: '12:00', gpu: 88, npu: 82, latency: 58 },
  { time: '16:00', gpu: 92, npu: 85, latency: 62 },
  { time: '20:00', gpu: 70, npu: 60, latency: 30 },
];

const operationalEfficiency = [
  { sector: 'Sector 1', ia_precision: 98, response_time: 120, human_verify: 95 },
  { sector: 'Sector 2', ia_precision: 85, response_time: 240, human_verify: 80 },
  { sector: 'Sector 3', ia_precision: 92, response_time: 150, human_verify: 88 },
  { sector: 'Sector 4', ia_precision: 78, response_time: 300, human_verify: 75 },
  { sector: 'Sector 5', ia_precision: 95, response_time: 110, human_verify: 92 },
];

const nodeIntegrity = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  status: Math.random() > 0.05 ? 'online' : 'failure',
  temp: Math.floor(40 + Math.random() * 35),
  load: Math.floor(Math.random() * 100)
}));

const nodeRanking = [
  { id: 'NODE-001', loc: 'Av. Brasil / Huamachuco', score: 452, trend: 'up' },
  { id: 'NODE-012', loc: 'Metro Garzón', score: 389, trend: 'up' },
  { id: 'NODE-024', loc: 'Real Plaza Salaverry', score: 341, trend: 'down' },
  { id: 'NODE-008', loc: 'Plaza San José', score: 298, trend: 'up' },
  { id: 'NODE-042', loc: 'Parque Bomberos', score: 112, trend: 'down' },
];

const DashboardStats: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-24 animate-fadeIn">
      
      {/* 1. KPI HEADER (Expanded to 8 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'MTTR', value: '2.4m', color: 'text-emerald-400' },
          { label: 'OCR Acc.', value: '98.4%', color: 'text-cyan-400' },
          { label: 'IA Alertas', value: '24', color: 'text-red-500' },
          { label: 'Uptime', value: '99.9%', color: 'text-slate-400' },
          { label: 'GPU Load', value: '74%', color: 'text-purple-400' },
          { label: 'Drift', value: '0.02', color: 'text-amber-400' },
          { label: 'Nodes', value: '48/48', color: 'text-blue-400' },
          { label: 'Latency', value: '42ms', color: 'text-emerald-500' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-sm">
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
            <p className={`text-lg font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* --- SECTION: INFRASTRUCTURE --- */}
        
        {/* Matriz de Integridad */}
        <div className="col-span-12 lg:col-span-4 glass p-5 rounded-sm flex flex-col h-[380px]">
          <h3 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">Integrity Matrix (Edge Nodes)</h3>
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {nodeIntegrity.map(node => (
              <div 
                key={node.id} 
                className={`aspect-square rounded-[1px] relative group cursor-help transition-all ${
                  node.status === 'failure' ? 'bg-red-600 animate-pulse' : 
                  node.temp > 70 ? 'bg-amber-500' : 'bg-slate-800 hover:bg-cyan-600'
                }`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-black border border-slate-700 p-2 min-w-[80px] pointer-events-none">
                  <p className="text-[7px] font-black text-cyan-400">NODE-{node.id.toString().padStart(3,'0')}</p>
                  <p className="text-[6px] text-slate-400">TEMP: {node.temp}°C | LOAD: {node.load}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <span className="text-[7px] font-black text-slate-600 uppercase">Thermal Strain</span>
               <div className="h-1 bg-slate-900 w-full"><div className="h-full bg-amber-500 w-[22%]"></div></div>
             </div>
             <div className="space-y-1">
               <span className="text-[7px] font-black text-slate-600 uppercase">Network Jitter</span>
               <div className="h-1 bg-slate-900 w-full"><div className="h-full bg-red-600 w-[8%]"></div></div>
             </div>
          </div>
        </div>

        {/* Hybrid Cloud Performance */}
        <div className="col-span-12 lg:col-span-5 glass p-5 rounded-sm h-[380px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Compute Infrastructure Load</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={infrastructureLoad}>
              <defs>
                <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
              <Area type="monotone" dataKey="gpu" name="GPU Load %" stroke="#8b5cf6" fill="url(#colorGpu)" strokeWidth={2} />
              <Area type="monotone" dataKey="npu" name="NPU Load %" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sensor Mix (Pie) */}
        <div className="col-span-12 lg:col-span-3 glass p-5 rounded-sm h-[380px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sensor Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sensorDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {sensorDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', fontSize: '10px' }} />
              <Legend verticalAlign="bottom" iconType="rect" wrapperStyle={{ fontSize: '9px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* --- SECTION: SURVEILLANCE & THREATS --- */}

        {/* Scatter Geoespacial */}
        <div className="col-span-12 lg:col-span-8 glass p-5 rounded-sm h-[400px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tactical Geospatial Hotspots</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" name="Lat" stroke="#475569" fontSize={9} axisLine={false} />
              <YAxis type="number" dataKey="y" name="Lng" stroke="#475569" fontSize={9} axisLine={false} />
              <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Intensity" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }} />
              <Scatter name="Armas" data={spatialIncidents.filter(i => i.type === 'Arma')} fill="#ef4444" />
              <Scatter name="Robos" data={spatialIncidents.filter(i => i.type === 'Robo')} fill="#f59e0b" />
              <Scatter name="Motos" data={spatialIncidents.filter(i => i.type === 'Moto')} fill="#06b6d4" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking de Nodos */}
        <div className="col-span-12 lg:col-span-4 glass p-5 rounded-sm h-[400px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">High Activity Nodes</h3>
          <div className="space-y-2 overflow-y-auto h-full pr-2 custom-scrollbar">
            {nodeRanking.map((node, i) => (
              <div key={i} className="flex justify-between p-3 bg-white/5 border border-white/5 rounded-sm">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-cyan-500 uppercase">{node.id}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase truncate w-32">{node.loc}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white">{node.score}</span>
                  <p className={`text-[7px] font-bold ${node.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {node.trend === 'up' ? '▲' : '▼'} {Math.floor(Math.random()*15)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION: TRENDS & PERFORMANCE --- */}

        {/* Flujo Vehicular (Original) */}
        <div className="col-span-12 lg:col-span-4 glass p-5 rounded-sm h-[350px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Vehicle Flow Analysis</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: '10px' }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="motos" name="Motos" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Amenazas (Original Area) */}
        <div className="col-span-12 lg:col-span-4 glass p-5 rounded-sm h-[350px]">
          <h3 className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Critical Threat Trends</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={threatTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" fontSize={9} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: '10px' }} />
              <Area type="monotone" dataKey="armas" name="Armas" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="prediccion" name="Predicción" stroke="#f97316" fillOpacity={0} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar (Original Efficiency) */}
        <div className="col-span-12 lg:col-span-4 glass p-5 rounded-sm h-[350px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sector Efficiency Radar</h3>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart data={sectorEfficiency}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={8} />
              <Radar name="Precisión" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              <Radar name="Respuesta" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Operational Integrity (Composed) */}
        <div className="col-span-12 glass p-5 rounded-sm h-[400px]">
          <h3 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">Operational Multi-Factor Integrity by District Sector</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={operationalEfficiency}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="sector" stroke="#475569" fontSize={9} />
              <YAxis yAxisId="left" stroke="#475569" fontSize={9} />
              <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: '10px' }} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: '10px' }} />
              <Bar yAxisId="left" dataKey="human_verify" name="Fuerza Humana %" fill="#1e293b" barSize={60} />
              <Line yAxisId="left" type="monotone" dataKey="ia_precision" name="IA Confidence %" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="response_time" name="Response (s)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* FOOTER KERNEL LOGS */}
        <div className="col-span-12 bg-black/90 border border-slate-900 p-4 font-mono text-[8px] h-32 overflow-hidden flex flex-col">
          <div className="flex justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-cyan-500 font-black">SYSTEM_KERNEL_LOG v4.0.2 // OMNI-SURVEILLANCE</span>
            <span className="text-slate-700 uppercase">Buffer: OK | Threads: 2,401 | Encryption: AES-256</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar text-slate-500">
            <p>[OK] Handshake established with Lima Central (DB-77-S)</p>
            <p className="text-emerald-500">[INF] YOLOv8-X weight allocation successful on GPU Unit 0 - 7.2GB VRAM occupied</p>
            <p>[OK] Thermal sensor sync complete for Sectors 1-5. Ambient: 22.4°C</p>
            <p className="text-red-500 animate-pulse">[WARN] Network jitter in Node-024 (Metro Garzón) - Latency > 150ms</p>
            <p>[OK] Gemini-3-Flash multimodal inference pipeline initialized for behavioral analysis</p>
            <p>[OK] Frame buffer sync: 24.2 FPS global average across metropolitan grid</p>
            <p className="text-cyan-400">[SEC] Secure channel encrypted for Police Unit QR-04 dispatching</p>
          </div>
        </div>

      </div>

      <style>{`
        .glass { 
          background: rgba(15, 23, 42, 0.4); 
          backdrop-filter: blur(8px); 
          border: 1px solid rgba(255, 255, 255, 0.03); 
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.5);
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default DashboardStats;
