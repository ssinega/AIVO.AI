import React, { useState } from 'react';
import { EvidenceGap, EvidenceAttachment } from '../../types';
import { UploadCloud, FileText, CheckCircle, X, Image as ImageIcon, File, Paperclip } from 'lucide-react';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  evidenceGap: EvidenceGap | null;
  onClose: () => void;
  onUpload: (gapId: string, attachment: EvidenceAttachment, newStatus: string) => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  evidenceGap,
  onClose,
  onUpload
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [autoStatus, setAutoStatus] = useState<string>('Received');

  if (!isOpen || !evidenceGap) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newAttachment: EvidenceAttachment = {
        id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
        filename: selectedFile.name,
        file_type: selectedFile.type || 'application/octet-stream',
        file_size: selectedFile.size,
        uploaded_at: new Date().toISOString(),
        data_url: dataUrl,
        notes: notes || undefined
      };

      onUpload(evidenceGap.id, newAttachment, autoStatus);
      setSelectedFile(null);
      setNotes('');
      onClose();
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-sky-600" />
              Attach Evidence File
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: <span className="font-semibold text-slate-800">{evidenceGap.missing_evidence}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 transition-colors ${
              dragActive ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-sky-600 mx-auto" />
            <div>
              <p className="font-bold text-slate-800">Drag & drop evidence document or image</p>
              <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG, CSV, or XLSX up to 10MB</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Browse File...</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            {selectedFile && (
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto flex items-center justify-between font-mono text-[11px] text-slate-800">
                <span className="truncate max-w-[200px] font-bold">{selectedFile.name}</span>
                <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Evidence Notes / Context</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Verified by Metrology Tech. RTD TT-401 probe calibration within 0.1°C tolerance..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Update Collection Status</label>
            <select
              value={autoStatus}
              onChange={(e) => setAutoStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
            >
              <option value="Received">Received (File attached)</option>
              <option value="Reviewed">Reviewed (QA Verified)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg font-bold hover:bg-sky-800 shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Attach File & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
