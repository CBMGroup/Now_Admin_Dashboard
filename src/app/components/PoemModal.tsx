import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export function PoemModal({ track, onClose, onSave }: { track: any, onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [poets, setPoets] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: track?.title || '',
    poet: track?.artist_id?.toString() || '',
    category: 'Poems',
    duration: track?.duration?.toString() || '300',
    cover_url: track?.cover || '',
    audio_file: track?.audio_file || '',
    description: track?.description || '',
    language: track?.language || '',
    is_explicit: track?.is_explicit || false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/artists/?creator_type=poet').then(res => setPoets(Array.isArray(res) ? res : (res.results || [])));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.poet) payload.append('poet', formData.poet);
    payload.append('category', 'Poems');
    payload.append('duration', formData.duration);
    if (selectedFile) payload.append('audio_file', selectedFile);
    if (selectedCoverFile) payload.append('cover', selectedCoverFile);
    payload.append('description', formData.description);
    payload.append('language', formData.language);
    payload.append('is_explicit', formData.is_explicit.toString());
    
    setIsSaving(true);
    try { await onSave(payload); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">{track ? 'Edit Poem' : 'Add New Poem'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"><X className="w-6 h-6 text-[#A3A3A3]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Poem Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-[#8b5cf6] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Poet</label>
              <select required value={formData.poet} onChange={(e) => setFormData({...formData, poet: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-[#8b5cf6] outline-none">
                <option value="">Select Poet</option>
                {poets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold flex-1 shadow-lg shadow-purple-500/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (track ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
