'use client'

import { useState } from "react"
import { Lead } from "../../generated/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { QuickActions } from "./quick-actions"
import Link from "next/link"
import { Eye, FilterX, ArrowUpDown, ArrowUp, ArrowDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LeadsTableProps {
    leads: Lead[];
}

type SortConfig = {
    key: 'leadCreatedAt' | 'eventDate';
    direction: 'asc' | 'desc';
} | null;

const STAGES = [
    'NUOVO',
    'CONTATTATO',
    'QUALIFICATO',
    'PREVENTIVO',
    'FOLLOWUP',
    'APPUNTAMENTO',
    'VINTO',
    'PERSO'
]

export function LeadsTable({ leads }: LeadsTableProps) {
    const [filterStage, setFilterStage] = useState<string | null>(null);
    const [filterEventType, setFilterEventType] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'leadCreatedAt', direction: 'desc' });

    const EVENT_TYPES = [
        "MATRIMONIO",
        "BATTESIMO",
        "COMUNIONE",
        "LAUREA",
        "COMPLEANNO",
        "EVENTO AZIENDALE",
        "ALTRO"
    ]

    const handleSort = (key: 'leadCreatedAt' | 'eventDate') => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key: 'leadCreatedAt' | 'eventDate') => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const filteredLeads = [...leads]
        .filter(lead => {
            if (filterStage && lead.stage !== filterStage) return false;
            if (filterEventType) {
                if (filterEventType === 'ALTRO') {
                    // Se filtriamo per ALTRO, mostriamo solo quelli che NON sono nei tipi definiti (esclusi gli null/empty)
                    return lead.eventType && !EVENT_TYPES.slice(0, -1).includes(lead.eventType);
                }
                return lead.eventType === filterEventType;
            }
            return true;
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;

            const valA = a[key] ? new Date(a[key] as Date).getTime() : 0;
            const valB = b[key] ? new Date(b[key] as Date).getTime() : 0;

            if (direction === 'asc') return valA - valB;
            return valB - valA;
        });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 p-4 bg-slate-50 border rounded-xl shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
                        Stato Lead:
                    </span>
                    {STAGES.map((stage) => (
                        <Button
                            key={stage}
                            variant={filterStage === stage ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-7 px-3 text-[10px] font-bold uppercase rounded-full transition-all",
                                filterStage === stage ? "bg-slate-900 border-slate-950 shadow-md" : "hover:border-slate-400"
                            )}
                            onClick={() => setFilterStage(filterStage === stage ? null : stage)}
                        >
                            {stage.toLowerCase()}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-3">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mr-2">
                        Tipo Evento:
                    </span>
                    {EVENT_TYPES.map((type) => (
                        <Button
                            key={type}
                            variant={filterEventType === type ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-7 px-3 text-[10px] font-bold uppercase rounded-full transition-all",
                                filterEventType === type ? "bg-indigo-600 border-indigo-700 shadow-md text-white hover:bg-indigo-700" : "hover:border-indigo-300 text-indigo-600 border-indigo-100"
                            )}
                            onClick={() => setFilterEventType(filterEventType === type ? null : type)}
                        >
                            {type}
                        </Button>
                    ))}

                    {(filterStage || filterEventType) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-[10px] font-black text-rose-500 hover:text-rose-700 hover:bg-rose-50 uppercase tracking-tighter"
                            onClick={() => {
                                setFilterStage(null);
                                setFilterEventType(null);
                            }}
                        >
                            <FilterX className="h-3 w-3 mr-1" />
                            Resetta filtri
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-100 bg-white overflow-hidden shadow-xl shadow-slate-100">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 font-black italic text-slate-700 border-b border-slate-100">
                            <TableRow>
                                <TableHead className="w-[80px] px-6">Azioni</TableHead>
                                <TableHead>Stato</TableHead>
                                <TableHead className="min-w-[150px]">Nome Cliente</TableHead>
                                <TableHead className="min-w-[130px]">Evento</TableHead>
                                <TableHead className="min-w-[100px]">Invitati</TableHead>
                                <TableHead
                                    className="min-w-[120px] cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('eventDate')}
                                >
                                    <div className="flex items-center">
                                        Data Evento {getSortIcon('eventDate')}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[150px]">Località</TableHead>
                                <TableHead className="min-w-[150px]">Contattare?</TableHead>
                                <TableHead className="min-w-[150px] px-6">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-32 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                                        Nessun lead trovato con questi filtri.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <TableRow key={lead.id} className="group hover:bg-indigo-50/20 transition-all border-b border-slate-50 last:border-0">
                                        <TableCell className="px-6">
                                            <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                <Link href={`/leads/${lead.id}`}>
                                                    <Eye className="h-4 w-4 text-indigo-600" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                lead.stage === 'NUOVO' ? 'default' :
                                                    lead.stage === 'VINTO' ? 'success' as any :
                                                        lead.stage === 'PERSO' ? 'destructive' : 'secondary'
                                            } className="font-black text-[9px] px-2 py-0.5 rounded-lg tracking-tighter uppercase">
                                                {lead.stage}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 text-sm leading-none flex items-center gap-2">
                                                    {lead.firstName} {lead.lastName}
                                                    {lead.preferredContactTime && (
                                                        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-600 border-indigo-100 text-[8px] font-black py-0 px-1.5 h-4 flex items-center gap-1 uppercase tracking-tighter">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            {lead.preferredContactTime}
                                                        </Badge>
                                                    )}
                                                </span>
                                                <div className="flex flex-col text-[10px] text-slate-400 font-semibold tracking-tight mt-1">
                                                    <span className="text-indigo-500 font-bold">{lead.phoneRaw || lead.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {lead.eventType ? (
                                                <Badge className={cn(
                                                    "font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-tight shadow-sm border-none transition-all hover:scale-105 w-fit",
                                                    lead.eventType === 'MATRIMONIO' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' :
                                                    lead.eventType === 'BATTESIMO' ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' :
                                                    lead.eventType === 'COMUNIONE' ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' :
                                                    lead.eventType === 'LAUREA' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                                    lead.eventType === 'COMPLEANNO' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
                                                    lead.eventType === 'EVENTO AZIENDALE' ? 'bg-slate-800 text-slate-100 hover:bg-slate-900' :
                                                    'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                )}>
                                                    {lead.eventType}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-[10px] italic">Non specificato</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {lead.guestsCount ? (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100 w-fit">
                                                    <span>🥂 {lead.guestsCount}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-[10px]">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-indigo-600 text-xs">
                                            {lead.eventDate ? format(new Date(lead.eventDate), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-800 text-[11px] leading-tight flex items-center gap-1">
                                                    📍 {(lead as any).locationName || (lead.eventLocation?.split(',')[0]) || '-'}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-medium truncate max-w-[150px] italic">
                                                    {lead.eventLocation || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {lead.preferredContactTime ? (
                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                                    🕒 {lead.preferredContactTime}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-bold text-[10px] italic">Sempre</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <QuickActions lead={lead} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
