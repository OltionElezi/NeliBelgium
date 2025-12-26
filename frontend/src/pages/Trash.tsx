import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trashApi } from '../services/api';
import { TrashData, TrashItem } from '../types';
import { Trash2, RotateCcw, AlertTriangle, Users, FileText, HardHat, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const Trash: React.FC = () => {
  const { t } = useTranslation();
  const [trashData, setTrashData] = useState<TrashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'invoices' | 'workers' | 'expenses'>('invoices');

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      const response = await trashApi.getAll();
      setTrashData(response.data);
    } catch (error) {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type: string, id: number) => {
    if (window.confirm(t('trash.restoreConfirm'))) {
      try {
        await trashApi.restore(type, id);
        toast.success('Item restored successfully');
        loadTrash();
      } catch (error) {
        toast.error('Failed to restore item');
      }
    }
  };

  const handlePermanentDelete = async (type: string, id: number) => {
    if (window.confirm(t('trash.deleteConfirm'))) {
      try {
        await trashApi.permanentDelete(type, id);
        toast.success('Item permanently deleted');
        loadTrash();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm(t('trash.emptyConfirm'))) {
      try {
        await trashApi.empty();
        toast.success('Trash emptied successfully');
        loadTrash();
      } catch (error) {
        toast.error('Failed to empty trash');
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const tabs = [
    { id: 'invoices', label: t('nav.invoices'), icon: FileText, count: trashData?.summary.totalInvoices || 0 },
    { id: 'clients', label: t('nav.clients'), icon: Users, count: trashData?.summary.totalClients || 0 },
    { id: 'workers', label: t('nav.workers'), icon: HardHat, count: trashData?.summary.totalWorkers || 0 },
    { id: 'expenses', label: t('nav.expenses'), icon: Wallet, count: trashData?.summary.totalExpenses || 0 }
  ];

  const getCurrentItems = (): TrashItem[] => {
    if (!trashData) return [];
    return trashData[activeTab] || [];
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('trash.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {t('trash.itemsWillDelete')}
          </p>
        </div>
        {(trashData?.summary.total || 0) > 0 && (
          <button onClick={handleEmptyTrash} className="btn-danger">
            <Trash2 className="w-5 h-5 mr-2" />
            {t('trash.emptyTrash')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {getCurrentItems().length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {t('trash.noItems')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {activeTab === 'invoices' && (
                    <>
                      <th>{t('invoices.invoiceNumber')}</th>
                      <th>{t('invoices.client')}</th>
                      <th>{t('common.total')}</th>
                    </>
                  )}
                  {activeTab === 'clients' && (
                    <>
                      <th>{t('common.name')}</th>
                      <th>{t('common.email')}</th>
                      <th>{t('clients.city')}</th>
                    </>
                  )}
                  {activeTab === 'workers' && (
                    <>
                      <th>{t('common.name')}</th>
                      <th>{t('workers.role')}</th>
                      <th>{t('common.phone')}</th>
                    </>
                  )}
                  {activeTab === 'expenses' && (
                    <>
                      <th>{t('expenses.worker')}</th>
                      <th>{t('expenses.category')}</th>
                      <th>{t('common.amount')}</th>
                    </>
                  )}
                  <th>{t('trash.daysRemaining')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((item) => (
                  <tr key={item.id}>
                    {activeTab === 'invoices' && (
                      <>
                        <td className="font-medium">{item.invoiceNumber}</td>
                        <td>{item.client?.name || '-'}</td>
                        <td>{formatCurrency(item.total || 0)}</td>
                      </>
                    )}
                    {activeTab === 'clients' && (
                      <>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.email || '-'}</td>
                        <td>{item.city || '-'}</td>
                      </>
                    )}
                    {activeTab === 'workers' && (
                      <>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.role || '-'}</td>
                        <td>{item.phone || '-'}</td>
                      </>
                    )}
                    {activeTab === 'expenses' && (
                      <>
                        <td className="font-medium">{item.worker?.name || '-'}</td>
                        <td>{item.category || '-'}</td>
                        <td>{formatCurrency(item.amount || 0)}</td>
                      </>
                    )}
                    <td>
                      <span className={`badge ${item.daysRemaining <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                        {item.daysRemaining} {t('trash.daysRemaining')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(item.type, item.id)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('common.restore')}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.type, item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.permanentDelete')}
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
    </div>
  );
};

export default Trash;
