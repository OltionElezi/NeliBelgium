import { Invoice, InvoiceItem, Client, Company } from '@prisma/client';
type InvoiceWithDetails = Invoice & {
    client: Client;
    items: InvoiceItem[];
};
export declare const generateInvoicePdf: (invoice: InvoiceWithDetails, company: Company, language?: string) => Promise<Buffer>;
export {};
//# sourceMappingURL=pdfService.d.ts.map