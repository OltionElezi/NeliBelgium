import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getWorkerExpenses = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { includeDeleted, category, startDate, endDate } = req.query;

    const where: any = {
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
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
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
    const total = expenses.reduce(
      (sum, expense) => sum.add(expense.amount),
      new Prisma.Decimal(0)
    );

    res.json({
      expenses,
      total: total.toString(),
      count: expenses.length
    });
  } catch (error) {
    console.error('Get worker expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
};

export const getAllExpenses = async (req: Request, res: Response) => {
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
    const total = expenses.reduce(
      (sum, expense) => sum.add(expense.amount),
      new Prisma.Decimal(0)
    );

    // Group by worker
    const byWorker = expenses.reduce((acc: any, expense) => {
      const workerId = expense.workerId;
      if (!acc[workerId]) {
        acc[workerId] = {
          worker: expense.worker,
          expenses: [],
          total: new Prisma.Decimal(0)
        };
      }
      acc[workerId].expenses.push(expense);
      acc[workerId].total = acc[workerId].total.add(expense.amount);
      return acc;
    }, {});

    // Convert totals to strings
    Object.values(byWorker).forEach((group: any) => {
      group.total = group.total.toString();
    });

    res.json({
      expenses,
      total: total.toString(),
      count: expenses.length,
      byWorker: Object.values(byWorker)
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
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
        amount: new Prisma.Decimal(amount),
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
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
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
        amount: amount ? new Prisma.Decimal(amount) : undefined,
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
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
