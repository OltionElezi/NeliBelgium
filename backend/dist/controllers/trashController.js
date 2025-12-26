"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldTrash = exports.emptyTrash = exports.permanentDelete = exports.restoreItem = exports.getTrash = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTrash = async (req, res) => {
    try {
        // Get all soft-deleted items
        const [clients, invoices, workers, expenses, products, companyExpenses] = await Promise.all([
            prisma.client.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' }
            }),
            prisma.invoice.findMany({
                where: { deletedAt: { not: null } },
                include: {
                    client: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            }),
            prisma.worker.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' }
            }),
            prisma.expense.findMany({
                where: { deletedAt: { not: null } },
                include: {
                    worker: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            }),
            prisma.product.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' }
            }),
            prisma.companyExpense.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' }
            })
        ]);
        // Calculate days until permanent deletion for each item
        const addDaysRemaining = (items, type) => {
            return items.map(item => {
                const deletedAt = new Date(item.deletedAt);
                const expiresAt = new Date(deletedAt);
                expiresAt.setDate(expiresAt.getDate() + 30);
                const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return {
                    ...item,
                    type,
                    daysRemaining: Math.max(0, daysRemaining),
                    expiresAt
                };
            });
        };
        res.json({
            clients: addDaysRemaining(clients, 'client'),
            invoices: addDaysRemaining(invoices, 'invoice'),
            workers: addDaysRemaining(workers, 'worker'),
            expenses: addDaysRemaining(expenses, 'expense'),
            products: addDaysRemaining(products, 'product'),
            companyExpenses: addDaysRemaining(companyExpenses, 'companyExpense'),
            summary: {
                totalClients: clients.length,
                totalInvoices: invoices.length,
                totalWorkers: workers.length,
                totalExpenses: expenses.length,
                totalProducts: products.length,
                totalCompanyExpenses: companyExpenses.length,
                total: clients.length + invoices.length + workers.length + expenses.length + products.length + companyExpenses.length
            }
        });
    }
    catch (error) {
        console.error('Get trash error:', error);
        res.status(500).json({ error: 'Failed to get trash' });
    }
};
exports.getTrash = getTrash;
const restoreItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        let restored;
        switch (type) {
            case 'client':
                restored = await prisma.client.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            case 'invoice':
                restored = await prisma.invoice.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            case 'worker':
                restored = await prisma.worker.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            case 'expense':
                restored = await prisma.expense.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            case 'product':
                restored = await prisma.product.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            case 'companyExpense':
                restored = await prisma.companyExpense.update({
                    where: { id: parseInt(id) },
                    data: { deletedAt: null }
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid item type' });
        }
        res.json({ message: `${type} restored successfully`, item: restored });
    }
    catch (error) {
        console.error('Restore item error:', error);
        res.status(500).json({ error: 'Failed to restore item' });
    }
};
exports.restoreItem = restoreItem;
const permanentDelete = async (req, res) => {
    try {
        const { type, id } = req.params;
        switch (type) {
            case 'client':
                const clientInvoices = await prisma.invoice.findMany({
                    where: { clientId: parseInt(id) },
                    select: { id: true }
                });
                for (const inv of clientInvoices) {
                    await prisma.invoiceItem.deleteMany({ where: { invoiceId: inv.id } });
                }
                await prisma.invoice.deleteMany({ where: { clientId: parseInt(id) } });
                // Delete electrical projects (diagrams first, then projects)
                const clientProjects = await prisma.electricalProject.findMany({
                    where: { clientId: parseInt(id) },
                    select: { id: true }
                });
                for (const project of clientProjects) {
                    await prisma.electricalDiagram.deleteMany({ where: { projectId: project.id } });
                }
                await prisma.electricalProject.deleteMany({ where: { clientId: parseInt(id) } });
                await prisma.client.delete({ where: { id: parseInt(id) } });
                break;
            case 'invoice':
                await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });
                await prisma.invoice.delete({ where: { id: parseInt(id) } });
                break;
            case 'worker':
                await prisma.expense.deleteMany({ where: { workerId: parseInt(id) } });
                await prisma.worker.delete({ where: { id: parseInt(id) } });
                break;
            case 'expense':
                await prisma.expense.delete({ where: { id: parseInt(id) } });
                break;
            case 'product':
                await prisma.invoiceItem.updateMany({
                    where: { productId: parseInt(id) },
                    data: { productId: null }
                });
                await prisma.product.delete({ where: { id: parseInt(id) } });
                break;
            case 'companyExpense':
                await prisma.companyExpense.delete({ where: { id: parseInt(id) } });
                break;
            default:
                return res.status(400).json({ error: 'Invalid item type' });
        }
        res.json({ message: `${type} permanently deleted` });
    }
    catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({ error: 'Failed to delete item permanently' });
    }
};
exports.permanentDelete = permanentDelete;
const emptyTrash = async (req, res) => {
    try {
        // Delete all soft-deleted items permanently
        // Get all deleted invoices to delete their items
        const deletedInvoices = await prisma.invoice.findMany({
            where: { deletedAt: { not: null } },
            select: { id: true }
        });
        for (const inv of deletedInvoices) {
            await prisma.invoiceItem.deleteMany({ where: { invoiceId: inv.id } });
        }
        const invoiceResult = await prisma.invoice.deleteMany({
            where: { deletedAt: { not: null } }
        });
        // Delete deleted workers' expenses
        const deletedWorkers = await prisma.worker.findMany({
            where: { deletedAt: { not: null } },
            select: { id: true }
        });
        for (const worker of deletedWorkers) {
            await prisma.expense.deleteMany({ where: { workerId: worker.id } });
        }
        const expenseResult = await prisma.expense.deleteMany({
            where: { deletedAt: { not: null } }
        });
        const workerResult = await prisma.worker.deleteMany({
            where: { deletedAt: { not: null } }
        });
        // Delete electrical projects for deleted clients (diagrams first, then projects)
        const deletedClients = await prisma.client.findMany({
            where: { deletedAt: { not: null } },
            select: { id: true }
        });
        for (const client of deletedClients) {
            // Delete diagrams first
            const projects = await prisma.electricalProject.findMany({
                where: { clientId: client.id },
                select: { id: true }
            });
            for (const project of projects) {
                await prisma.electricalDiagram.deleteMany({ where: { projectId: project.id } });
            }
            // Then delete projects
            await prisma.electricalProject.deleteMany({ where: { clientId: client.id } });
        }
        const clientResult = await prisma.client.deleteMany({
            where: { deletedAt: { not: null } }
        });
        // Handle products - unlink from invoice items first
        const deletedProducts = await prisma.product.findMany({
            where: { deletedAt: { not: null } },
            select: { id: true }
        });
        for (const product of deletedProducts) {
            await prisma.invoiceItem.updateMany({
                where: { productId: product.id },
                data: { productId: null }
            });
        }
        const productResult = await prisma.product.deleteMany({
            where: { deletedAt: { not: null } }
        });
        const companyExpenseResult = await prisma.companyExpense.deleteMany({
            where: { deletedAt: { not: null } }
        });
        res.json({
            message: 'Trash emptied successfully',
            deleted: {
                clients: clientResult.count,
                invoices: invoiceResult.count,
                workers: workerResult.count,
                expenses: expenseResult.count,
                products: productResult.count,
                companyExpenses: companyExpenseResult.count
            }
        });
    }
    catch (error) {
        console.error('Empty trash error:', error);
        res.status(500).json({ error: 'Failed to empty trash' });
    }
};
exports.emptyTrash = emptyTrash;
const cleanupOldTrash = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    try {
        const oldInvoices = await prisma.invoice.findMany({
            where: {
                deletedAt: { not: null, lt: thirtyDaysAgo }
            },
            select: { id: true }
        });
        for (const inv of oldInvoices) {
            await prisma.invoiceItem.deleteMany({ where: { invoiceId: inv.id } });
        }
        await prisma.invoice.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        const oldWorkers = await prisma.worker.findMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } },
            select: { id: true }
        });
        for (const worker of oldWorkers) {
            await prisma.expense.deleteMany({ where: { workerId: worker.id } });
        }
        await prisma.expense.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        await prisma.worker.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        // Delete electrical projects for old deleted clients
        const oldClients = await prisma.client.findMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } },
            select: { id: true }
        });
        for (const client of oldClients) {
            const projects = await prisma.electricalProject.findMany({
                where: { clientId: client.id },
                select: { id: true }
            });
            for (const project of projects) {
                await prisma.electricalDiagram.deleteMany({ where: { projectId: project.id } });
            }
            await prisma.electricalProject.deleteMany({ where: { clientId: client.id } });
        }
        await prisma.client.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        // Handle old products
        const oldProducts = await prisma.product.findMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } },
            select: { id: true }
        });
        for (const product of oldProducts) {
            await prisma.invoiceItem.updateMany({
                where: { productId: product.id },
                data: { productId: null }
            });
        }
        await prisma.product.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        await prisma.companyExpense.deleteMany({
            where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
        });
        console.log('Trash cleanup completed');
    }
    catch (error) {
        console.error('Trash cleanup error:', error);
    }
};
exports.cleanupOldTrash = cleanupOldTrash;
//# sourceMappingURL=trashController.js.map