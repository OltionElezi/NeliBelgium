"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceStatus = exports.getInvoicePdf = exports.deleteInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoiceById = exports.getAllInvoices = void 0;
const client_1 = require("@prisma/client");
const pdfService_1 = require("../services/pdfService");
const prisma = new client_1.PrismaClient();
const getAllInvoices = async (req, res) => {
    try {
        const { status, clientId, includeDeleted } = req.query;
        const where = {};
        if (includeDeleted !== 'true') {
            where.deletedAt = null;
        }
        if (status) {
            where.status = status;
        }
        if (clientId) {
            where.clientId = parseInt(clientId);
        }
        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        btwNumber: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Failed to get invoices' });
    }
};
exports.getAllInvoices = getAllInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ error: 'Failed to get invoice' });
    }
};
exports.getInvoiceById = getInvoiceById;
const createInvoice = async (req, res) => {
    try {
        const { clientId, items, notes, btwRate = 21, issueDate, dueDate } = req.body;
        if (!clientId) {
            return res.status(400).json({ error: 'Client is required' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'At least one item is required' });
        }
        // Get company for invoice number
        const company = await prisma.company.findFirst();
        if (!company) {
            return res.status(400).json({ error: 'Company settings not configured' });
        }
        // Generate invoice number
        const invoiceNumber = `${company.invoicePrefix}${company.nextInvoiceNum}`;
        // Calculate totals and profit
        let subtotal = new client_1.Prisma.Decimal(0);
        let totalProfit = new client_1.Prisma.Decimal(0);
        const processedItems = await Promise.all(items.map(async (item) => {
            const quantity = item.quantity || 1;
            const unitPrice = new client_1.Prisma.Decimal(item.unitPrice);
            const itemTotal = new client_1.Prisma.Decimal(quantity).mul(unitPrice);
            subtotal = subtotal.add(itemTotal);
            // Calculate cost price and profit
            let costPrice = new client_1.Prisma.Decimal(item.costPrice || 0);
            // If product is selected, use product's buying price as cost
            if (item.productId) {
                const product = await prisma.product.findUnique({
                    where: { id: parseInt(item.productId) }
                });
                if (product) {
                    costPrice = product.priceBuying;
                }
            }
            const totalCost = costPrice.mul(quantity);
            const itemProfit = itemTotal.sub(totalCost);
            totalProfit = totalProfit.add(itemProfit);
            return {
                productId: item.productId ? parseInt(item.productId) : null,
                description: item.description,
                quantity,
                unit: item.unit || 'stuk',
                costPrice,
                unitPrice,
                total: itemTotal,
                profit: itemProfit
            };
        }));
        const btwAmount = subtotal.mul(new client_1.Prisma.Decimal(btwRate)).div(100);
        const total = subtotal.add(btwAmount);
        // Create invoice with items
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                clientId: parseInt(clientId),
                subtotal,
                btwRate: new client_1.Prisma.Decimal(btwRate),
                btwAmount,
                total,
                profit: totalProfit,
                notes,
                issueDate: issueDate ? new Date(issueDate) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                items: {
                    create: processedItems
                }
            },
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        // Increment invoice number
        await prisma.company.update({
            where: { id: company.id },
            data: { nextInvoiceNum: company.nextInvoiceNum + 1 }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, items, notes, btwRate, status, issueDate, dueDate, paidAt } = req.body;
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) }
        });
        if (!existingInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // If items are provided, recalculate totals
        let updateData = {
            notes,
            issueDate: issueDate ? new Date(issueDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            paidAt: paidAt ? new Date(paidAt) : undefined
        };
        // Only update status if explicitly provided (preserve existing status)
        if (status !== undefined) {
            updateData.status = status;
        }
        if (clientId) {
            updateData.clientId = parseInt(clientId);
        }
        if (items && items.length > 0) {
            // Delete existing items
            await prisma.invoiceItem.deleteMany({
                where: { invoiceId: parseInt(id) }
            });
            // Calculate new totals and profit
            let subtotal = new client_1.Prisma.Decimal(0);
            let totalProfit = new client_1.Prisma.Decimal(0);
            const processedItems = await Promise.all(items.map(async (item) => {
                const quantity = item.quantity || 1;
                const unitPrice = new client_1.Prisma.Decimal(item.unitPrice);
                const itemTotal = new client_1.Prisma.Decimal(quantity).mul(unitPrice);
                subtotal = subtotal.add(itemTotal);
                // Calculate cost price and profit
                let costPrice = new client_1.Prisma.Decimal(item.costPrice || 0);
                // If product is selected, use product's buying price as cost
                if (item.productId) {
                    const product = await prisma.product.findUnique({
                        where: { id: parseInt(item.productId) }
                    });
                    if (product) {
                        costPrice = product.priceBuying;
                    }
                }
                const totalCost = costPrice.mul(quantity);
                const itemProfit = itemTotal.sub(totalCost);
                totalProfit = totalProfit.add(itemProfit);
                return {
                    invoiceId: parseInt(id),
                    productId: item.productId ? parseInt(item.productId) : null,
                    description: item.description,
                    quantity,
                    unit: item.unit || 'stuk',
                    costPrice,
                    unitPrice,
                    total: itemTotal,
                    profit: itemProfit
                };
            }));
            const rate = btwRate !== undefined ? btwRate : existingInvoice.btwRate;
            const btwAmount = subtotal.mul(new client_1.Prisma.Decimal(rate)).div(100);
            const total = subtotal.add(btwAmount);
            updateData.subtotal = subtotal;
            updateData.btwRate = new client_1.Prisma.Decimal(rate);
            updateData.btwAmount = btwAmount;
            updateData.total = total;
            updateData.profit = totalProfit;
            // Create new items
            await prisma.invoiceItem.createMany({
                data: processedItems
            });
        }
        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // Soft delete
        await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Invoice moved to trash' });
    }
    catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};
exports.deleteInvoice = deleteInvoice;
const getInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const { lang } = req.query; // Language parameter for PDF generation
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                client: true,
                items: true
            }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        const company = await prisma.company.findFirst();
        if (!company) {
            return res.status(400).json({ error: 'Company settings not configured' });
        }
        // Use provided language or default to 'nl'
        const language = lang || 'nl';
        const pdfBuffer = await (0, pdfService_1.generateInvoicePdf)(invoice, company, language);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Get invoice PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
exports.getInvoicePdf = getInvoicePdf;
const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const updateData = { status };
        if (status === 'PAID') {
            updateData.paidAt = new Date();
        }
        if (status === 'SENT') {
            updateData.sentAt = new Date();
        }
        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                client: true,
                items: true
            }
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({ error: 'Failed to update invoice status' });
    }
};
exports.updateInvoiceStatus = updateInvoiceStatus;
//# sourceMappingURL=invoiceController.js.map