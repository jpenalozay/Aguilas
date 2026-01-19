
import React, { useEffect, useState } from 'react';
import { Incident } from '../types';
import { generatePoliceReport } from '../services/geminiService';

interface PoliceAlertProps {
  incident: Incident;
  totalInQueue: number;
  onDismiss: () => void;
}

const PoliceAlert: React.FC<PoliceAlertProps> = ({ incident, totalInQueue, onDismiss }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setLoading(true);
      // Generación inmediata
      const result = await generatePoliceReport(incident);
      if (isMounted) {
        setReport(result);
        setLoading(false);
      }
    };
    fetchReport();
    return () => { isMounted = false; };
  }, [incident]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-red-600 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.4)] overflow-hidden alert-pulse flex flex-col relative">
        
        {/* Badge de alertas múltiples */}
        {totalInQueue > 1 && (
          <div className="absolute top-24 right-8 z-10 bg-red-600/90 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 animate-bounce">
            {totalInQueue} ALERTAS CRÍTICAS ACTIVAS
          </div>
        )}

        {/* Header - Fixed */}
        <div className="bg-red-600 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">ALERTA DE SEGURIDAD CRÍTICA</h2>
              <p className="text-[10px] text-red-100 font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Jesús María - Unidad de Respuesta Inmediata</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-white/80 hover:text-white transition-all hover:rotate-90 p-2">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="space-y-1 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ubicación Actual</p>
              <p className="text-sm font-bold text-slate-100">{incident.location}</p>
            </div>
            <div className="space-y-1 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Confianza del Motor IA</p>
              <p className="text-sm font-mono font-black text-red-500">{(incident.confidence * 100).toFixed(2)}% MATCH</p>
            </div>
            <div className="space-y-1 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">ID del Evento</p>
              <p className="text-sm font-mono font-bold text-slate-400">{incident.id.toUpperCase()}</p>
            </div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 relative shadow-inner">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
             </div>

             <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
               <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Análisis Táctico Gemini Flash v3</h3>
             </div>
             
             {loading ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-6">
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                 </div>
                 <div className="text-center">
                   <p className="text-sm font-black text-cyan-500 animate-pulse tracking-widest uppercase">Procesando Flujos Concurrentes</p>
                   <p className="text-[10px] text-slate-600 font-mono mt-2 italic">Generando estrategia de respuesta rápida...</p>
                 </div>
               </div>
             ) : (
               <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                 {report}
               </div>
             )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-8 bg-slate-800/40 border-t border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onDismiss} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-red-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" /></svg>
              {totalInQueue > 1 ? 'Neutralizar y Siguiente Alerta' : 'Despachar Intervención UNI-04'}
            </button>
            <button onClick={onDismiss} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs">
              Marcar como Falsa Alarma
            </button>
          </div>
          <p className="mt-6 text-center text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">
            EagleEye Lima v2.5.0 - Procesamiento Multimodal en Tiempo Real
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliceAlert;
