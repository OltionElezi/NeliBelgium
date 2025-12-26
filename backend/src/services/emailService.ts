import nodemailer from 'nodemailer';
import { Invoice, Client, Company } from '@prisma/client';
import { generateInvoicePdf } from './pdfService';

type InvoiceWithDetails = Invoice & {
  client: Client;
  items: any[];
};

// Create transporter with Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

export const sendInvoiceEmail = async (
  invoice: InvoiceWithDetails,
  company: Company,
  recipientEmail?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = createTransporter();

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf(invoice, company);

    // Determine recipient
    const to = recipientEmail || invoice.client.email;

    if (!to) {
      return {
        success: false,
        message: 'No email address provided for the client'
      };
    }

    // Email subject and body based on language
    const subject = `${invoice.invoiceNumber} - ${company.name}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Invoice ${invoice.invoiceNumber}</h2>

        <p>Dear ${invoice.client.name},</p>

        <p>Please find attached your invoice from <strong>${company.name}</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(invoice.issueDate)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatCurrency(invoice.total)}</strong></td>
          </tr>
        </table>

        <p>Bank Details for Payment:</p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Account:</strong> ${company.bankAccount}</li>
          <li><strong>Bank Code:</strong> ${company.bankCode}</li>
        </ul>

        <p>If you have any questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br>
        <strong>${company.ownerName}</strong><br>
        ${company.name}<br>
        ${company.email}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This email was sent automatically. The invoice is attached as a PDF file.
        </p>
      </div>
    `;

    const textBody = `
Invoice ${invoice.invoiceNumber}

Dear ${invoice.client.name},

Please find attached your invoice from ${company.name}.

Invoice Number: ${invoice.invoiceNumber}
Date: ${formatDate(invoice.issueDate)}
Total Amount: ${formatCurrency(invoice.total)}

Bank Details for Payment:
Account: ${company.bankAccount}
Bank Code: ${company.bankCode}

If you have any questions, please don't hesitate to contact us.

Best regards,
${company.ownerName}
${company.name}
${company.email}
    `;

    // Send email
    const mailOptions = {
      from: `"${company.name}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Invoice sent successfully to ${to}`
    };
  } catch (error: any) {
    console.error('Send email error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
};

export const testEmailConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return {
      success: true,
      message: 'Email connection successful'
    };
  } catch (error: any) {
    console.error('Email connection test error:', error);
    return {
      success: false,
      message: error.message || 'Email connection failed'
    };
  }
};

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount: any): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  return '\u20AC ' + num.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
