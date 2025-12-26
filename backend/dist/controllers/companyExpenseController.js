"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseSummary = exports.deleteCompanyExpense = exports.updateCompanyExpense = exports.createCompanyExpense = exports.getCompanyExpenseById = exports.getAllCompanyExpenses = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllCompanyExpenses = async (req, res) => {
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
        const expenses = await prisma.companyExpense.findMany({
            where,
            orderBy: { date: 'desc' }
        });
        // Calculate total
        const total = expenses.reduce((sum, expense) => sum.add(expense.amount), new client_1.Prisma.Decimal(0));
        // Group by category
        const byCategory = expenses.reduce((acc, expense) => {
            const cat = expense.category || 'other';
            if (!acc[cat]) {
                acc[cat] = {
                    category: cat,
                    expenses: [],
                    total: new client_1.Prisma.Decimal(0)
                };
            }
            acc[cat].expenses.push(expense);
            acc[cat].total = acc[cat].total.add(expense.amount);
            return acc;
        }, {});
        // Convert totals to strings
        Object.values(byCategory).forEach((group) => {
            group.total = group.total.toString();
        });
        res.json({
            expenses,
            total: total.toString(),
            count: expenses.length,
            byCategory: Object.values(byCategory)
        });
    }
    catch (error) {
        console.error('Get company expenses error:', error);
        res.status(500).json({ error: 'Failed to get company expenses' });
    }
};
exports.getAllCompanyExpenses = getAllCompanyExpenses;
const getCompanyExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma.companyExpense.findUnique({
            where: { id: parseInt(id) }
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json(expense);
    }
    catch (error) {
        console.error('Get company expense error:', error);
        res.status(500).json({ error: 'Failed to get company expense' });
    }
};
exports.getCompanyExpenseById = getCompanyExpenseById;
const createCompanyExpense = async (req, res) => {
    try {
        const { amount, description, category, vendor, reference, date } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        const expense = await prisma.companyExpense.create({
            data: {
                amount: new client_1.Prisma.Decimal(amount),
                description,
                category,
                vendor,
                reference,
                date: date ? new Date(date) : new Date()
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        console.error('Create company expense error:', error);
        res.status(500).json({ error: 'Failed to create company expense' });
    }
};
exports.createCompanyExpense = createCompanyExpense;
const updateCompanyExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, category, vendor, reference, date } = req.body;
        const expense = await prisma.companyExpense.findUnique({
            where: { id: parseInt(id) }
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        const updatedExpense = await prisma.companyExpense.update({
            where: { id: parseInt(id) },
            data: {
                amount: amount ? new client_1.Prisma.Decimal(amount) : undefined,
                description,
                category,
                vendor,
                reference,
                date: date ? new Date(date) : undefined
            }
        });
        res.json(updatedExpense);
    }
    catch (error) {
        console.error('Update company expense error:', error);
        res.status(500).json({ error: 'Failed to update company expense' });
    }
};
exports.updateCompanyExpense = updateCompanyExpense;
const deleteCompanyExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma.companyExpense.findUnique({
            where: { id: parseInt(id) }
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        // Soft delete
        await prisma.companyExpense.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Company expense moved to trash' });
    }
    catch (error) {
        console.error('Delete company expense error:', error);
        res.status(500).json({ error: 'Failed to delete company expense' });
    }
};
exports.deleteCompanyExpense = deleteCompanyExpense;
// Get expense summary/report
const getExpenseSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { deletedAt: null };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const expenses = await prisma.companyExpense.findMany({ where });
        // Calculate totals by category
        const categorySummary = {};
        let grandTotal = new client_1.Prisma.Decimal(0);
        expenses.forEach(expense => {
            const cat = expense.category;
            if (!categorySummary[cat]) {
                categorySummary[cat] = new client_1.Prisma.Decimal(0);
            }
            categorySummary[cat] = categorySummary[cat].add(expense.amount);
            grandTotal = grandTotal.add(expense.amount);
        });
        // Convert to array format
        const categories = Object.entries(categorySummary).map(([category, total]) => ({
            category,
            total: total.toString(),
            percentage: grandTotal.greaterThan(0)
                ? ((parseFloat(total.toString()) / parseFloat(grandTotal.toString())) * 100).toFixed(2)
                : '0'
        }));
        res.json({
            categories,
            grandTotal: grandTotal.toString(),
            count: expenses.length
        });
    }
    catch (error) {
        console.error('Get expense summary error:', error);
        res.status(500).json({ error: 'Failed to get expense summary' });
    }
};
exports.getExpenseSummary = getExpenseSummary;
//# sourceMappingURL=companyExpenseController.js.map