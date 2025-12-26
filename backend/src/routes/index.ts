import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as companyController from '../controllers/companyController';
import * as clientController from '../controllers/clientController';
import * as invoiceController from '../controllers/invoiceController';
import * as workerController from '../controllers/workerController';
import * as expenseController from '../controllers/expenseController';
import * as trashController from '../controllers/trashController';
import * as productController from '../controllers/productController';
import * as companyExpenseController from '../controllers/companyExpenseController';
import * as electricalProjectController from '../controllers/electricalProjectController';
import { sendInvoiceEmail, testEmailConnection } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

// ============ PUBLIC CONTACT FORM ROUTE ============
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, projectType, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const contactEmail = process.env.CONTACT_EMAIL || 'nelicakani2@gmail.com';

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: contactEmail,
      subject: `Nieuw Contact Formulier: ${projectType || 'Algemeen'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">L&E Bouw</h1>
            <p style="color: white; margin: 5px 0;">Nieuw Contactverzoek</p>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Contactgegevens</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Naam:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Telefoon:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">E-mail:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Projecttype:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${projectType || 'Niet opgegeven'}</td>
              </tr>
            </table>
            <h3 style="color: #1f2937; margin-top: 25px;">Bericht:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background-color: #1f2937; padding: 15px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">Dit bericht is verzonden via het contactformulier op lebouw.be</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Also send a confirmation email to the customer
    const confirmationMail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Bedankt voor uw bericht - L&E Bouw',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">L&E Bouw</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Bedankt ${name}!</h2>
            <p style="color: #4b5563;">Wij hebben uw bericht ontvangen en nemen zo spoedig mogelijk contact met u op.</p>
            <p style="color: #4b5563;">Gewoonlijk reageren wij binnen 24 uur op werkdagen.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;"><strong>Uw bericht:</strong></p>
            <p style="color: #6b7280; font-size: 14px; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="background-color: #1f2937; padding: 15px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">L&E Bouw | Gent | +32 465 28 26 68</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(confirmationMail);

    res.json({ success: true, message: 'Bericht verzonden!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// ============ AUTH ROUTES ============
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile as any);

// ============ COMPANY ROUTES ============
router.get('/company', authenticateToken, companyController.getCompany as any);
router.put('/company', authenticateToken, companyController.updateCompany as any);
router.post('/company/logo', authenticateToken, companyController.uploadLogo as any);

// ============ CLIENT ROUTES ============
router.get('/clients', authenticateToken, clientController.getAllClients as any);
router.get('/clients/:id', authenticateToken, clientController.getClientById as any);
router.post('/clients', authenticateToken, clientController.createClient as any);
router.put('/clients/:id', authenticateToken, clientController.updateClient as any);
router.delete('/clients/:id', authenticateToken, clientController.deleteClient as any);

// ============ PRODUCT ROUTES ============
router.get('/products', authenticateToken, productController.getAllProducts as any);
router.get('/products/:id', authenticateToken, productController.getProductById as any);
router.post('/products', authenticateToken, productController.createProduct as any);
router.put('/products/:id', authenticateToken, productController.updateProduct as any);
router.delete('/products/:id', authenticateToken, productController.deleteProduct as any);
router.patch('/products/:id/stock', authenticateToken, productController.updateStock as any);

// ============ INVOICE ROUTES ============
router.get('/invoices', authenticateToken, invoiceController.getAllInvoices as any);
router.get('/invoices/:id', authenticateToken, invoiceController.getInvoiceById as any);
router.post('/invoices', authenticateToken, invoiceController.createInvoice as any);
router.put('/invoices/:id', authenticateToken, invoiceController.updateInvoice as any);
router.delete('/invoices/:id', authenticateToken, invoiceController.deleteInvoice as any);
router.get('/invoices/:id/pdf', authenticateToken, invoiceController.getInvoicePdf as any);
router.patch('/invoices/:id/status', authenticateToken, invoiceController.updateInvoiceStatus as any);

// Send invoice by email
router.post('/invoices/:id/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body; // Optional override email

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

    const result = await sendInvoiceEmail(invoice, company, email);

    if (result.success) {
      // Update invoice status and sentAt
      await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// ============ WORKER ROUTES ============
router.get('/workers', authenticateToken, workerController.getAllWorkers as any);
router.get('/workers/:id', authenticateToken, workerController.getWorkerById as any);
router.post('/workers', authenticateToken, workerController.createWorker as any);
router.put('/workers/:id', authenticateToken, workerController.updateWorker as any);
router.delete('/workers/:id', authenticateToken, workerController.deleteWorker as any);

// ============ WORKER EXPENSE ROUTES ============
router.get('/expenses', authenticateToken, expenseController.getAllExpenses as any);
router.get('/workers/:workerId/expenses', authenticateToken, expenseController.getWorkerExpenses as any);
router.post('/workers/:workerId/expenses', authenticateToken, expenseController.createExpense as any);
router.put('/expenses/:id', authenticateToken, expenseController.updateExpense as any);
router.delete('/expenses/:id', authenticateToken, expenseController.deleteExpense as any);

// ============ COMPANY EXPENSE ROUTES ============
router.get('/company-expenses', authenticateToken, companyExpenseController.getAllCompanyExpenses as any);
router.get('/company-expenses/summary', authenticateToken, companyExpenseController.getExpenseSummary as any);
router.get('/company-expenses/:id', authenticateToken, companyExpenseController.getCompanyExpenseById as any);
router.post('/company-expenses', authenticateToken, companyExpenseController.createCompanyExpense as any);
router.put('/company-expenses/:id', authenticateToken, companyExpenseController.updateCompanyExpense as any);
router.delete('/company-expenses/:id', authenticateToken, companyExpenseController.deleteCompanyExpense as any);

// ============ ELECTRICAL PROJECT ROUTES ============
router.get('/electrical-projects', authenticateToken, electricalProjectController.getAllProjects as any);
router.get('/electrical-projects/:id', authenticateToken, electricalProjectController.getProjectById as any);
router.post('/electrical-projects', authenticateToken, electricalProjectController.createProject as any);
router.put('/electrical-projects/:id', authenticateToken, electricalProjectController.updateProject as any);
router.delete('/electrical-projects/:id', authenticateToken, electricalProjectController.deleteProject as any);
router.post('/electrical-projects/:id/diagrams', authenticateToken, electricalProjectController.addDiagram as any);
router.put('/electrical-projects/:id/diagrams/:diagramId', authenticateToken, electricalProjectController.updateDiagram as any);
router.delete('/electrical-projects/:id/diagrams/:diagramId', authenticateToken, electricalProjectController.deleteDiagram as any);
router.post('/electrical-projects/:id/duplicate', authenticateToken, electricalProjectController.duplicateProject as any);
router.get('/electrical-projects/:id/pdf', authenticateToken, electricalProjectController.getProjectPdf as any);

// ============ TRASH ROUTES ============
router.get('/trash', authenticateToken, trashController.getTrash as any);
router.post('/trash/:type/:id/restore', authenticateToken, trashController.restoreItem as any);
router.delete('/trash/:type/:id', authenticateToken, trashController.permanentDelete as any);
router.delete('/trash', authenticateToken, trashController.emptyTrash as any);

// ============ UTILITY ROUTES ============
router.get('/email/test', authenticateToken, async (req: Request, res: Response) => {
  const result = await testEmailConnection();
  res.json(result);
});

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const [
      clientCount,
      invoiceCount,
      workerCount,
      productCount,
      paidInvoices,
      pendingInvoices,
      totalProfit,
      workerExpenses,
      companyExpenses
    ] = await Promise.all([
      prisma.client.count({ where: { deletedAt: null } }),
      prisma.invoice.count({ where: { deletedAt: null } }),
      prisma.worker.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', deletedAt: null },
        _sum: { total: true, profit: true }
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ['DRAFT', 'SENT'] }, deletedAt: null },
        _sum: { total: true }
      }),
      prisma.invoice.aggregate({
        where: { deletedAt: null },
        _sum: { profit: true }
      }),
      prisma.expense.aggregate({
        where: { deletedAt: null },
        _sum: { amount: true }
      }),
      prisma.companyExpense.aggregate({
        where: { deletedAt: null },
        _sum: { amount: true }
      })
    ]);

    const totalExpenses = (parseFloat(workerExpenses._sum.amount?.toString() || '0') +
      parseFloat(companyExpenses._sum.amount?.toString() || '0')).toFixed(2);

    res.json({
      clients: clientCount,
      invoices: invoiceCount,
      workers: workerCount,
      products: productCount,
      revenue: {
        paid: paidInvoices._sum.total?.toString() || '0',
        pending: pendingInvoices._sum.total?.toString() || '0'
      },
      profit: {
        total: totalProfit._sum.profit?.toString() || '0',
        paid: paidInvoices._sum.profit?.toString() || '0'
      },
      expenses: {
        worker: workerExpenses._sum.amount?.toString() || '0',
        company: companyExpenses._sum.amount?.toString() || '0',
        total: totalExpenses
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;
