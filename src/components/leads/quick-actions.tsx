'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon, Phone, PhoneOff, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateLeadQuickAction } from "@/actions/lead-actions" // We will create this next
import { Lead } from "@prisma/client"

interface QuickActionsProps {
    lead: Lead;
}

export function QuickActions({ lead }: QuickActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [actionType, setActionType] = useState<'contacted' | 'no-answer' | 'schedule' | 'cancelled' | null>(null);
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
    const [time, setTime] = useState("10:00");
    const [loading, setLoading] = useState(false);

    const handleAction = async (type: 'contacted' | 'no-answer' | 'schedule' | 'cancelled') => {
        setActionType(type);

        if (type === 'cancelled') {
            setIsOpen(true);
            return;
        }

        setIsOpen(true);

        if (type === 'no-answer') {
            setDate(addDays(new Date(), 1));
            setTime("10:00");
        } else if (type === 'schedule') {
            setDate(addDays(new Date(), 7)); // Default 1 week for appuntamento if not set
            setTime("10:00");
        } else if (type === 'contacted') {
            setDate(undefined);
        }
    };

    const submitAction = async () => {
        if (!actionType) return;
        setLoading(true);

        let nextFollowup: Date | undefined;
        if (date && (actionType === 'no-answer' || actionType === 'schedule')) {
            const [hours, minutes] = time.split(':').map(Number);
            nextFollowup = setHours(setMinutes(date, minutes), hours);
        }

        await updateLeadQuickAction(lead.id, actionType, {
            notes,
            nextFollowup,
        });

        setLoading(true);
        setIsOpen(false);
        setNotes("");
        setLoading(false);
    };

    return (
        <div className="flex gap-2 flex-wrap">
            <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAction('contacted')}
            >
                <Phone className="mr-2 h-4 w-4" />
                Contattato
            </Button>

            <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => handleAction('no-answer')}
            >
                <PhoneOff className="mr-2 h-4 w-4" />
                Non Risponde
            </Button>

            <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleAction('schedule')}
            >
                <Clock className="mr-2 h-4 w-4" />
                Appuntamento
            </Button>

            <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction('cancelled')}
            >
                Cancellare
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'contacted' && "Log Contatto"}
                            {actionType === 'no-answer' && "Log Non Risponde & Programma Richiamo"}
                            {actionType === 'schedule' && "Programma Appuntamento"}
                            {actionType === 'cancelled' && "Cancella Lead / Perso"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Note</Label>
                            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Riassunto della conversazione..." />
                        </div>

                        {(actionType === 'no-answer' || actionType === 'schedule') && (
                            <div className="grid gap-2">
                                <Label>Data Prossimo Contatto / Appuntamento</Label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Scegli data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        className="w-32"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={submitAction} disabled={loading}>
                            {loading ? "Salvataggio..." : "Conferma"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
