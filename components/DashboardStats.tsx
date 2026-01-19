
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const timeData = [
  { name: '00:00', value: 4 },
  { name: '04:00', value: 2 },
  { name: '08:00', value: 45 },
  { name: '12:00', value: 88 },
  { name: '16:00', value: 112 },
  { name: '20:00', value: 34 },
];

const categoryData = [
  { name: 'Autos', value: 156, fill: '#10b981' },
  { name: 'Motos', value: 84, fill: '#fbbf24' },
  { name: 'Buses/Camiones', value: 42, fill: '#a855f7' },
  { name: 'Placas Regist.', value: 220, fill: '#22d3ee' },
  { name: 'Alertas Armas', value: 4, fill: '#ef4444' },
];

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div className="glass p-6 rounded-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Flujo Vehicular Total (Jesús María)</h3>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">TENDENCIA ALTA</span>
        </div>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} fontStyle="bold" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#0f172a' }} 
                activeDot={{ r: 6, fill: '#22d3ee' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Categorización de Tránsito (IA)</h3>
          <span className="text-[10px] font-bold text-slate-500">ULT. 24 HORAS</span>
        </div>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight="bold" 
                axisLine={false} 
                tickLine={false}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
