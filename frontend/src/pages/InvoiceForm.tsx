import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceApi, clientApi } from '../services/api';
import { Client, InvoiceItem } from '../types';
import { Plus, Trash2, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ show: boolean; url: string }>({ show: false, url: '' });

  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    btwRate: 21
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit: 'stuk', unitPrice: '', total: '' }
  ]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const clientsRes = await clientApi.getAll();
      setClients(clientsRes.data);

      if (isEditing) {
        const invoiceRes = await invoiceApi.getById(parseInt(id));
        const invoice = invoiceRes.data;
        setFormData({
          clientId: invoice.clientId.toString(),
          invoiceNumber: invoice.invoiceNumber || '',
          issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
          notes: invoice.notes || '',
          btwRate: parseFloat(invoice.btwRate)
        });
        setItems(invoice.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        })));
      }
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'stuk', unitPrice: '', total: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
      const numQuantity = Number(quantity) || 0;
      const numUnitPrice = Number(unitPrice) || 0;
      newItems[index].total = numQuantity * numUnitPrice || '';
    }

    setItems(newItems);
  };

  // Reverse calculation: when user enters total with tax, calculate unitPrice
  const updateItemFromTotal = (index: number, totalWithTax: number | string) => {
    if (totalWithTax === '' || totalWithTax === 0) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], unitPrice: '', total: '' };
      setItems(newItems);
      return;
    }

    const numTotal = Number(totalWithTax) || 0;
    const btwMultiplier = 1 + (formData.btwRate / 100);
    const subtotalForItem = numTotal / btwMultiplier;
    const quantity = Number(items[index].quantity) || 1;
    const unitPrice = Math.round((subtotalForItem / quantity) * 100) / 100;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      unitPrice: unitPrice,
      total: quantity * unitPrice
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const calculateBtw = () => {
    return calculateSubtotal() * (formData.btwRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateBtw();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }

    if (items.some(item => !item.description || item.unitPrice === '' || Number(item.unitPrice) <= 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clientId: parseInt(formData.clientId),
        invoiceNumber: formData.invoiceNumber || undefined,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || null,
        notes: formData.notes,
        btwRate: formData.btwRate,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit: item.unit,
          unitPrice: Number(item.unitPrice) || 0
        }))
      };

      if (isEditing) {
        await invoiceApi.update(parseInt(id), payload);
        toast.success('Invoice updated successfully');
      } else {
        await invoiceApi.create(payload);
        toast.success('Invoice created successfully');
      }
      navigate('/dashboard/invoices');
    } catch (error) {
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (isEditing) {
      try {
        const response = await invoiceApi.getPdf(parseInt(id));
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfPreview({ show: true, url });
      } catch (error) {
        toast.error('Failed to load preview');
      }
    }
  };

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
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? t('invoices.editInvoice') : t('invoices.newInvoice')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('invoices.client')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">{t('invoices.client')} *</label>
              <select
                className="form-input"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">{t('invoices.invoiceNumber')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder={t('invoices.autoGenerated')}
              />
            </div>
            <div>
              <label className="form-label">{t('invoices.issueDate')}</label>
              <input
                type="date"
                className="form-input"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">{t('invoices.dueDate')}</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('invoices.items')}</h2>
            <button type="button" onClick={addItem} className="btn-secondary text-sm">
              <Plus className="w-4 h-4 mr-1" />
              {t('invoices.addItem')}
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <label className="form-label text-xs">{t('invoices.description')}</label>
                  <textarea
                    className="form-input text-sm"
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description..."
                    required
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="form-label text-xs">{t('invoices.quantity')}</label>
                  <input
                    type="number"
                    className="form-input text-sm"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="form-label text-xs">{t('invoices.unit')}</label>
                  <input
                    type="text"
                    className="form-input text-sm"
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    placeholder="stuk"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <label className="form-label text-xs">{t('invoices.unitPrice')}</label>
                  <input
                    type="number"
                    className="form-input text-sm"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="form-label text-xs">{t('invoices.lineTotal')}</label>
                  <p className="form-input bg-gray-100 text-sm font-medium">
                    {formatCurrency(Number(item.total) || 0)}
                  </p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="form-label text-xs">{t('invoices.totalInclBtw') || 'Total incl. BTW'}</label>
                  <input
                    type="number"
                    className="form-input text-sm bg-blue-50 border-blue-200"
                    min="0"
                    step="0.01"
                    placeholder="Enter total..."
                    onChange={(e) => updateItemFromTotal(index, e.target.value === '' ? '' : parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-6 md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">{t('invoices.subtotal')}</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{t('invoices.btw')}</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded text-sm"
                    value={formData.btwRate}
                    onChange={(e) => setFormData({ ...formData, btwRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-medium">{formatCurrency(calculateBtw())}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>{t('common.total')}</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('common.notes')}</h2>
          <textarea
            className="form-input"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {isEditing && (
              <button type="button" onClick={handlePreview} className="btn-secondary">
                <Eye className="w-5 h-5 mr-2" />
                {t('common.preview')}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/dashboard/invoices')} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </form>

      {/* PDF Preview Modal */}
      {pdfPreview.show && (
        <div className="modal-overlay" onClick={() => setPdfPreview({ show: false, url: '' })}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{t('common.preview')}</h2>
              <button
                onClick={() => setPdfPreview({ show: false, url: '' })}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <iframe
              src={pdfPreview.url}
              className="w-full h-[70vh]"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
