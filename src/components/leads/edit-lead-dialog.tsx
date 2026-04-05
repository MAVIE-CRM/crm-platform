'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Edit2, MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateLeadDetails } from '@/actions/lead-actions'
import { toast } from 'sonner'
import { Lead } from '@prisma/client'

const formSchema = z.object({
    firstName: z.string().min(2, 'Richiesto'),
    lastName: z.string().min(2, 'Richiesto'),
    email: z.string().email('Email non valida').optional().or(z.literal('')),
    phone: z.string().optional(),
    eventType: z.string().optional(),
    eventDate: z.string().optional(),
    eventLocation: z.string().optional(),
    eventCity: z.string().optional(),
    eventProvince: z.string().optional(),
    eventRegion: z.string().optional(),
    guestsCount: z.string().optional(),
    productInterest: z.string().optional(),
})

interface EditLeadDialogProps {
    lead: Lead;
}

export function EditLeadDialog({ lead }: EditLeadDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const autoCompleteRef = useRef<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            email: lead.email || '',
            phone: lead.phoneRaw || '',
            eventType: lead.eventType || '',
            eventDate: lead.eventDate ? new Date(lead.eventDate).toISOString().split('T')[0] : '',
            eventLocation: lead.eventLocation || '',
            eventCity: lead.eventCity || '',
            eventProvince: lead.eventProvince || '',
            eventRegion: lead.eventRegion || '',
            guestsCount: lead.guestsCount ? String(lead.guestsCount) : '',
            productInterest: lead.productInterest || '',
        },
    })

    const watchCity = form.watch('eventCity')
    const watchProvince = form.watch('eventProvince')
    const watchRegion = form.watch('eventRegion')

    useEffect(() => {
        if (!open) return;

        const initAutocomplete = () => {
             if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
                autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: ['geocode', 'establishment'],
                    componentRestrictions: { country: "it" },
                    fields: ["address_components", "formatted_address", "geometry", "name"]
                });
                
                autoCompleteRef.current.addListener("place_changed", () => {
                    const place = autoCompleteRef.current.getPlace();
                    console.log("Full Place Object:", place);
                    
                    if (!place.geometry) {
                        setStatusMessage("Seleziona un'opzione dall'elenco suggerito");
                        return;
                    }

                    setStatusMessage(null);
                    
                    // Indirizzo Formattato
                    if (place.formatted_address) {
                        form.setValue('eventLocation', place.formatted_address);
                    } else if (place.name) {
                        form.setValue('eventLocation', place.name);
                    }

                    let city = '';
                    let province = '';
                    let region = '';

                    // 1. Estrazione Standard dai componenti
                    if (place.address_components) {
                        for (const component of place.address_components) {
                            const types = component.types;
                            
                            // Logica robusta per la Città (Locality o rimpiazzi)
                            if (types.includes('locality')) {
                                city = component.long_name;
                            } else if (!city && types.includes('administrative_area_level_3')) {
                                city = component.long_name;
                            } else if (!city && types.includes('sublocality_level_1')) {
                                city = component.long_name;
                            }

                            // Provincia (Livello 2)
                            if (types.includes('administrative_area_level_2')) {
                                province = component.short_name; // RM, SA, MI
                            }

                            // Regione (Livello 1)
                            if (types.includes('administrative_area_level_1')) {
                                region = component.long_name;
                            }
                        }
                    }

                    // 2. Fallback: Se la città è ancora vuota, proviamo a cercarla nel formatted_address
                    if (!city && place.formatted_address) {
                        const parts = place.formatted_address.split(',');
                        if (parts.length >= 2) {
                            // Spesso la città è la penultima o terzultima parte prima della provincia/CAP
                            city = parts[parts.length - 3]?.trim() || parts[parts.length - 2]?.trim() || '';
                        }
                    }

                    form.setValue('eventCity', city, { shouldDirty: true, shouldValidate: true });
                    form.setValue('eventProvince', province, { shouldDirty: true, shouldValidate: true });
                    form.setValue('eventRegion', region, { shouldDirty: true, shouldValidate: true });
                });
             }
        };

        const scriptId = 'google-maps-script';
        if (!window.google) {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!document.getElementById(scriptId) && apiKey) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                script.async = true;
                script.onload = () => initAutocomplete();
                document.head.appendChild(script);
            }
        } else {
            setTimeout(initAutocomplete, 200); // Ritardo leggero per garantire il mount
        }

    }, [open, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const result = await updateLeadDetails(lead.id, values)
            if (result.success) {
                toast.success('Dati salvati con successo!')
                router.refresh()
                setOpen(false)
            } else {
                toast.error(`Errore nel salvataggio: ${result.error}`)
            }
        } catch (error) {
            toast.error('Errore imprevisto durante l\'aggiornamento')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-2xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-bold px-6 py-5 shadow-sm">
                    <Edit2 className="mr-2 h-4 w-4 text-indigo-600" />
                    Perfeziona Posizione
                </Button>
            </DialogTrigger>
            <DialogContent 
                onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.pac-container')) {
                        e.preventDefault();
                    }
                }}
                className="sm:max-w-[650px] rounded-[2.5rem] border-none shadow-[0_32px_64px_-12px_rgba(79,70,229,0.25)] p-0 overflow-hidden"
            >
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white relative h-40 flex flex-col justify-end">
                    <div className="absolute top-4 right-6 opacity-10">
                        <Navigation className="h-32 w-32" />
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tight leading-none mb-2">
                         Localizzazione Smart
                    </DialogTitle>
                    <DialogDescription className="text-indigo-100 font-medium opacity-90 max-w-md">
                        Inserisci il nome della villa o l'indirizzo. Google estrarrà città, provincia e regione automaticamente.
                    </DialogDescription>
                </div>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8 bg-white">
                        <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome</FormLabel>
                                        <FormControl>
                                            <Input className="rounded-2xl border-slate-200 bg-slate-50/50 py-6 font-bold focus:ring-indigo-500 h-12" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cognome</FormLabel>
                                        <FormControl>
                                            <Input className="rounded-2xl border-slate-200 bg-slate-50/50 py-6 font-bold focus:ring-indigo-500 h-12" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="eventLocation"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Cerca Location o Indirizzo
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input 
                                                autoComplete="off"
                                                className="rounded-3xl border-2 border-slate-100 bg-slate-50/30 py-9 pl-16 pr-6 font-black text-lg text-slate-800 placeholder:text-slate-300 focus:ring-indigo-500 focus:border-indigo-300 transition-all shadow-inner" 
                                                placeholder="Es: Villa Ravaschieri..." 
                                                {...field}
                                                ref={(e) => {
                                                    field.ref(e);
                                                    (inputRef as any).current = e;
                                                }}
                                            />
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-50">
                                                <MapPin className="h-5 w-5 text-rose-500" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    {statusMessage && (
                                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl animate-pulse">
                                            <AlertCircle className="h-4 w-4" />
                                            <p className="text-[11px] font-bold uppercase">{statusMessage}</p>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* LIVE PREVIEW BOXES */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dettagli Geografici Rilevati</p>
                                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-tighter">Google AI Engine</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                               <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100 group">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-indigo-400 transition-colors">Città</p>
                                  <p className="text-sm font-black text-slate-800 truncate">{watchCity || '---'}</p>
                               </div>
                               <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100 group">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 group-hover:text-indigo-400 transition-colors">Provincia</p>
                                  <p className="text-sm font-black text-slate-800 truncate">{watchProvince || '---'}</p>
                               </div>
                               <div className="rounded-3xl border border-indigo-100 bg-indigo-50/30 p-5 transition-all hover:bg-white hover:shadow-xl hover:border-indigo-300 group">
                                  <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2 group-hover:text-indigo-600 transition-colors">Regione</p>
                                  <p className="text-sm font-black text-slate-800 truncate">{watchRegion || '---'}</p>
                               </div>
                            </div>
                        </div>

                        {/* Hidden Inputs for Form Submission Persistence */}
                        <input type="hidden" {...form.register('eventCity')} />
                        <input type="hidden" {...form.register('eventProvince')} />
                        <input type="hidden" {...form.register('eventRegion')} />

                        <DialogFooter className="pt-8 border-t border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">I dati sono pronti per il database</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => setOpen(false)} type="button" className="rounded-2xl font-bold text-slate-400 hover:text-slate-600 px-6">Annulla</Button>
                                <Button type="submit" disabled={loading} className="rounded-3xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 font-black px-12 py-7 text-sm tracking-widest transition-all hover:scale-105 active:scale-95">
                                    {loading ? 'Salvataggio...' : 'Conferma Geodati'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
