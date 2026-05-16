import { X, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';

interface SeriesModalProps {
  type: 'podcast' | 'audiobook' | 'audioplay';
  data: any | null;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

export function SeriesModal({ type, data, onClose, onSave }: SeriesModalProps) {
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const config = {
    podcast: { title: 'Podcast', creatorLabel: 'Host', creatorType: 'host', endpoint: '/podcast-series/' },
    audiobook: { title: 'Audiobook', creatorLabel: 'Author', creatorType: 'author', endpoint: '/audiobook-series/' },
    audioplay: { title: 'Audio Play', creatorLabel: 'Director', creatorType: 'director', endpoint: '/audioplay-series/' },
  }[type];

  const [formData, setFormData] = useState({
    title: data?.title || '',
    creator: data?.host || data?.author || data?.director || '',
    description: data?.description || '',
    cover_url: data?.cover || data?.cover_url || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoadingCreators(true);
      try {
        const res = await api.get(`/artists/?creator_type=${config.creatorType}`);
        setCreators(Array.isArray(res) ? res : (res.results || []));
      } catch (err) {
        console.error('Failed to fetch creators:', err);
      } finally {
        setIsLoadingCreators(false);
      }
    };
    fetchCreators();
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    
    // Map generic creator field to backend field
    if (type === 'podcast') payload.append('host', formData.creator);
    if (type === 'audiobook') payload.append('author', formData.creator);
    if (type === 'audioplay') payload.append('director', formData.creator);
    
    if (formData.cover_url && !selectedFile && !formData.cover_url.startsWith('blob:')) {
        payload.append('cover_url', formData.cover_url);
    }
    if (selectedFile) payload.append('cover', selectedFile);

    try {
      await onSave(payload);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPreviewError("Image too large. Max 5MB.");
        return;
      }
      setPreviewError(null);
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, cover_url: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {data ? `Edit ${config.title}` : `Add New ${config.title}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#A3A3A3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
             <div className="relative group cursor-pointer mb-2 w-40 h-40" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={formData.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Cover'}
                  alt="Cover Preview"
                  className="w-full h-full rounded-xl border-4 border-[#2A2A2A] object-cover bg-[#0A0A0A] shadow-xl"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                    <Upload className="w-8 h-8 text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
             </div>
             {previewError && <p className="text-red-400 text-xs mt-1">{previewError}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider text-[10px]">Title</label>
              <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] outline-none focus:ring-2 focus:ring-[#00D1C1]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider text-[10px]">{config.creatorLabel}</label>
              <select required value={formData.creator} onChange={(e) => setFormData({...formData, creator: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] outline-none focus:ring-2 focus:ring-[#00D1C1]">
                <option value="">Select {config.creatorLabel}</option>
                {creators.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider text-[10px]">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] outline-none focus:ring-2 focus:ring-[#00D1C1]" />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-6 py-3 bg-[#00D1C1] text-black rounded-xl font-bold flex-1 flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (data ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
