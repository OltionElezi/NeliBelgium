import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { expenseApi, workerApi } from '../services/api';
import { Expense, Worker } from '../types';
import { Plus, Pencil, Trash2, X, Search, Filter, Calendar, Wallet, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['salary', 'advance', 'materials', 'transport', 'food', 'other'];

const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [workerFilter, setWorkerFilter] = useState(searchParams.get('workerId') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [totalExpenses, setTotalExpenses] = useState('0');
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    workerId: '',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [workerFilter, categoryFilter, startDate, endDate]);

  const loadData = async () => {
    try {
      const [workersRes, expensesRes] = await Promise.all([
        workerApi.getAll(),
        expenseApi.getAll({ category: categoryFilter || undefined })
      ]);
      setWorkers(workersRes.data);

      let filteredExpenses = expensesRes.data.expenses || expensesRes.data;
      if (workerFilter) {
        filteredExpenses = filteredExpenses.filter((e: Expense) => e.workerId === parseInt(workerFilter));
      }
      // Filter by date range
      if (startDate) {
        filteredExpenses = filteredExpenses.filter((e: Expense) => new Date(e.date) >= new Date(startDate));
      }
      if (endDate) {
        filteredExpenses = filteredExpenses.filter((e: Expense) => new Date(e.date) <= new Date(endDate));
      }
      setExpenses(filteredExpenses);

      // Calculate total from filtered expenses
      const total = filteredExpenses.reduce((sum: number, e: Expense) => sum + parseFloat(e.amount), 0);
      setTotalExpenses(total.toString());

      // Calculate by category
      const byCategory = filteredExpenses.reduce((acc: Record<string, number>, e: Expense) => {
        const cat = e.category || 'other';
        acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
        return acc;
      }, {} as Record<string, number>);
      setExpensesByCategory(byCategory);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        workerId: expense.workerId.toString(),
        amount: expense.amount,
        description: expense.description || '',
        category: expense.category || '',
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else {
      setEditingExpense(null);
      setFormData({
        workerId: workerFilter || '',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.workerId) {
      toast.error('Please select a worker');
      return;
    }

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date
      };

      if (editingExpense) {
        await expenseApi.update(editingExpense.id, payload);
        toast.success('Expense updated successfully');
      } else {
        await expenseApi.create(parseInt(formData.workerId), payload);
        toast.success('Expense created successfully');
      }
      closeModal();
      loadData();
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (window.confirm(t('expenses.deleteConfirm'))) {
      try {
        await expenseApi.delete(expense.id);
        toast.success('Expense moved to trash');
        loadData();
      } catch (error) {
        toast.error('Failed to delete expense');
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

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">{t('expenses.title')}</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('expenses.newExpense')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('expenses.totalExpenses')}</p>
              <p className="text-xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('expenses.count')}</p>
              <p className="text-xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="card p-4">
          <h3 className="font-medium mb-3">{t('expenses.byCategory')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(expensesByCategory).map(([cat, amount]) => (
              <div key={cat} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 capitalize">{t(`expenses.categories.${cat}`)}</p>
                <p className="font-bold text-red-600">-{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
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
          className="form-input w-full lg:w-40"
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value)}
        >
          <option value="">{t('expenses.allWorkers')}</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
        <select
          className="form-input w-full lg:w-40"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">{t('expenses.allCategories')}</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`expenses.categories.${cat}`)}
            </option>
          ))}
        </select>
        <div className="flex gap-2 items-center">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="form-input w-full lg:w-36"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder={t('common.from')}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="form-input w-full lg:w-36"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder={t('common.to')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('expenses.noExpenses')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>{t('common.date')}</th>
                  <th>{t('expenses.worker')}</th>
                  <th>{t('expenses.category')}</th>
                  <th>{t('expenses.description')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td className="font-medium">{expense.worker?.name}</td>
                    <td>
                      {expense.category && (
                        <span className="badge-info">
                          {t(`expenses.categories.${expense.category}`)}
                        </span>
                      )}
                    </td>
                    <td>{expense.description || '-'}</td>
                    <td className="font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(expense)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingExpense ? t('expenses.editExpense') : t('expenses.newExpense')}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">{t('expenses.worker')} *</label>
                <select
                  className="form-input"
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  required
                  disabled={!!editingExpense}
                >
                  <option value="">Select worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">{t('common.amount')} *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="form-label">{t('expenses.category')}</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`expenses.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">{t('common.date')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{t('expenses.description')}</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
