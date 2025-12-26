import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, ArrowLeft, Edit2, Trash2, Copy, FileText, Folder, Calendar,
  MoreVertical, Search, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { electricalProjectApi, clientApi } from '../services/api';
import { ElectricalProject, Client } from '../types';

const ClientElectricalProjects: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ElectricalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [clientRes, projectsRes] = await Promise.all([
        clientApi.getById(parseInt(clientId)),
        electricalProjectApi.getAll({ clientId: parseInt(clientId) })
      ]);
      setClient(clientRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.errorLoading', 'Fout bij het laden van gegevens'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !clientId) return;

    try {
      const response = await electricalProjectApi.create({
        name: newProjectName,
        clientId: parseInt(clientId),
        description: newProjectDescription,
        address: newProjectAddress
      });
      setProjects(prev => [response.data, ...prev]);
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectAddress('');
      toast.success(t('electrical.projectCreated', 'Project aangemaakt'));

      // Navigate to the editor
      navigate(`/dashboard/clients/${clientId}/electrical/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(t('common.errorSaving', 'Fout bij het opslaan'));
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm(t('common.confirmDelete', 'Weet u zeker dat u dit wilt verwijderen?'))) {
      return;
    }

    try {
      await electricalProjectApi.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success(t('common.deleted', 'Verwijderd'));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(t('common.errorDeleting', 'Fout bij het verwijderen'));
    }
  };

  const handleDuplicateProject = async (projectId: number) => {
    try {
      const response = await electricalProjectApi.duplicate(projectId);
      setProjects(prev => [response.data, ...prev]);
      toast.success(t('common.duplicated', 'Gedupliceerd'));
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast.error(t('common.error', 'Er is een fout opgetreden'));
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/clients"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('electrical.title', 'Elektrische Projecten')}
            </h1>
            <p className="text-gray-600">
              {client?.name} {client?.address && `- ${client.address}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('electrical.newProject', 'Nieuw Project')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('common.search', 'Zoeken...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('electrical.noProjects', 'Geen projecten gevonden')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('electrical.createFirst', 'Maak uw eerste elektrisch project aan')}
          </p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('electrical.newProject', 'Nieuw Project')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Project thumbnail/preview */}
              <div
                className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`/dashboard/clients/${clientId}/electrical/${project.id}`)}
              >
                <FileText className="w-16 h-16 text-gray-300" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                      onClick={() => navigate(`/dashboard/clients/${clientId}/electrical/${project.id}`)}
                    >
                      {project.name}
                    </h3>
                    {project.address && (
                      <p className="text-sm text-gray-500 truncate">{project.address}</p>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === project.id ? null : project.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>

                    {dropdownOpen === project.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                        <button
                          onClick={() => {
                            navigate(`/dashboard/clients/${clientId}/electrical/${project.id}`);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4" />
                          {t('common.edit', 'Bewerken')}
                        </button>
                        <button
                          onClick={() => {
                            handleDuplicateProject(project.id);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                          {t('common.duplicate', 'Dupliceren')}
                        </button>
                        <button
                          onClick={async () => {
                            setDropdownOpen(null);
                            try {
                              toast.loading(t('common.generating', 'PDF genereren...'));
                              const response = await electricalProjectApi.getPdf(project.id);
                              const blob = new Blob([response.data], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-electrical.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              toast.dismiss();
                              toast.success(t('common.pdfDownloaded', 'PDF gedownload'));
                            } catch (error) {
                              console.error('PDF export error:', error);
                              toast.dismiss();
                              toast.error(t('common.error', 'Er is een fout opgetreden'));
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                          {t('common.exportPdf', 'Exporteer PDF')}
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            handleDeleteProject(project.id);
                            setDropdownOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('common.delete', 'Verwijderen')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {project.diagrams?.length || 0} {t('electrical.diagrams', 'schema\'s')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('electrical.newProject', 'Nieuw Project')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    {t('common.name', 'Naam')} *
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-input"
                    placeholder={t('electrical.projectNamePlaceholder', 'bijv. Renovatie woning')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">
                    {t('common.address', 'Adres')}
                  </label>
                  <input
                    type="text"
                    value={newProjectAddress}
                    onChange={(e) => setNewProjectAddress(e.target.value)}
                    className="form-input"
                    placeholder={t('electrical.addressPlaceholder', 'Projectlocatie')}
                  />
                </div>

                <div>
                  <label className="form-label">
                    {t('common.description', 'Beschrijving')}
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="form-input"
                    rows={3}
                    placeholder={t('electrical.descriptionPlaceholder', 'Optionele beschrijving...')}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                    setNewProjectAddress('');
                  }}
                  className="btn-secondary"
                >
                  {t('common.cancel', 'Annuleren')}
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="btn-primary"
                >
                  {t('common.create', 'Aanmaken')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default ClientElectricalProjects;
