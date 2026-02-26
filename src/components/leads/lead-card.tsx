'use client'

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lead } from "@prisma/client";
import { format } from "date-fns";

interface LeadCardProps {
    lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {lead.firstName} {lead.lastName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1">
                    {lead.productInterest && (
                        <div className="font-semibold text-primary/80">{lead.productInterest}</div>
                    )}
                    {lead.eventDate && (
                        <div>Event: {format(new Date(lead.eventDate), "dd/MM/yyyy")}</div>
                    )}
                    {lead.email && <div className="truncate">{lead.email}</div>}
                    {lead.phoneRaw && <div>{lead.phoneRaw}</div>}
                </CardContent>
            </Card>
        </div>
    );
}
