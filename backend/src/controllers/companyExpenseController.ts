import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCompanyExpenses = async (req: Request, res: Response) => {
  try {
    const { includeDeleted, category, startDate, endDate } = req.query;

    const where: any = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const expenses = await prisma.companyExpense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Calculate total
    const total = expenses.reduce(
      (sum, expense) => sum.add(expense.amount),
      new Prisma.Decimal(0)
    );

    // Group by category
    const byCategory = expenses.reduce((acc: any, expense) => {
      const cat = expense.category || 'other';
      if (!acc[cat]) {
        acc[cat] = {
          category: cat,
          expenses: [],
          total: new Prisma.Decimal(0)
        };
      }
      acc[cat].expenses.push(expense);
      acc[cat].total = acc[cat].total.add(expense.amount);
      return acc;
    }, {});

    // Convert totals to strings
    Object.values(byCategory).forEach((group: any) => {
      group.total = group.total.toString();
    });

    res.json({
      expenses,
      total: total.toString(),
      count: expenses.length,
      byCategory: Object.values(byCategory)
    });
  } catch (error) {
    console.error('Get company expenses error:', error);
    res.status(500).json({ error: 'Failed to get company expenses' });
  }
};

export const getCompanyExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await prisma.companyExpense.findUnique({
      where: { id: parseInt(id) }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get company expense error:', error);
    res.status(500).json({ error: 'Failed to get company expense' });
  }
};

export const createCompanyExpense = async (req: Request, res: Response) => {
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
        amount: new Prisma.Decimal(amount),
        description,
        category,
        vendor,
        reference,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create company expense error:', error);
    res.status(500).json({ error: 'Failed to create company expense' });
  }
};

export const updateCompanyExpense = async (req: Request, res: Response) => {
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
        amount: amount ? new Prisma.Decimal(amount) : undefined,
        description,
        category,
        vendor,
        reference,
        date: date ? new Date(date) : undefined
      }
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update company expense error:', error);
    res.status(500).json({ error: 'Failed to update company expense' });
  }
};

export const deleteCompanyExpense = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Delete company expense error:', error);
    res.status(500).json({ error: 'Failed to delete company expense' });
  }
};

// Get expense summary/report
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { deletedAt: null };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const expenses = await prisma.companyExpense.findMany({ where });

    // Calculate totals by category
    const categorySummary: any = {};
    let grandTotal = new Prisma.Decimal(0);

    expenses.forEach(expense => {
      const cat = expense.category;
      if (!categorySummary[cat]) {
        categorySummary[cat] = new Prisma.Decimal(0);
      }
      categorySummary[cat] = categorySummary[cat].add(expense.amount);
      grandTotal = grandTotal.add(expense.amount);
    });

    // Convert to array format
    const categories = Object.entries(categorySummary).map(([category, total]: [string, any]) => ({
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
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({ error: 'Failed to get expense summary' });
  }
};
