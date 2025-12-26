import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientApi } from '../services/api';
import { Client } from '../types';
import { Plus, Pencil, Trash2, X, Search, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const countries = [
  { code: 'Belgium', name: 'Belgium', flag: '🇧🇪' },
  { code: 'Netherlands', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'Germany', name: 'Germany', flag: '🇩🇪' },
  { code: 'France', name: 'France', flag: '🇫🇷' },
  { code: 'United Kingdom', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'Turkey', name: 'Turkey', flag: '🇹🇷' },
  { code: 'Albania', name: 'Albania', flag: '🇦🇱' },
  { code: 'Spain', name: 'Spain', flag: '🇪🇸' },
  { code: 'Italy', name: 'Italy', flag: '🇮🇹' },
  { code: 'Austria', name: 'Austria', flag: '🇦🇹' },
  { code: 'Switzerland', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'Luxembourg', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'Kosovo', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'North Macedonia', name: 'North Macedonia', flag: '🇲🇰' }
];

const Clients: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Belgium',
    btwNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientApi.getAll();
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        country: client.country || 'Belgium',
        btwNumber: client.btwNumber || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Belgium',
        btwNumber: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientApi.update(editingClient.id, formData);
        toast.success('Client updated successfully');
      } else {
        await clientApi.create(formData);
        toast.success('Client created successfully');
      }
      closeModal();
      loadClients();
    } catch (error) {
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm(t('clients.deleteConfirm'))) {
      try {
        await clientApi.delete(client.id);
        toast.success('Client moved to trash');
        loadClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
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
        <h1 className="text-2xl font-bold text-gray-900">{t('clients.title')}</h1>
        <div className="flex items-center gap-3">
          <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center"
          >
            <Globe className="w-5 h-5 mr-2" />
            Website
          </a>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            {t('clients.newClient')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('common.search')}
          className="form-input pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('clients.noClients')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('common.email')}</th>
                  <th>{t('common.phone')}</th>
                  <th>{t('clients.city')}</th>
                  <th>{t('clients.btwNumber')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium">{client.name}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.city || '-'}</td>
                    <td>{client.btwNumber || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/clients/${client.id}/electrical`)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title={t('electrical.title', 'Elektrische Projecten')}
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(client)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
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
                {editingClient ? t('clients.editClient') : t('clients.newClient')}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">{t('common.name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">{t('common.email')}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">{t('common.phone')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">{t('common.address')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">{t('clients.city')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">{t('clients.country')}</label>
                  <select
                    className="form-input"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">{t('clients.btwNumber')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.btwNumber}
                    onChange={(e) => setFormData({ ...formData, btwNumber: e.target.value })}
                    placeholder="BE 0123456789"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">{t('common.notes')}</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
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

export default Clients;
