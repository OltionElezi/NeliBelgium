import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, invoiceApi } from '../services/api';
import { DashboardStats, Invoice } from '../types';
import {
  Users,
  FileText,
  HardHat,
  TrendingUp,
  Clock,
  Wallet,
  Plus,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        dashboardApi.getStats(),
        invoiceApi.getAll()
      ]);
      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'badge-gray',
      SENT: 'badge-info',
      PAID: 'badge-success',
      OVERDUE: 'badge-danger',
      CANCELLED: 'badge-warning'
    };
    return styles[status] || 'badge-gray';
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
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500">{t('dashboard.welcome')}, {user?.name}!</p>
        </div>
        <Link to="/dashboard/invoices/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('invoices.newInvoice')}
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="stat-value">{stats?.clients || 0}</p>
              <p className="stat-label">{t('dashboard.totalClients')}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="stat-value">{stats?.invoices || 0}</p>
              <p className="stat-label">{t('dashboard.totalInvoices')}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <HardHat className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="stat-value">{stats?.workers || 0}</p>
              <p className="stat-label">{t('dashboard.totalWorkers')}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="stat-value text-lg">{formatCurrency(stats?.revenue.paid || '0')}</p>
              <p className="stat-label">{t('dashboard.paidRevenue')}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="stat-value text-lg">{formatCurrency(stats?.revenue.pending || '0')}</p>
              <p className="stat-label">{t('dashboard.pendingRevenue')}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Wallet className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="stat-value text-lg">{formatCurrency(stats?.expenses?.total || stats?.expenses || '0')}</p>
              <p className="stat-label">{t('dashboard.totalExpenses')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent invoices & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent invoices */}
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{t('dashboard.recentInvoices')}</h2>
            <Link to="/dashboard/invoices" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body p-0">
            {recentInvoices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {t('invoices.noInvoices')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>{t('invoices.invoiceNumber')}</th>
                      <th>{t('invoices.client')}</th>
                      <th>{t('common.total')}</th>
                      <th>{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="font-medium">{invoice.invoiceNumber}</td>
                        <td>{invoice.client?.name}</td>
                        <td>{formatCurrency(invoice.total)}</td>
                        <td>
                          <span className={getStatusBadge(invoice.status)}>
                            {t(`invoices.status${invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900">{t('dashboard.quickActions')}</h2>
          </div>
          <div className="card-body space-y-3">
            <Link
              to="/dashboard/invoices/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium">{t('invoices.newInvoice')}</span>
            </Link>

            <Link
              to="/dashboard/clients"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">{t('clients.newClient')}</span>
            </Link>

            <Link
              to="/dashboard/workers"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <HardHat className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium">{t('workers.newWorker')}</span>
            </Link>

            <Link
              to="/dashboard/expenses"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <Wallet className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-medium">{t('expenses.newExpense')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
