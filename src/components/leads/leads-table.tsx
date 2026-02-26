'use client'

import { useState } from "react"
import { Lead } from "@prisma/client"
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
import { Eye, FilterX, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'leadCreatedAt', direction: 'desc' });

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

    const filteredLeads = [...(filterStage
        ? leads.filter(lead => lead.stage === filterStage)
        : leads)].sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;

            const valA = a[key] ? new Date(a[key] as Date).getTime() : 0;
            const valB = b[key] ? new Date(b[key] as Date).getTime() : 0;

            if (direction === 'asc') return valA - valB;
            return valB - valA;
        });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 border rounded-lg">
                <span className="text-sm font-medium text-slate-500 mr-2 flex items-center gap-1">
                    Filtra per stato:
                </span>
                {STAGES.map((stage) => (
                    <Button
                        key={stage}
                        variant={filterStage === stage ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "h-8 px-3 text-xs capitalize",
                            filterStage === stage && "bg-slate-900 text-white"
                        )}
                        onClick={() => setFilterStage(stage)}
                    >
                        {stage.toLowerCase()}
                    </Button>
                ))}

                {filterStage && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setFilterStage(null)}
                    >
                        <FilterX className="h-3 w-3 mr-1" />
                        Elimina filtro
                    </Button>
                )}
            </div>

            <div className="rounded-md border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 font-semibold italic text-slate-700">
                            <TableRow>
                                <TableHead className="w-[80px]">Azioni</TableHead>
                                <TableHead className="min-w-[150px]">Nome Cliente</TableHead>
                                <TableHead>Stato</TableHead>
                                <TableHead
                                    className="min-w-[120px] cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('leadCreatedAt')}
                                >
                                    <div className="flex items-center">
                                        Data Lead {getSortIcon('leadCreatedAt')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="min-w-[120px] cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('eventDate')}
                                >
                                    <div className="flex items-center">
                                        Data Evento {getSortIcon('eventDate')}
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[120px]">Prodotto</TableHead>
                                <TableHead className="min-w-[150px]">Località</TableHead>
                                <TableHead className="min-w-[200px]">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                        Nessun lead trovato.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <TableRow key={lead.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild className="hover:bg-slate-200">
                                                <Link href={`/leads/${lead.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {lead.firstName} {lead.lastName}
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {lead.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                lead.stage === 'NUOVO' ? 'default' :
                                                    lead.stage === 'VINTO' ? 'success' as any :
                                                        lead.stage === 'PERSO' ? 'destructive' : 'secondary'
                                            } className="font-semibold px-2 py-0.5">
                                                {lead.stage}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lead.leadCreatedAt ? format(new Date(lead.leadCreatedAt), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {lead.eventDate ? format(new Date(lead.eventDate), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>{lead.productInterest || '-'}</TableCell>
                                        <TableCell>{lead.eventLocation || '-'}</TableCell>
                                        <TableCell>
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
