import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Quote, QuoteItem, Lead } from '@prisma/client';

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#0055AA',
        paddingBottom: 20,
        marginBottom: 30,
    },
    logoSection: {
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 22,
        color: '#0055AA',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    companyTagline: {
        fontSize: 9,
        color: '#666',
        marginTop: 2,
    },
    quoteInfo: {
        textAlign: 'right',
    },
    quoteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    quoteNumber: {
        fontSize: 14,
        color: '#0055AA',
        marginTop: 5,
    },
    detailsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    infoBlock: {
        width: '45%',
    },
    label: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#999',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: 11,
        color: '#333',
        marginBottom: 3,
    },
    table: {
        width: '100%',
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F0F5FA',
        borderBottomWidth: 1,
        borderBottomColor: '#CED4DA',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    headerCell: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#495057',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
    },
    cell: {
        fontSize: 10,
        color: '#333',
    },
    descCell: { width: '50%' },
    qtyCell: { width: '10%', textAlign: 'center' },
    priceCell: { width: '20%', textAlign: 'right' },
    totalCell: { width: '20%', textAlign: 'right' },

    summarySection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    summaryBlock: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#666',
    },
    summaryValue: {
        fontSize: 11,
        color: '#333',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    grandTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0055AA',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0055AA',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#999',
    },
    paymentInfo: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 4,
    }
});

interface QuoteDocumentProps {
    quote: any // Using any to handle serialize results
}

export const QuoteDocument = ({ quote }: QuoteDocumentProps) => {
    const itemsTotal = quote.items.reduce((acc: number, item: any) => acc + Number(item.totalPrice), 0);
    const discount = Number(quote.discountTotal || 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Text style={styles.logoText}>CRM PLATFORM</Text>
                        <Text style={styles.companyTagline}>Soluzioni digitali per il tuo business</Text>
                    </View>
                    <View style={styles.quoteInfo}>
                        <Text style={styles.quoteTitle}>PREVENTIVO</Text>
                        <Text style={styles.quoteNumber}>#{quote.number}</Text>
                        <Text style={[styles.infoValue, { marginTop: 5 }]}>Data: {new Date(quote.createdAt).toLocaleDateString('it-IT')}</Text>
                    </View>
                </View>

                <View style={styles.detailsSection}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>EMESSO DA</Text>
                        <Text style={styles.infoValue}>My Company SRL</Text>
                        <Text style={styles.infoValue}>Via delle Aziende 123</Text>
                        <Text style={styles.infoValue}>00100 Roma (RM)</Text>
                        <Text style={styles.infoValue}>P.IVA: 01234567890</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>DESTINATARIO</Text>
                        <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>
                            {quote.lead.firstName} {quote.lead.lastName}
                        </Text>
                        {quote.lead.email && <Text style={styles.infoValue}>{quote.lead.email}</Text>}
                        {quote.lead.phoneRaw && <Text style={styles.infoValue}>{quote.lead.phoneRaw}</Text>}
                        {quote.lead.eventLocation && <Text style={styles.infoValue}>{quote.lead.eventLocation}</Text>}
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.descCell]}>Descrizione Servizio / Prodotto</Text>
                        <Text style={[styles.headerCell, styles.qtyCell]}>Qtà</Text>
                        <Text style={[styles.headerCell, styles.priceCell]}>Prezzo Unit.</Text>
                        <Text style={[styles.headerCell, styles.totalCell]}>Totale</Text>
                    </View>

                    {quote.items.map((item: any) => (
                        <View style={styles.tableRow} key={item.id}>
                            <Text style={[styles.cell, styles.descCell]}>{item.description}</Text>
                            <Text style={[styles.cell, styles.qtyCell]}>{item.quantity}</Text>
                            <Text style={[styles.cell, styles.priceCell]}>€{Number(item.unitPrice).toFixed(2)}</Text>
                            <Text style={[styles.cell, styles.totalCell]}>€{Number(item.totalPrice).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryBlock}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Totale parziale</Text>
                            <Text style={styles.summaryValue}>€{itemsTotal.toFixed(2)}</Text>
                        </View>
                        {discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Sconto</Text>
                                <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>- €{discount.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Totale Netto</Text>
                            <Text style={styles.grandTotalValue}>€{Number(quote.totalAmount).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.paymentInfo}>
                    <Text style={styles.label}>METODO DI PAGAMENTO</Text>
                    <Text style={styles.infoValue}>{quote.paymentMethod || 'Da concordare'}</Text>
                    {quote.notes && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.label}>NOTE</Text>
                            <Text style={styles.infoValue}>{quote.notes}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Documento generato automaticamente da CRM Platform.</Text>
                    <Text style={styles.footerText}>Grazie per la vostra fiducia.</Text>
                </View>
            </Page>
        </Document>
    );
};
