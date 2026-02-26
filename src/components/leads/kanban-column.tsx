'use client'

import { useDroppable } from "@dnd-kit/core";
import { Lead } from "@prisma/client";
import { LeadCard } from "./lead-card";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface KanbanColumnProps {
    id: string; // This will be the stage name
    title: string;
    leads: Lead[];
}

export function KanbanColumn({ id, title, leads }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[300px] bg-muted/30 rounded-lg p-2 mr-4">
            <div className="flex items-center justify-between p-2 mb-2 font-semibold text-sm">
                <span>{title}</span>
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                    {leads.length}
                </span>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[100px]">
                <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                    ))}
                </SortableContext>
                {leads.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
