import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { companyApi } from '../services/api';
import { Company } from '../types';
import { Save, Building2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
];

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    taxId: '',
    bankAccount: '',
    bankCode: '',
    email: '',
    phone: '',
    btwNumber: '',
    invoicePrefix: 'FACTURA NR.'
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const response = await companyApi.get();
      const company = response.data;
      setFormData({
        name: company.name || '',
        ownerName: company.ownerName || '',
        address: company.address || '',
        city: company.city || '',
        region: company.region || '',
        postalCode: company.postalCode || '',
        taxId: company.taxId || '',
        bankAccount: company.bankAccount || '',
        bankCode: company.bankCode || '',
        email: company.email || '',
        phone: company.phone || '',
        btwNumber: company.btwNumber || '',
        invoicePrefix: company.invoicePrefix || 'FACTURA NR.'
      });
    } catch (error) {
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyApi.update(formData);
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    toast.success(`Language changed to ${languages.find(l => l.code === code)?.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>

      {/* Language Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">{t('settings.language')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`p-3 rounded-lg border-2 transition-all ${
                i18n.language === lang.code
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Settings */}
      <form onSubmit={handleSubmit}>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">{t('settings.companyInfo')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">{t('settings.companyName')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">{t('settings.ownerName')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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

            <div className="md:col-span-2">
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
              <label className="form-label">{t('settings.region')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">{t('settings.postalCode')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
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

            <div>
              <label className="form-label">{t('settings.taxId')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">{t('settings.btwNumber')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.btwNumber}
                onChange={(e) => setFormData({ ...formData, btwNumber: e.target.value })}
                placeholder="BE 0123456789"
              />
            </div>

            <div>
              <label className="form-label">{t('settings.bankAccount')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">{t('settings.bankCode')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">{t('settings.invoicePrefix')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                placeholder="FACTURA NR."
              />
              <p className="text-xs text-gray-500 mt-1">
                Preview: {formData.invoicePrefix}42
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-5 h-5 mr-2" />
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
