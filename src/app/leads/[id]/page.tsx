import { getLeadById } from "@/actions/lead-detail"
import { QuickActions } from "@/components/leads/quick-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Mail, Phone, MapPin, Calendar, User, FileText } from "lucide-react"
import QuoteBuilder from "@/components/quotes/quote-builder"

interface PageProps {
    params: { id: string }
}

export default async function LeadDetailPage(props: PageProps) {
    const params = await props.params;
    const lead = await getLeadById(params.id);

    if (!lead) {
        return <div>Lead not found</div>
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{lead.firstName} {lead.lastName}</h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Badge variant="outline">{lead.stage}</Badge>
                        {lead.productInterest && <Badge variant="secondary">{lead.productInterest}</Badge>}
                        <span className="text-sm">Created: {format(new Date(lead.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                </div>
            </div>

            <QuickActions lead={lead} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Main Info Tabs */}
                    <Tabs defaultValue="details">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="activities">Activity Log</TabsTrigger>
                            <TabsTrigger value="quotes">Quotes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Imported Data</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Email</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-3 w-3" /> {lead.email || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Phone</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-3 w-3" /> {lead.phoneRaw || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Event Type</span>
                                        <div className="text-sm">{lead.eventType || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Event Date</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {lead.eventDate ? format(new Date(lead.eventDate), 'dd MMM yyyy') : '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Location</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-3 w-3" /> {lead.eventLocation || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Guests</span>
                                        <div className="text-sm">{lead.guestsCount ? String(lead.guestsCount) : '-'}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Operational Data</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Next Follow-up</span>
                                        <div className="text-sm font-medium text-orange-600">
                                            {lead.nextFollowupAt ? format(new Date(lead.nextFollowupAt), 'dd MMM yyyy HH:mm') : 'Not scheduled'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Last Contact</span>
                                        <div className="text-sm">
                                            {lead.contactedAt ? format(new Date(lead.contactedAt), 'dd MMM yyyy HH:mm') : 'Never'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase">Status</span>
                                        <div className="text-sm">{lead.lastStatus || '-'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activities" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                        {lead.activities.length === 0 && <p className="text-sm text-muted-foreground text-center pl-8">No activities recorded yet.</p>}
                                        {lead.activities.map((activity) => (
                                            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-bold text-slate-900 text-sm">{activity.type}</div>
                                                        <time className="font-caveat font-medium text-indigo-500 text-xs">
                                                            {format(new Date(activity.createdAt), 'dd MMM HH:mm')}
                                                        </time>
                                                    </div>
                                                    <div className="text-slate-500 text-sm">
                                                        {activity.notes}
                                                    </div>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="quotes" className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Quotes</h3>
                                <div className="flex gap-2">
                                    <QuoteBuilder leadId={lead.id} />
                                </div>
                            </div>

                            {lead.quotes.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                        <p>No quotes created yet for this lead.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {lead.quotes.map((quote) => (
                                        <Card key={quote.id}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-sm font-medium">Quote #{quote.number}</CardTitle>
                                                    <CardDescription>Created: {format(new Date(quote.createdAt), 'dd MMM yyyy')}</CardDescription>
                                                </div>
                                                <Badge variant={quote.status === 'INVIATO' ? 'default' : 'secondary'}>
                                                    {quote.status}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-2xl font-bold">€{Number(quote.totalAmount).toFixed(2)}</p>
                                                        {quote.sentAt && (
                                                            <p className="text-xs text-muted-foreground">Sent on: {format(new Date(quote.sentAt), 'dd MMM yyyy HH:mm')}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <QuoteBuilder leadId={lead.id} quoteId={quote.id} existingQuote={quote} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Internal Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground min-h-[100px] whitespace-pre-wrap">
                                {lead.notesInternal || "No internal notes."}
                            </p>
                            <Separator className="my-4" />
                            {/* Add editable notes field here later */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
