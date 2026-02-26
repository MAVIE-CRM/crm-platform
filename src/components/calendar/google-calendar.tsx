'use client'

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getCalendarEvents } from '@/actions/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ExternalLink, RefreshCcw } from 'lucide-react';

export default function GoogleCalendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());

    const loadEvents = async () => {
        setLoading(true);
        const result = await getCalendarEvents();
        if (result.authenticated) {
            setIsAuthenticated(true);
            setEvents(result.events || []);
        } else {
            setIsAuthenticated(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleConnect = () => {
        window.location.href = '/api/auth/google/login';
    };

    if (isAuthenticated === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl bg-muted/30 p-8 text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                    <CalendarIcon className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Connect Google Calendar</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Sync your appointments and follow-ups with your Google Calendar to stay organized.
                    </p>
                </div>
                <Button onClick={handleConnect} size="lg" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Connect Google Account
                </Button>
            </div>
        );
    }

    const eventsOnSelectedDate = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                    <Button variant="ghost" size="icon" onClick={loadEvents} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <Calendar
                        onChange={(d: any) => setDate(d)}
                        value={date}
                        className="w-full border-none rounded-lg p-2"
                        tileContent={({ date: d, view }) => {
                            if (view === 'month') {
                                const hasEvent = events.some(e => new Date(e.start).toDateString() === d.toDateString());
                                return hasEvent ? <div className="h-1 w-1 bg-primary mx-auto rounded-full" /> : null;
                            }
                            return null;
                        }}
                    />
                </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Events for {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {eventsOnSelectedDate.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <p>No events scheduled for this day.</p>
                            </div>
                        ) : (
                            eventsOnSelectedDate.map(event => (
                                <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 transition-colors hover:bg-card">
                                    <div className="min-w-20 text-sm font-medium text-muted-foreground">
                                        {new Date(event.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{event.title}</h4>
                                            <Badge variant="outline">Google Calendar</Badge>
                                        </div>
                                        {event.location && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" /> {event.location}
                                            </p>
                                        )}
                                        {event.description && <p className="text-sm text-balance">{event.description}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
