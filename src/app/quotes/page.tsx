import { getQuotes } from "@/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Search, FileText, Eye } from "lucide-react";
import QuoteBuilder from "@/components/quotes/quote-builder";

export default async function QuotesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const quotes = await getQuotes(q);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Preventivi</h2>
            </div>

            <div className="flex items-center gap-2">
                <form className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="q"
                        type="search"
                        placeholder="Cerca per numero o cliente..."
                        className="pl-8"
                        defaultValue={q}
                    />
                </form>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[100px]">Numero</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Totale</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Nessun preventivo trovato.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote: any) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-mono font-medium">
                                        #{quote.number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {quote.lead.firstName} {quote.lead.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {quote.lead.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            quote.status === 'BOZZA' ? 'outline' :
                                                quote.status === 'INVIATO' ? 'secondary' :
                                                    quote.status === 'ACCETTATO' ? 'success' as any : 'destructive'
                                        }>
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        €{Number(quote.totalAmount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {quote.paymentMethod || '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/leads/${quote.leadId}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <QuoteBuilder
                                                leadId={quote.leadId}
                                                quoteId={quote.id}
                                                existingQuote={quote}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
