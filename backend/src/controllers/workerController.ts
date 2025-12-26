import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllWorkers = async (req: Request, res: Response) => {
  try {
    const { includeDeleted } = req.query;

    const workers = await prisma.worker.findMany({
      where: includeDeleted === 'true' ? {} : { deletedAt: null },
      include: {
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total expenses per worker
    const workersWithTotals = workers.map(worker => {
      const totalExpenses = worker.expenses.reduce(
        (sum, expense) => sum.add(expense.amount),
        new Prisma.Decimal(0)
      );
      return {
        ...worker,
        totalExpenses: totalExpenses.toString()
      };
    });

    res.json(workersWithTotals);
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Failed to get workers' });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(id) },
      include: {
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const totalExpenses = worker.expenses.reduce(
      (sum, expense) => sum.add(expense.amount),
      new Prisma.Decimal(0)
    );

    res.json({
      ...worker,
      totalExpenses: totalExpenses.toString()
    });
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ error: 'Failed to get worker' });
  }
};

export const createWorker = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, role } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Worker name is required' });
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        phone,
        email,
        role
      }
    });

    res.status(201).json(worker);
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
};

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, role } = req.body;

    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(id) }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone,
        email,
        role
      }
    });

    res.json(updatedWorker);
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({ error: 'Failed to update worker' });
  }
};

export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(id) }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Soft delete
    await prisma.worker.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Worker moved to trash' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ error: 'Failed to delete worker' });
  }
};
