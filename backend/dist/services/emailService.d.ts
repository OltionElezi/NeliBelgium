import { Invoice, Client, Company } from '@prisma/client';
type InvoiceWithDetails = Invoice & {
    client: Client;
    items: any[];
};
export declare const sendInvoiceEmail: (invoice: InvoiceWithDetails, company: Company, recipientEmail?: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const testEmailConnection: () => Promise<{
    success: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=emailService.d.ts.map