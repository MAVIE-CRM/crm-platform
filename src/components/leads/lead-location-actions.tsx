"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Maximize2, Globe, Landmark, Map, Info, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lead } from "@prisma/client";

interface LeadLocationActionsProps {
  lead: Lead;
}

export function LeadLocationActions({ lead }: LeadLocationActionsProps) {
  const origin = "Via Fosse Ardeatine 30, 80024 Cardito (NA)";
  const location = lead.eventLocation || "";
  
  // Utilizzo dei nuovi campi strutturati salvati nel DB
  const cityName = lead.eventCity || "-";
  const province = lead.eventProvince || "-";
  const region = lead.eventRegion || "-";

  const locationEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const directionsEmbedUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(location)}&output=embed`;

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-7 shadow-2xl transition-all hover:shadow-indigo-100/50 mt-6 font-sans">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-50/40 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
              <Navigation className="h-4 w-4 animate-bounce" /> Hub Logistico Premium
            </span>
            <p className="text-sm font-bold text-slate-900 tracking-tight">Sede Cardito (NA)</p>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-none px-4 py-2 text-[10px] font-bold uppercase rounded-full shadow-lg">Dati Certificati</Badge>
        </div>

        {/* Mappa Preview */}
        <div className="relative h-[260px] w-full overflow-hidden rounded-[2rem] border-2 border-white shadow-xl group-hover:shadow-2xl transition-all duration-500">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            src={locationEmbedUrl}
            className="rounded-[1.9rem] grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-500"
            title="Preview Map"
          ></iframe>
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-slate-100">
             <p className="text-[10px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5 text-rose-500" /> Target Location
             </p>
          </div>
        </div>

        {/* Tripletta di Info Geografiche Strutturate */}
        <div className="grid grid-cols-3 gap-3">
           {/* Città */}
           <div className="bg-indigo-50/30 rounded-3xl p-5 border border-indigo-100/30 text-center transition-all hover:bg-indigo-50/60">
             <div className="flex flex-col items-center gap-1.5">
                 <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                 </div>
                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Città</span>
                 <p className="text-xs font-black text-slate-800 tracking-tight truncate w-full">{cityName}</p>
             </div>
           </div>

           {/* Provincia */}
           <div className="bg-indigo-50/30 rounded-3xl p-5 border border-indigo-100/30 text-center transition-all hover:bg-indigo-50/60">
             <div className="flex flex-col items-center gap-1.5">
                 <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1">
                    <Landmark className="h-4 w-4 text-indigo-600" />
                 </div>
                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Provincia</span>
                 <p className="text-xs font-black text-slate-800 tracking-tight truncate w-full">{province}</p>
             </div>
           </div>

           {/* Regione */}
           <div className="bg-emerald-50/20 rounded-3xl p-5 border border-emerald-100/30 text-center transition-all hover:bg-emerald-50/40">
             <div className="flex flex-col items-center gap-1.5">
                 <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1">
                    <Compass className="h-4 w-4 text-emerald-600" />
                 </div>
                 <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.15em]">Regione</span>
                 <p className="text-xs font-black text-slate-800 tracking-tight truncate w-full">{region}</p>
             </div>
           </div>
        </div>

        {/* Indirizzo Completo */}
        <div className="bg-slate-950 rounded-[2.2rem] p-6 shadow-2xl relative overflow-hidden group/addr transition-all hover:px-7">
           <div className="absolute right-0 top-0 p-6 opacity-10 group-hover/addr:opacity-20 transition-opacity">
              <Compass className="h-16 w-16 text-white" />
           </div>
           <div className="relative z-10 flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                 <Map className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="space-y-1.5 overflow-hidden">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Indirizzo di Destinazione Ufficiale</p>
                 <p className="text-xs font-bold text-white tracking-wide truncate w-full">{location}</p>
                 <div className="flex items-center gap-2 pt-1">
                    <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Google Verified</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottoni Azione */}
        <div className="grid grid-cols-2 gap-5">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 rounded-2xl border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 shadow-sm font-black text-[11px] uppercase tracking-widest transition-all">
                 <Maximize2 className="h-5 w-5 mr-3" /> Massimizza Mappa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[85vh] p-2 rounded-[3.5rem] border-none shadow-[0_0_100px_rgba(0,0,0,0.2)]">
               <iframe width="100%" height="100%" frameBorder="0" src={locationEmbedUrl} className="rounded-[3.2rem]"></iframe>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02]">
                 <Navigation className="h-5 w-5 mr-3" /> Percorso Rapido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[90vh] p-2 rounded-[4rem] border-none shadow-[0_0_150px_rgba(0,0,0,0.3)]">
               <iframe width="100%" height="100%" frameBorder="0" src={directionsEmbedUrl} className="rounded-[3.7rem]"></iframe>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
