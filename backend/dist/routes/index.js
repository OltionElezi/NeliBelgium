"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const authController = __importStar(require("../controllers/authController"));
const companyController = __importStar(require("../controllers/companyController"));
const clientController = __importStar(require("../controllers/clientController"));
const invoiceController = __importStar(require("../controllers/invoiceController"));
const workerController = __importStar(require("../controllers/workerController"));
const expenseController = __importStar(require("../controllers/expenseController"));
const trashController = __importStar(require("../controllers/trashController"));
const productController = __importStar(require("../controllers/productController"));
const companyExpenseController = __importStar(require("../controllers/companyExpenseController"));
const electricalProjectController = __importStar(require("../controllers/electricalProjectController"));
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ============ PUBLIC CONTACT FORM ROUTE ============
router.post('/contact', async (req, res) => {
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
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});
// ============ AUTH ROUTES ============
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth_1.authenticateToken, authController.getProfile);
// ============ COMPANY ROUTES ============
router.get('/company', auth_1.authenticateToken, companyController.getCompany);
router.put('/company', auth_1.authenticateToken, companyController.updateCompany);
router.post('/company/logo', auth_1.authenticateToken, companyController.uploadLogo);
// ============ CLIENT ROUTES ============
router.get('/clients', auth_1.authenticateToken, clientController.getAllClients);
router.get('/clients/:id', auth_1.authenticateToken, clientController.getClientById);
router.post('/clients', auth_1.authenticateToken, clientController.createClient);
router.put('/clients/:id', auth_1.authenticateToken, clientController.updateClient);
router.delete('/clients/:id', auth_1.authenticateToken, clientController.deleteClient);
// ============ PRODUCT ROUTES ============
router.get('/products', auth_1.authenticateToken, productController.getAllProducts);
router.get('/products/:id', auth_1.authenticateToken, productController.getProductById);
router.post('/products', auth_1.authenticateToken, productController.createProduct);
router.put('/products/:id', auth_1.authenticateToken, productController.updateProduct);
router.delete('/products/:id', auth_1.authenticateToken, productController.deleteProduct);
router.patch('/products/:id/stock', auth_1.authenticateToken, productController.updateStock);
// ============ INVOICE ROUTES ============
router.get('/invoices', auth_1.authenticateToken, invoiceController.getAllInvoices);
router.get('/invoices/:id', auth_1.authenticateToken, invoiceController.getInvoiceById);
router.post('/invoices', auth_1.authenticateToken, invoiceController.createInvoice);
router.put('/invoices/:id', auth_1.authenticateToken, invoiceController.updateInvoice);
router.delete('/invoices/:id', auth_1.authenticateToken, invoiceController.deleteInvoice);
router.get('/invoices/:id/pdf', auth_1.authenticateToken, invoiceController.getInvoicePdf);
router.patch('/invoices/:id/status', auth_1.authenticateToken, invoiceController.updateInvoiceStatus);
// Send invoice by email
router.post('/invoices/:id/send', auth_1.authenticateToken, async (req, res) => {
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
        const result = await (0, emailService_1.sendInvoiceEmail)(invoice, company, email);
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
    }
    catch (error) {
        console.error('Send invoice error:', error);
        res.status(500).json({ error: 'Failed to send invoice' });
    }
});
// ============ WORKER ROUTES ============
router.get('/workers', auth_1.authenticateToken, workerController.getAllWorkers);
router.get('/workers/:id', auth_1.authenticateToken, workerController.getWorkerById);
router.post('/workers', auth_1.authenticateToken, workerController.createWorker);
router.put('/workers/:id', auth_1.authenticateToken, workerController.updateWorker);
router.delete('/workers/:id', auth_1.authenticateToken, workerController.deleteWorker);
// ============ WORKER EXPENSE ROUTES ============
router.get('/expenses', auth_1.authenticateToken, expenseController.getAllExpenses);
router.get('/workers/:workerId/expenses', auth_1.authenticateToken, expenseController.getWorkerExpenses);
router.post('/workers/:workerId/expenses', auth_1.authenticateToken, expenseController.createExpense);
router.put('/expenses/:id', auth_1.authenticateToken, expenseController.updateExpense);
router.delete('/expenses/:id', auth_1.authenticateToken, expenseController.deleteExpense);
// ============ COMPANY EXPENSE ROUTES ============
router.get('/company-expenses', auth_1.authenticateToken, companyExpenseController.getAllCompanyExpenses);
router.get('/company-expenses/summary', auth_1.authenticateToken, companyExpenseController.getExpenseSummary);
router.get('/company-expenses/:id', auth_1.authenticateToken, companyExpenseController.getCompanyExpenseById);
router.post('/company-expenses', auth_1.authenticateToken, companyExpenseController.createCompanyExpense);
router.put('/company-expenses/:id', auth_1.authenticateToken, companyExpenseController.updateCompanyExpense);
router.delete('/company-expenses/:id', auth_1.authenticateToken, companyExpenseController.deleteCompanyExpense);
// ============ ELECTRICAL PROJECT ROUTES ============
router.get('/electrical-projects', auth_1.authenticateToken, electricalProjectController.getAllProjects);
router.get('/electrical-projects/:id', auth_1.authenticateToken, electricalProjectController.getProjectById);
router.post('/electrical-projects', auth_1.authenticateToken, electricalProjectController.createProject);
router.put('/electrical-projects/:id', auth_1.authenticateToken, electricalProjectController.updateProject);
router.delete('/electrical-projects/:id', auth_1.authenticateToken, electricalProjectController.deleteProject);
router.post('/electrical-projects/:id/diagrams', auth_1.authenticateToken, electricalProjectController.addDiagram);
router.put('/electrical-projects/:id/diagrams/:diagramId', auth_1.authenticateToken, electricalProjectController.updateDiagram);
router.delete('/electrical-projects/:id/diagrams/:diagramId', auth_1.authenticateToken, electricalProjectController.deleteDiagram);
router.post('/electrical-projects/:id/duplicate', auth_1.authenticateToken, electricalProjectController.duplicateProject);
router.get('/electrical-projects/:id/pdf', auth_1.authenticateToken, electricalProjectController.getProjectPdf);
// ============ TRASH ROUTES ============
router.get('/trash', auth_1.authenticateToken, trashController.getTrash);
router.post('/trash/:type/:id/restore', auth_1.authenticateToken, trashController.restoreItem);
router.delete('/trash/:type/:id', auth_1.authenticateToken, trashController.permanentDelete);
router.delete('/trash', auth_1.authenticateToken, trashController.emptyTrash);
// ============ UTILITY ROUTES ============
router.get('/email/test', auth_1.authenticateToken, async (req, res) => {
    const result = await (0, emailService_1.testEmailConnection)();
    res.json(result);
});
// Dashboard stats
router.get('/dashboard/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const [clientCount, invoiceCount, workerCount, productCount, paidInvoices, pendingInvoices, totalProfit, workerExpenses, companyExpenses] = await Promise.all([
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
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map