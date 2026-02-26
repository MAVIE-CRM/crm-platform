'use client'

import { useState, useEffect } from 'react'
import { createQuote, addItemToQuote, getQuote, deleteQuoteItem, deleteQuote } from '@/actions/quotes'
import { markQuoteAsSent } from '@/actions/quote-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuoteDocument } from '@/components/quotes/quote-pdf'
import { Loader2, Plus, FileDown, Trash2, Send, Pencil } from 'lucide-react'
import { updateQuoteDetails } from '@/actions/quotes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface QuoteBuilderProps {
    leadId: string
    quoteId?: string
    existingQuote?: any
}

export default function QuoteBuilder({ leadId, quoteId, existingQuote }: QuoteBuilderProps) {
    const [open, setOpen] = useState(false);
    const [qId, setQId] = useState<string | null>(quoteId || null);
    const [quote, setQuote] = useState<any>(existingQuote || null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Item form state
    const [desc, setDesc] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);

    // Quote details state
    const [paymentMethod, setPaymentMethod] = useState(existingQuote?.paymentMethod || "BONIFICO");
    const [discountTotal, setDiscountTotal] = useState(Number(existingQuote?.discountTotal) || 0);
    const [notes, setNotes] = useState(existingQuote?.notes || "");

    // Client data for quote (defaults to lead data)
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");

    // Refresh quote if we have qId but no full quote object
    useEffect(() => {
        if (qId && !quote) {
            fetchQuote(qId);
        }
    }, [qId]);

    const fetchQuote = async (id: string) => {
        const result = await getQuote(id);
        const data = result as any;
        setQuote(data);
        if (data) {
            setPaymentMethod(data.paymentMethod || "BONIFICO");
            setDiscountTotal(Number(data.discountTotal) || 0);
            setNotes(data.notes || "");
            setClientName(`${data.lead?.firstName || ''} ${data.lead?.lastName || ''}`);
            setClientEmail(data.lead?.email || "");
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const newQuote = await createQuote(leadId);
            setQId(newQuote.id);
            await fetchQuote(newQuote.id);
            toast.success("Quote created successfully");
        } catch (error) {
            toast.error("Failed to create quote");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!qId || !desc) return;
        setLoading(true);
        try {
            await addItemToQuote(qId, { description: desc, quantity: qty, unitPrice: price, vatRate: 22 });
            await fetchQuote(qId);
            setDesc("");
            setQty(1);
            setPrice(0);
            toast.success("Item added");
        } catch (error) {
            toast.error("Failed to add item");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!qId) return;
        setLoading(true);
        try {
            await deleteQuoteItem(itemId, qId);
            await fetchQuote(qId);
            toast.success("Item removed");
        } catch (error) {
            toast.error("Failed to remove item");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!qId) return;
        setLoading(true);
        try {
            await updateQuoteDetails(qId, {
                paymentMethod,
                discountTotal,
                notes
            });
            await fetchQuote(qId);
            toast.success("Dettagli salvati");
        } catch (error) {
            toast.error("Errore nel salvataggio");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsSent = async () => {
        if (!qId) return;
        setSending(true);
        try {
            const res = await markQuoteAsSent(qId, leadId);
            if (res.success) {
                await fetchQuote(qId);
                toast.success("Preventivo segnato come inviato");
                setOpen(false);
            } else {
                toast.error("Errore nell'invio");
            }
        } catch (error) {
            toast.error("Si è verificato un errore");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteQuote = async () => {
        if (!qId) return;
        if (!confirm("Are you sure you want to delete this quote?")) return;
        setLoading(true);
        try {
            await deleteQuote(qId, leadId);
            toast.success("Quote deleted");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to delete quote");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {quoteId ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> New Quote
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{qId ? `Edit Quote #${quote?.number || ''}` : 'Create New Quote'}</DialogTitle>
                </DialogHeader>

                {!qId ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <p className="text-muted-foreground text-center">Ready to create a new quote for this lead?</p>
                        <Button onClick={handleCreate} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Initialize Quote
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border">
                            <div>
                                <Label className="text-xs">Intestazione Cliente</Label>
                                <Input className="h-8" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">Email Invio</Label>
                                <Input className="h-8" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-semibold text-xs mb-3 uppercase tracking-wider text-muted-foreground flex justify-between">
                                Voci Preventivo
                            </h3>
                            <div className="space-y-2">
                                {quote?.items?.length === 0 && <p className="text-sm text-center py-4 text-muted-foreground">Nessun elemento aggiunto.</p>}
                                {quote?.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm bg-background p-2 rounded border group">
                                        <div className="flex-1">
                                            <span className="font-medium">{item.description}</span>
                                            <span className="text-xs text-muted-foreground ml-2">x{item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold">€{Number(item.totalPrice).toFixed(2)}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-2 border-t space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Totale Parziale</span>
                                    <span>€{(quote?.items?.reduce((acc: number, i: any) => acc + Number(i.totalPrice), 0) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">Sconto Totale (€)</span>
                                    <Input
                                        type="number"
                                        className="h-8 w-24 text-right"
                                        value={discountTotal}
                                        onChange={(e) => setDiscountTotal(Number(e.target.value))}
                                        onBlur={handleSaveDetails}
                                    />
                                </div>
                                <div className="flex justify-between items-center font-bold pt-2 border-t">
                                    <span>Totale Netto</span>
                                    <span className="text-lg text-primary">€{Number(quote?.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                            <div>
                                <Label className="text-xs">Metodo di Pagamento</Label>
                                <Select value={paymentMethod} onValueChange={(val) => {
                                    setPaymentMethod(val);
                                    updateQuoteDetails(qId, { paymentMethod: val, discountTotal, notes });
                                }}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CARTA">Carta</SelectItem>
                                        <SelectItem value="CONTANTI">Contanti</SelectItem>
                                        <SelectItem value="BONIFICO">Bonifico</SelectItem>
                                        <SelectItem value="RATEALE">Rateale</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Note Preventivo</Label>
                                <Textarea
                                    className="h-9 min-h-[36px]"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    onBlur={handleSaveDetails}
                                    placeholder="Note aggiuntive..."
                                />
                            </div>
                        </div>

                        {quote?.status !== 'INVIATO' && (
                            <div className="grid grid-cols-12 gap-2 items-end border p-4 rounded-md bg-blue-50/50">
                                <div className="col-span-12 mb-1">
                                    <Label className="text-[10px] font-bold uppercase text-blue-600">Aggiungi Voce</Label>
                                </div>
                                <div className="col-span-6">
                                    <Input placeholder="Descrizione..." value={desc} onChange={(e) => setDesc(e.target.value)} className="h-9" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-9" />
                                </div>
                                <div className="col-span-3">
                                    <Input type="number" step="0.01" placeholder="Prezzo" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-9" />
                                </div>
                                <div className="col-span-1">
                                    <Button size="icon" onClick={handleAddItem} disabled={loading || !desc} className="h-9 w-9">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between w-full pt-4 border-t">
                            <Button variant="ghost" size="sm" onClick={handleDeleteQuote} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" /> Elimina
                            </Button>

                            <div className="flex gap-2">
                                {quote?.items?.length > 0 && (
                                    <>
                                        <PDFDownloadLink document={<QuoteDocument quote={quote} />} fileName={`preventivo_${quote.number}.pdf`}>
                                            {({ blob, url, loading: pdfLoading, error }) => (
                                                <Button variant="outline" size="sm" disabled={pdfLoading}>
                                                    <FileDown className="mr-2 h-4 w-4" />
                                                    PDF
                                                </Button>
                                            )}
                                        </PDFDownloadLink>
                                        {quote.status !== 'INVIATO' && (
                                            <Button size="sm" onClick={handleMarkAsSent} disabled={sending}>
                                                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                Invia Email
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
