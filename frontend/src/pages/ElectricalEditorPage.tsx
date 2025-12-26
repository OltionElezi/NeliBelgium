import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, FileText, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { electricalProjectApi } from '../services/api';
import { ElectricalProject, ElectricalDiagram, DiagramData, DiagramType } from '../types';
import { ElectricalEditor } from '../components/ElectricalEditor';

const ElectricalEditorPage: React.FC = () => {
  const { clientId, projectId } = useParams<{ clientId: string; projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [project, setProject] = useState<ElectricalProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDiagramId, setActiveDiagramId] = useState<number | null>(null);
  const [showNewDiagramModal, setShowNewDiagramModal] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramType, setNewDiagramType] = useState<DiagramType>('FLOOR_PLAN');
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await electricalProjectApi.getById(parseInt(projectId));
      setProject(response.data);

      // Set active diagram to first one if exists
      if (response.data.diagrams?.length > 0) {
        setActiveDiagramId(response.data.diagrams[0].id);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error(t('common.errorLoading', 'Fout bij het laden'));
      navigate(`/dashboard/clients/${clientId}/electrical`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagram = async (diagramData: DiagramData) => {
    if (!project || !activeDiagramId) return;

    setSaving(true);
    try {
      await electricalProjectApi.updateDiagram(project.id, activeDiagramId, {
        diagramData
      });
      toast.success(t('common.saved', 'Opgeslagen'));

      // Update local state
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          diagrams: prev.diagrams.map(d =>
            d.id === activeDiagramId ? { ...d, diagramData } : d
          )
        };
      });
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error(t('common.errorSaving', 'Fout bij het opslaan'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddDiagram = async () => {
    if (!project || !newDiagramName.trim()) return;

    try {
      const response = await electricalProjectApi.addDiagram(project.id, {
        name: newDiagramName,
        type: newDiagramType
      });

      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          diagrams: [...prev.diagrams, response.data]
        };
      });

      setActiveDiagramId(response.data.id);
      setShowNewDiagramModal(false);
      setNewDiagramName('');
      setNewDiagramType('FLOOR_PLAN');
      toast.success(t('electrical.diagramAdded', 'Schema toegevoegd'));
    } catch (error) {
      console.error('Error adding diagram:', error);
      toast.error(t('common.error', 'Er is een fout opgetreden'));
    }
  };

  const handleDeleteDiagram = async (diagramId: number) => {
    if (!project) return;
    if (!window.confirm(t('common.confirmDelete', 'Weet u zeker dat u dit wilt verwijderen?'))) {
      return;
    }

    try {
      await electricalProjectApi.deleteDiagram(project.id, diagramId);

      setProject(prev => {
        if (!prev) return prev;
        const newDiagrams = prev.diagrams.filter(d => d.id !== diagramId);
        return { ...prev, diagrams: newDiagrams };
      });

      // Switch to another diagram or clear
      if (activeDiagramId === diagramId) {
        const remaining = project.diagrams.filter(d => d.id !== diagramId);
        setActiveDiagramId(remaining.length > 0 ? remaining[0].id : null);
      }

      toast.success(t('common.deleted', 'Verwijderd'));
    } catch (error) {
      console.error('Error deleting diagram:', error);
      toast.error(t('common.error', 'Er is een fout opgetreden'));
    }
  };

  const handleUpdateProjectSettings = async (name: string, description: string, address: string) => {
    if (!project) return;

    try {
      await electricalProjectApi.update(project.id, { name, description, address });
      setProject(prev => prev ? { ...prev, name, description, address } : prev);
      setShowProjectSettings(false);
      toast.success(t('common.saved', 'Opgeslagen'));
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(t('common.error', 'Er is een fout opgetreden'));
    }
  };

  const getDiagramTypeLabel = (type: DiagramType) => {
    switch (type) {
      case 'FLOOR_PLAN':
        return t('electrical.floorPlan', 'Gelijkvloers');
      case 'DISTRIBUTION_BOARD':
        return t('electrical.distributionBoard', 'Verdeelbord');
      case 'CIRCUIT':
        return t('electrical.circuit', 'Stroomschema');
      default:
        return type;
    }
  };

  const activeDiagram = project?.diagrams.find(d => d.id === activeDiagramId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">{t('electrical.projectNotFound', 'Project niet gevonden')}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/clients/${clientId}/electrical`}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{project.name}</h1>
            {project.address && (
              <p className="text-sm text-gray-500">{project.address}</p>
            )}
          </div>
          <button
            onClick={() => setShowProjectSettings(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title={t('common.settings', 'Instellingen')}
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {saving && (
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            {t('common.saving', 'Opslaan...')}
          </span>
        )}
      </div>

      {/* Diagram Tabs */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1 flex items-center gap-1 overflow-x-auto">
        {project.diagrams.map(diagram => (
          <div
            key={diagram.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer group ${
              activeDiagramId === diagram.id
                ? 'bg-white border-t border-l border-r border-gray-200 -mb-px'
                : 'hover:bg-gray-100'
            }`}
          >
            <span
              onClick={() => setActiveDiagramId(diagram.id)}
              className="text-sm font-medium"
            >
              {diagram.name}
            </span>
            <span className="text-xs text-gray-400">
              ({getDiagramTypeLabel(diagram.type)})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDiagram(diagram.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}

        <button
          onClick={() => setShowNewDiagramModal(true)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          {t('electrical.addDiagram', 'Schema toevoegen')}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {activeDiagram ? (
          <ElectricalEditor
            key={activeDiagram.id}
            diagramData={activeDiagram.diagramData}
            diagramType={activeDiagram.type}
            onSave={handleSaveDiagram}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('electrical.noDiagrams', 'Geen schema\'s')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('electrical.addFirstDiagram', 'Voeg uw eerste schema toe om te beginnen')}
              </p>
              <button
                onClick={() => setShowNewDiagramModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('electrical.addDiagram', 'Schema toevoegen')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Diagram Modal */}
      {showNewDiagramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('electrical.newDiagram', 'Nieuw Schema')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    {t('common.name', 'Naam')} *
                  </label>
                  <input
                    type="text"
                    value={newDiagramName}
                    onChange={(e) => setNewDiagramName(e.target.value)}
                    className="form-input"
                    placeholder={t('electrical.diagramNamePlaceholder', 'bijv. Gelijkvloers')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">
                    {t('electrical.diagramType', 'Type schema')}
                  </label>
                  <select
                    value={newDiagramType}
                    onChange={(e) => setNewDiagramType(e.target.value as DiagramType)}
                    className="form-input"
                  >
                    <option value="FLOOR_PLAN">{t('electrical.floorPlan', 'Gelijkvloers')}</option>
                    <option value="DISTRIBUTION_BOARD">{t('electrical.distributionBoard', 'Verdeelbord')}</option>
                    <option value="CIRCUIT">{t('electrical.circuit', 'Stroomschema')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNewDiagramModal(false);
                    setNewDiagramName('');
                  }}
                  className="btn-secondary"
                >
                  {t('common.cancel', 'Annuleren')}
                </button>
                <button
                  onClick={handleAddDiagram}
                  disabled={!newDiagramName.trim()}
                  className="btn-primary"
                >
                  {t('common.create', 'Aanmaken')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {showProjectSettings && (
        <ProjectSettingsModal
          project={project}
          onSave={handleUpdateProjectSettings}
          onClose={() => setShowProjectSettings(false)}
        />
      )}
    </div>
  );
};

// Project Settings Modal Component
interface ProjectSettingsModalProps {
  project: ElectricalProject;
  onSave: (name: string, description: string, address: string) => void;
  onClose: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  onSave,
  onClose
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [address, setAddress] = useState(project.address || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('electrical.projectSettings', 'Project Instellingen')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="form-label">
                {t('common.name', 'Naam')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                {t('common.address', 'Adres')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                {t('common.description', 'Beschrijving')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              {t('common.cancel', 'Annuleren')}
            </button>
            <button
              onClick={() => onSave(name, description, address)}
              disabled={!name.trim()}
              className="btn-primary"
            >
              {t('common.save', 'Opslaan')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalEditorPage;
