import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { includeDeleted, category } = req.query;

    const where: any = {};

    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    // Calculate profit margin for each product
    const productsWithMargin = products.map(product => {
      const buyPrice = parseFloat(product.priceBuying.toString());
      const sellPrice = parseFloat(product.priceSelling.toString());
      const profit = sellPrice - buyPrice;
      const marginPercent = buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(2) : '0';

      return {
        ...product,
        profit: profit.toFixed(2),
        marginPercent
      };
    });

    res.json(productsWithMargin);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        invoiceItems: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                issueDate: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const buyPrice = parseFloat(product.priceBuying.toString());
    const sellPrice = parseFloat(product.priceSelling.toString());
    const profit = sellPrice - buyPrice;
    const marginPercent = buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(2) : '0';

    res.json({
      ...product,
      profit: profit.toFixed(2),
      marginPercent
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, sku, priceBuying, priceSelling, stock, unit, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    if (priceBuying === undefined || priceSelling === undefined) {
      return res.status(400).json({ error: 'Both buying and selling prices are required' });
    }

    // Check for duplicate SKU
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku: sku || null,
        priceBuying: new Prisma.Decimal(priceBuying),
        priceSelling: new Prisma.Decimal(priceSelling),
        stock: stock || 0,
        unit: unit || 'stuk',
        category
      }
    });

    const buyPrice = parseFloat(product.priceBuying.toString());
    const sellPrice = parseFloat(product.priceSelling.toString());
    const profit = sellPrice - buyPrice;

    res.status(201).json({
      ...product,
      profit: profit.toFixed(2),
      marginPercent: buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(2) : '0'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sku, priceBuying, priceSelling, stock, unit, category } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check for duplicate SKU (excluding current product)
    if (sku && sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        sku: sku || null,
        priceBuying: priceBuying !== undefined ? new Prisma.Decimal(priceBuying) : undefined,
        priceSelling: priceSelling !== undefined ? new Prisma.Decimal(priceSelling) : undefined,
        stock,
        unit,
        category
      }
    });

    const buyPrice = parseFloat(updatedProduct.priceBuying.toString());
    const sellPrice = parseFloat(updatedProduct.priceSelling.toString());
    const profit = sellPrice - buyPrice;

    res.json({
      ...updatedProduct,
      profit: profit.toFixed(2),
      marginPercent: buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(2) : '0'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Product moved to trash' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newStock = product.stock;
    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock -= quantity;
      if (newStock < 0) newStock = 0;
    } else {
      newStock = quantity; // Direct set
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stock: newStock }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};
