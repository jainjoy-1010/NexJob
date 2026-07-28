import React, { useState, useEffect } from 'react';
import { Resume } from '../../types';
import { resumeService } from '../../services/resumeService';
import { FileText, Upload, Trash2, Edit3, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ResumeManagerProps {
  onResumesUpdated?: () => void;
}

export const ResumeManager: React.FC<ResumeManagerProps> = ({ onResumesUpdated }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rename Modal State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getResumes();
      setResumes(data);
      if (onResumesUpdated) onResumesUpdated();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (resumes.length >= 3) {
      setError('Maximum 3 resumes allowed. Delete one before uploading.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    try {
      setError(null);
      setUploading(true);
      await resumeService.uploadResume(file);
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await resumeService.setPrimary(id);
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set primary resume.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeService.deleteResume(id);
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete resume.');
    }
  };

  const openRenameModal = (resume: Resume) => {
    setSelectedResume(resume);
    setNewFileName(resume.fileName);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResume || !newFileName.trim()) return;

    try {
      await resumeService.renameResume(selectedResume.id, newFileName.trim());
      setRenameModalOpen(false);
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rename resume.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Resume Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload up to 3 resumes (PDF/DOCX, max 5MB). Mark one as <span className="font-semibold text-slate-700">PRIMARY</span> for 1-click applications.
          </p>
        </div>

        <div>
          <label className={`wellfound-btn-primary py-2 text-xs cursor-pointer ${resumes.length >= 3 || uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload Resume'}
            <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" disabled={resumes.length >= 3 || uploading} />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No resumes uploaded yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload a PDF or DOCX file to complete your profile.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((res) => (
            <div key={res.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {res.fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">{res.fileName}</span>
                    {res.isPrimary && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatFileSize(res.fileSize)} • Uploaded {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!res.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(res.id)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-all"
                  >
                    Set Primary
                  </button>
                )}

                <a
                  href={resumeService.getPreviewUrl(res.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                  title="Browser Preview"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => openRenameModal(res)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                  title="Rename File"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      <Modal isOpen={renameModalOpen} onClose={() => setRenameModalOpen(false)} title="Rename Resume File">
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File Name</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="wellfound-input"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRenameModalOpen(false)} className="wellfound-btn-secondary py-1.5 text-xs">
              Cancel
            </button>
            <button type="submit" className="wellfound-btn-primary py-1.5 text-xs">
              Save Name
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
