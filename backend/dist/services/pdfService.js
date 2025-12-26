"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// PDF translations for different languages
const pdfTranslations = {
    en: {
        date: 'Date',
        associatedAccount: 'Associated account',
        email: 'Email',
        btwNumber: 'BTW Number',
        quantity: 'QTY',
        unit: 'UNIT',
        amount: 'AMOUNT',
        subtotal: 'SUBTOTAL',
        btw: 'BTW',
        total: 'TOTAL'
    },
    nl: {
        date: 'Datum',
        associatedAccount: 'Geassocieerde rekening',
        email: 'E-mail',
        btwNumber: 'BTW-nummer',
        quantity: 'AANTAL',
        unit: 'EENH',
        amount: 'BEDRAG',
        subtotal: 'SUBTOTAAL',
        btw: 'BTW',
        total: 'TOTAAL'
    },
    de: {
        date: 'Datum',
        associatedAccount: 'Verbundenes Konto',
        email: 'E-Mail',
        btwNumber: 'USt-IdNr',
        quantity: 'MENGE',
        unit: 'EINH',
        amount: 'BETRAG',
        subtotal: 'ZWISCHENSUMME',
        btw: 'MwSt',
        total: 'GESAMT'
    },
    fr: {
        date: 'Date',
        associatedAccount: 'Compte associé',
        email: 'E-mail',
        btwNumber: 'Numéro TVA',
        quantity: 'QTÉ',
        unit: 'UNITÉ',
        amount: 'MONTANT',
        subtotal: 'SOUS-TOTAL',
        btw: 'TVA',
        total: 'TOTAL'
    },
    tr: {
        date: 'Tarih',
        associatedAccount: 'İlişkili hesap',
        email: 'E-posta',
        btwNumber: 'KDV Numarası',
        quantity: 'ADET',
        unit: 'BİRİM',
        amount: 'TUTAR',
        subtotal: 'ARA TOPLAM',
        btw: 'KDV',
        total: 'TOPLAM'
    },
    sq: {
        date: 'Data',
        associatedAccount: 'Llogaria e lidhur',
        email: 'Email',
        btwNumber: 'Numri TVSH',
        quantity: 'SASIA',
        unit: 'NJËSIA',
        amount: 'SHUMA',
        subtotal: 'NËNTOTALI',
        btw: 'TVSH',
        total: 'TOTALI'
    }
};
const generateInvoicePdf = async (invoice, company, language = 'nl') => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Invoice ${invoice.invoiceNumber}`,
                    Author: company.name
                }
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const pageWidth = doc.page.width - 100; // Account for margins
            const t = pdfTranslations[language] || pdfTranslations['nl'];
            // Draw handshake logo from image file
            const logoPath = path_1.default.join(process.cwd(), 'src', 'image-removebg-preview (1).png');
            if (fs_1.default.existsSync(logoPath)) {
                doc.image(logoPath, 50, 35, { width: 80, height: 50 });
            }
            // Date on the right
            doc.fontSize(10)
                .font('Helvetica')
                .text(t.date, 400, 50, { align: 'right' })
                .text(formatDate(invoice.issueDate), 400, 65, { align: 'right' });
            // Company Name (Bold, larger)
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .text(company.name, 50, 120);
            // Company details (left side)
            doc.fontSize(9)
                .font('Helvetica')
                .text(company.ownerName, 50, 145)
                .text(company.address, 50, 158)
                .text(company.city, 50, 171)
                .text(`${company.region} ${company.postalCode}`, 50, 184)
                .text(company.taxId, 50, 197)
                .text(t.associatedAccount, 50, 215)
                .text(company.bankAccount, 50, 228)
                .text(company.bankCode, 50, 241)
                .text(`${t.email}: ${company.email}`, 50, 254)
                .text(invoice.invoiceNumber, 50, 272);
            // Client details (right side)
            doc.fontSize(10)
                .font('Helvetica')
                .text(invoice.client.name, 350, 145)
                .text(invoice.client.address || '', 350, 160)
                .text(invoice.client.city || '', 350, 175);
            // Client BTW number on the right side with client info
            if (invoice.client.btwNumber) {
                doc.text(`${t.btwNumber}: ${invoice.client.btwNumber}`, 350, 190);
            }
            // Table settings
            const tableTop = 310;
            const tableLeft = 50;
            const tableRight = tableLeft + pageWidth;
            const headerHeight = 25;
            const itemsHeight = 150;
            // Column positions for vertical lines
            const col1X = 365; // After description
            const col2X = 415; // After quantity
            const col3X = 465; // After unit
            // Draw header row border
            doc.lineWidth(1);
            doc.rect(tableLeft, tableTop, pageWidth, headerHeight).stroke();
            // Draw vertical lines in header
            doc.moveTo(col1X, tableTop).lineTo(col1X, tableTop + headerHeight).stroke();
            doc.moveTo(col2X, tableTop).lineTo(col2X, tableTop + headerHeight).stroke();
            doc.moveTo(col3X, tableTop).lineTo(col3X, tableTop + headerHeight).stroke();
            // Header text
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text(t.quantity, col1X + 5, tableTop + 8, { width: 45, align: 'center' })
                .text(t.unit, col2X + 5, tableTop + 8, { width: 45, align: 'center' })
                .text(t.amount, col3X + 5, tableTop + 8, { width: 70, align: 'right' });
            // Items area - directly below header
            const itemsTop = tableTop + headerHeight;
            doc.rect(tableLeft, itemsTop, pageWidth, itemsHeight).stroke();
            // Draw vertical lines in items area
            doc.moveTo(col1X, itemsTop).lineTo(col1X, itemsTop + itemsHeight).stroke();
            doc.moveTo(col2X, itemsTop).lineTo(col2X, itemsTop + itemsHeight).stroke();
            doc.moveTo(col3X, itemsTop).lineTo(col3X, itemsTop + itemsHeight).stroke();
            // Draw items
            let itemY = itemsTop + 10;
            for (const item of invoice.items) {
                const rowY = itemY;
                // Description (may be multi-line)
                doc.font('Helvetica').fontSize(9);
                const descLines = item.description.split('\n');
                for (const line of descLines) {
                    doc.text(line, tableLeft + 5, itemY, { width: col1X - tableLeft - 10 });
                    itemY += 12;
                }
                // Quantity column
                const qty = item.quantity || 1;
                doc.text(qty.toString(), col1X + 5, rowY, { width: 45, align: 'center' });
                // Unit column
                const unit = item.unit || 'stuk';
                doc.text(unit, col2X + 5, rowY, { width: 45, align: 'center' });
                // Amount column
                doc.text(formatCurrency(item.total), col3X + 5, rowY, { width: 70, align: 'right' });
                itemY += 8;
            }
            // Totals section - directly attached to items table
            const totalsY = itemsTop + itemsHeight;
            const totalsWidth = 190;
            const totalsLeft = tableRight - totalsWidth;
            const rowHeight = 20;
            // SUBTOTAAL row
            doc.rect(totalsLeft, totalsY, totalsWidth, rowHeight).stroke();
            doc.fontSize(9)
                .font('Helvetica')
                .text(t.subtotal, totalsLeft + 5, totalsY + 6)
                .text(formatCurrency(invoice.subtotal), totalsLeft + 125, totalsY + 6, { width: 60, align: 'right' });
            // BTW row
            doc.rect(totalsLeft, totalsY + rowHeight, totalsWidth, rowHeight).stroke();
            doc.text(`${t.btw} ${invoice.btwRate}%`, totalsLeft + 5, totalsY + rowHeight + 6)
                .text(formatCurrency(invoice.btwAmount), totalsLeft + 125, totalsY + rowHeight + 6, { width: 60, align: 'right' });
            // TOTAL row
            doc.rect(totalsLeft, totalsY + rowHeight * 2, totalsWidth, rowHeight).stroke();
            doc.font('Helvetica-Bold')
                .text(t.total, totalsLeft + 5, totalsY + rowHeight * 2 + 6)
                .text(formatCurrency(invoice.total), totalsLeft + 125, totalsY + rowHeight * 2 + 6, { width: 60, align: 'right' });
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateInvoicePdf = generateInvoicePdf;
function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function formatCurrency(amount) {
    const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
    return num.toLocaleString('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }) + ' \u20AC';
}
//# sourceMappingURL=pdfService.js.map