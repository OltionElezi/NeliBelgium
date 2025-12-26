"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getAllExpenses = exports.getWorkerExpenses = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getWorkerExpenses = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { includeDeleted, category, startDate, endDate } = req.query;
        const where = {
            workerId: parseInt(workerId)
        };
        if (includeDeleted !== 'true') {
            where.deletedAt = null;
        }
        if (category) {
            where.category = category;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const expenses = await prisma.expense.findMany({
            where,
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        // Calculate total
        const total = expenses.reduce((sum, expense) => sum.add(expense.amount), new client_1.Prisma.Decimal(0));
        res.json({
            expenses,
            total: total.toString(),
            count: expenses.length
        });
    }
    catch (error) {
        console.error('Get worker expenses error:', error);
        res.status(500).json({ error: 'Failed to get expenses' });
    }
};
exports.getWorkerExpenses = getWorkerExpenses;
const getAllExpenses = async (req, res) => {
    try {
        const { includeDeleted, category, startDate, endDate } = req.query;
        const where = {};
        if (includeDeleted !== 'true') {
            where.deletedAt = null;
        }
        if (category) {
            where.category = category;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const expenses = await prisma.expense.findMany({
            where,
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        // Calculate total
        const total = expenses.reduce((sum, expense) => sum.add(expense.amount), new client_1.Prisma.Decimal(0));
        // Group by worker
        const byWorker = expenses.reduce((acc, expense) => {
            const workerId = expense.workerId;
            if (!acc[workerId]) {
                acc[workerId] = {
                    worker: expense.worker,
                    expenses: [],
                    total: new client_1.Prisma.Decimal(0)
                };
            }
            acc[workerId].expenses.push(expense);
            acc[workerId].total = acc[workerId].total.add(expense.amount);
            return acc;
        }, {});
        // Convert totals to strings
        Object.values(byWorker).forEach((group) => {
            group.total = group.total.toString();
        });
        res.json({
            expenses,
            total: total.toString(),
            count: expenses.length,
            byWorker: Object.values(byWorker)
        });
    }
    catch (error) {
        console.error('Get all expenses error:', error);
        res.status(500).json({ error: 'Failed to get expenses' });
    }
};
exports.getAllExpenses = getAllExpenses;
const createExpense = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { amount, description, category, date } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        // Verify worker exists
        const worker = await prisma.worker.findUnique({
            where: { id: parseInt(workerId) }
        });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        const expense = await prisma.expense.create({
            data: {
                workerId: parseInt(workerId),
                amount: new client_1.Prisma.Decimal(amount),
                description,
                category,
                date: date ? new Date(date) : new Date()
            },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, category, date } = req.body;
        const expense = await prisma.expense.findUnique({
            where: { id: parseInt(id) }
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        const updatedExpense = await prisma.expense.update({
            where: { id: parseInt(id) },
            data: {
                amount: amount ? new client_1.Prisma.Decimal(amount) : undefined,
                description,
                category,
                date: date ? new Date(date) : undefined
            },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        res.json(updatedExpense);
    }
    catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma.expense.findUnique({
            where: { id: parseInt(id) }
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        // Soft delete
        await prisma.expense.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Expense moved to trash' });
    }
    catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};
exports.deleteExpense = deleteExpense;
//# sourceMappingURL=expenseController.js.map