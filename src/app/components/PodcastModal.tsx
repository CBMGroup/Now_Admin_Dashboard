import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

type PodcastEpisode = {
  id: string;
  title: string;
  host: string;
  host_id?: number;
  podcast_series: string | null;
  podcast_series_id?: number;
  category: string;
  duration: number | string;
  plays: number;
  trend: 'up' | 'down';
  trendValue: string;
  cover: string;
  audio_file: string | null;
  description?: string | null;
  language?: string | null;
  is_explicit?: boolean;
};

interface PodcastModalProps {
  track: any | null; 
  onClose: () => void;
  onSave: (trackData: any) => Promise<void>;
}

export function PodcastModal({ track, onClose, onSave }: PodcastModalProps) {
  const [hosts, setHosts] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(false);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: track?.title || '',
    host: track?.artist_id?.toString() || track?.host_id?.toString() || '',
    podcast_series: track?.album_id?.toString() || track?.podcast_series_id?.toString() || '',
    category: 'Podcast',
    duration: track?.duration?.toString() || '1800',
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
    const fetchData = async () => {
      setIsLoadingHosts(true);
      setIsLoadingSeries(true);
      try {
        const [hostsRes, seriesRes] = await Promise.all([
          api.get('/artists/?creator_type=host'),
          api.get('/podcast-series/')
        ]);
        
        const hostsData = Array.isArray(hostsRes) ? hostsRes : (hostsRes.results || []);
        const seriesData = Array.isArray(seriesRes) ? seriesRes : (seriesRes.results || []);
        
        setHosts(hostsData);
        setSeries(seriesData);
      } catch (err) {
        console.error('Failed to fetch modal dependencies:', err);
      } finally {
        setIsLoadingHosts(false);
        setIsLoadingSeries(false);
      }
    };
    fetchData();
  }, [track]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.host) payload.append('artist', formData.host);
    if (formData.podcast_series) payload.append('podcast_series', formData.podcast_series);
    
    payload.append('category', 'Podcast');
    payload.append('duration', formData.duration);

    if (formData.cover_url && !selectedCoverFile && !formData.cover_url.startsWith('blob:')) {
        payload.append('cover_url', formData.cover_url);
    }

    if (selectedFile) payload.append('audio_file', selectedFile);
    if (selectedCoverFile) payload.append('cover', selectedCoverFile);
    
    payload.append('description', formData.description);
    payload.append('language', formData.language);
    payload.append('is_explicit', formData.is_explicit.toString());
    
    setIsSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save podcast episode. Please check if an audio file is attached.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {track ? 'Edit Podcast Episode' : 'Add New Podcast Episode'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#A3A3A3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
              Episode Audio File
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99]' 
                  : 'border-[#2A2A2A] hover:border-emerald-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[#F1F1F1] font-semibold">
                    {selectedFile ? selectedFile.name : formData.audio_file ? 'Audio file attached' : 'Click or drag episode audio'}
                  </p>
                  <p className="text-xs text-[#A3A3A3] mt-1">MP3, WAV, M4A or AAC</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-lg text-sm font-bold border border-[#3A3A3A]">
                  Browse Audio Files
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Episode Title</label>
              <input
                type="text" required value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="e.g. The Future of AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Host</label>
              <select
                required value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Select Host</option>
                {hosts.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Podcast Series</label>
              <select
                required value={formData.podcast_series}
                onChange={(e) => setFormData({ ...formData, podcast_series: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Select Series</option>
                {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                placeholder="Episode overview..."
              />
            </div>

            {/* Cover Image */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Episode Cover</label>
              <div className="flex gap-6 items-start">
                 <div className="relative group cursor-pointer w-24 h-24 shrink-0" onClick={() => coverInputRef.current?.click()}>
                    <img
                      src={formData.cover_url || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.title || 'Podcast'}`}
                      alt="Cover" className="w-full h-full rounded-xl border-4 border-[#2A2A2A] object-cover bg-[#0A0A0A]"
                    />
                    <input type="file" ref={coverInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedCoverFile(file);
                        setFormData(prev => ({ ...prev, cover_url: URL.createObjectURL(file) }));
                      }
                    }} accept="image/*" className="hidden" />
                 </div>
                 <input
                    type="url"
                    value={selectedCoverFile ? 'Using newly uploaded file' : formData.cover_url}
                    disabled={!!selectedCoverFile}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] text-sm"
                    placeholder="Cover URL"
                 />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex-1 shadow-lg shadow-emerald-500/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (track ? 'Update Episode' : 'Create Episode')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
