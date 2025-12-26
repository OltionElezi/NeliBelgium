import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../services/api';
import { Invoice, InvoiceStatus } from '../types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Send,
  CheckCircle,
  Eye,
  Download,
  Globe,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const pdfLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
];

const invoiceStatuses: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pdfPreview, setPdfPreview] = useState<{ show: boolean; url: string; invoiceNumber: string }>({
    show: false,
    url: '',
    invoiceNumber: ''
  });
  const [languageModal, setLanguageModal] = useState<{
    show: boolean;
    invoice: Invoice | null;
    action: 'view' | 'download' | null;
  }>({
    show: false,
    invoice: null,
    action: null
  });
  const [statusDropdown, setStatusDropdown] = useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setStatusDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadInvoices = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const response = await invoiceApi.getAll(params);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(t('invoices.deleteConfirm'))) {
      try {
        await invoiceApi.delete(invoice.id);
        toast.success('Invoice moved to trash');
        loadInvoices();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    if (!invoice.client?.email) {
      toast.error('Client has no email address');
      return;
    }

    if (window.confirm(t('invoices.sendConfirm'))) {
      try {
        await invoiceApi.send(invoice.id);
        toast.success(t('invoices.sentSuccess'));
        loadInvoices();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send invoice');
      }
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await invoiceApi.updateStatus(invoice.id, 'PAID');
      toast.success('Invoice marked as paid');
      loadInvoices();
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: InvoiceStatus) => {
    try {
      await invoiceApi.updateStatus(invoice.id, newStatus);
      toast.success(t(`invoices.status${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`));
      setStatusDropdown(null);
      loadInvoices();
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const openLanguageModal = (invoice: Invoice, action: 'view' | 'download') => {
    setLanguageModal({ show: true, invoice, action });
  };

  const handleLanguageSelect = async (langCode: string) => {
    const { invoice, action } = languageModal;
    if (!invoice) return;

    setLanguageModal({ show: false, invoice: null, action: null });

    if (action === 'view') {
      try {
        const response = await invoiceApi.getPdf(invoice.id, langCode);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfPreview({ show: true, url, invoiceNumber: invoice.invoiceNumber });
      } catch (error) {
        toast.error('Failed to load PDF');
      }
    } else if (action === 'download') {
      try {
        const response = await invoiceApi.getPdf(invoice.id, langCode);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        toast.error('Failed to download PDF');
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles: Record<string, string> = {
      DRAFT: 'badge-gray',
      SENT: 'badge-info',
      PAID: 'badge-success',
      OVERDUE: 'badge-danger',
      CANCELLED: 'badge-warning'
    };
    return styles[status] || 'badge-gray';
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('invoices.title')}</h1>
        <Link to="/dashboard/invoices/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('invoices.newInvoice')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="form-input pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-input w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="DRAFT">{t('invoices.statusDraft')}</option>
          <option value="SENT">{t('invoices.statusSent')}</option>
          <option value="PAID">{t('invoices.statusPaid')}</option>
          <option value="OVERDUE">{t('invoices.statusOverdue')}</option>
          <option value="CANCELLED">{t('invoices.statusCancelled')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('invoices.noInvoices')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>{t('invoices.invoiceNumber')}</th>
                  <th>{t('invoices.client')}</th>
                  <th>{t('invoices.issueDate')}</th>
                  <th>{t('common.total')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>{invoice.client?.name}</td>
                    <td>{formatDate(invoice.issueDate)}</td>
                    <td className="font-semibold">{formatCurrency(invoice.total)}</td>
                    <td className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdown(statusDropdown === invoice.id ? null : invoice.id);
                        }}
                        className={`${getStatusBadge(invoice.status)} cursor-pointer hover:opacity-80 inline-flex items-center gap-1`}
                      >
                        {t(`invoices.status${invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}`)}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {statusDropdown === invoice.id && (
                        <div className="absolute left-0 top-full z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                          {invoiceStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(invoice, status);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                invoice.status === status ? 'bg-gray-50 font-medium' : ''
                              }`}
                            >
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                status === 'DRAFT' ? 'bg-gray-400' :
                                status === 'SENT' ? 'bg-blue-400' :
                                status === 'PAID' ? 'bg-green-400' :
                                status === 'OVERDUE' ? 'bg-red-400' :
                                'bg-yellow-400'
                              }`}></span>
                              {t(`invoices.status${status.charAt(0) + status.slice(1).toLowerCase()}`)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openLanguageModal(invoice, 'view')}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('invoices.viewPdf')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openLanguageModal(invoice, 'download')}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('common.download')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <>
                            <button
                              onClick={() => handleSendEmail(invoice)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title={t('invoices.sendEmail')}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMarkAsPaid(invoice)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t('invoices.markAsPaid')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/dashboard/invoices/${invoice.id}/edit`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Language Selection Modal */}
      {languageModal.show && (
        <div className="modal-overlay" onClick={() => setLanguageModal({ show: false, invoice: null, action: null })}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold">{t('invoices.selectLanguage')}</h2>
            </div>
            <p className="text-gray-500 mb-4">{t('invoices.pdfLanguage')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pdfLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                >
                  <span className="text-2xl block mb-1">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setLanguageModal({ show: false, invoice: null, action: null })}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview.show && (
        <div className="modal-overlay" onClick={() => setPdfPreview({ show: false, url: '', invoiceNumber: '' })}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{pdfPreview.invoiceNumber}</h2>
              <div className="flex items-center gap-2">
                <a
                  href={pdfPreview.url}
                  download={`invoice-${pdfPreview.invoiceNumber}.pdf`}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  {t('common.download')}
                </a>
                <button
                  onClick={() => setPdfPreview({ show: false, url: '', invoiceNumber: '' })}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            {/* Mobile-friendly PDF display */}
            <div className="w-full h-[70vh] overflow-auto">
              <object
                data={pdfPreview.url}
                type="application/pdf"
                className="w-full h-full hidden md:block"
              >
                <iframe
                  src={pdfPreview.url}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </object>
              {/* Mobile fallback */}
              <div className="md:hidden flex flex-col items-center justify-center h-full p-6 text-center">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">{t('invoices.pdfMobileNote') || 'PDF preview may not work on mobile. Please download to view.'}</p>
                <a
                  href={pdfPreview.url}
                  download={`invoice-${pdfPreview.invoiceNumber}.pdf`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('common.download')} PDF
                </a>
                <a
                  href={pdfPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-3 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  {t('invoices.openInNewTab') || 'Open in new tab'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
