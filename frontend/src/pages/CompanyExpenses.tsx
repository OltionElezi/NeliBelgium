import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { companyExpenseApi } from '../services/api';
import { CompanyExpense } from '../types';
import { Plus, Pencil, Trash2, Building2, Search, Calendar, Filter, Wallet, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  'utilities',
  'rent',
  'equipment',
  'supplies',
  'insurance',
  'maintenance',
  'marketing',
  'other'
];

const CompanyExpenses: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<CompanyExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'other',
    vendor: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadExpenses();
  }, [filterCategory, startDate, endDate]);

  const loadExpenses = async () => {
    try {
      const params = filterCategory ? { category: filterCategory } : {};
      const response = await companyExpenseApi.getAll(params);
      // Backend returns { expenses, total, count, byCategory }
      const data = response.data;
      let expenseList = Array.isArray(data) ? data : (data.expenses || []);

      // Filter by date range
      if (startDate) {
        expenseList = expenseList.filter((e: CompanyExpense) => new Date(e.date) >= new Date(startDate));
      }
      if (endDate) {
        expenseList = expenseList.filter((e: CompanyExpense) => new Date(e.date) <= new Date(endDate));
      }

      setExpenses(expenseList);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await companyExpenseApi.update(editingExpense.id, formData);
        toast.success(t('companyExpenses.updated'));
      } else {
        await companyExpenseApi.create(formData);
        toast.success(t('companyExpenses.created'));
      }
      loadExpenses();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await companyExpenseApi.delete(id);
      toast.success(t('companyExpenses.deleted'));
      loadExpenses();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const openEditModal = (expense: CompanyExpense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      description: expense.description || '',
      category: expense.category,
      vendor: expense.vendor || '',
      reference: expense.reference || '',
      date: expense.date.split('T')[0]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      amount: '',
      description: '',
      category: 'other',
      vendor: '',
      reference: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('companyExpenses.title')}</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('companyExpenses.add')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('companyExpenses.totalExpenses')}</p>
              <p className="text-xl font-bold text-red-600">-{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('companyExpenses.thisMonth')}</p>
              <p className="text-xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="card p-4">
          <h3 className="font-medium mb-3">{t('companyExpenses.byCategory')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([cat, amount]) => (
              <div key={cat} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 capitalize">{t(`companyExpenses.categories.${cat}`)}</p>
                <p className="font-bold text-red-600">-{amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-12"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input pl-12 pr-10"
          >
            <option value="">{t('companyExpenses.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{t(`companyExpenses.categories.${cat}`)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="form-input w-full lg:w-36"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="form-input w-full lg:w-36"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('companyExpenses.category')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">{t('companyExpenses.vendor')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('companyExpenses.description')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.amount')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {t(`companyExpenses.categories.${expense.category}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{expense.vendor || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{expense.description || '-'}</p>
                    {expense.reference && (
                      <p className="text-xs text-gray-500">Ref: {expense.reference}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-red-600">-{parseFloat(expense.amount).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
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
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('companyExpenses.noExpenses')}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingExpense ? t('companyExpenses.edit') : t('companyExpenses.add')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t('common.amount')}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">{t('common.date')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">{t('companyExpenses.category')}</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{t(`companyExpenses.categories.${cat}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('companyExpenses.vendor')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">{t('companyExpenses.description')}</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">{t('companyExpenses.reference')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Invoice #, Receipt #, etc."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingExpense ? t('common.save') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyExpenses;
