import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export function AudioPlayModal({ track, onClose, onSave }: { track: any, onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [directors, setDirectors] = useState<any[]>([]);
  const [plays, setPlays] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: track?.title || '',
    director: track?.artist_id?.toString() || track?.director_id?.toString() || '',
    play: track?.play_id?.toString() || track?.audioplay_id?.toString() || '',
    category: 'Audio Plays',
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
    Promise.all([
        api.get('/artists/?creator_type=director'),
        api.get('/audioplay-series/')
    ]).then(([directorsRes, playsRes]) => {
        setDirectors(Array.isArray(directorsRes) ? directorsRes : (directorsRes.results || []));
        setPlays(Array.isArray(playsRes) ? playsRes : (playsRes.results || []));
    });
  }, []);

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
    if (formData.director) payload.append('artist', formData.director);
    if (formData.play) payload.append('play', formData.play);
    payload.append('category', 'Audio Plays');
    payload.append('duration', formData.duration);
    
    if (selectedFile) payload.append('audio_file', selectedFile);
    if (selectedCoverFile) payload.append('cover', selectedCoverFile);
    
    if (formData.cover_url && !selectedCoverFile && !formData.cover_url.startsWith('blob:')) {
        payload.append('cover_url', formData.cover_url);
    }
    
    payload.append('description', formData.description);
    payload.append('language', formData.language);
    payload.append('is_explicit', formData.is_explicit.toString());
    
    setIsSaving(true);
    try { 
      await onSave(payload); 
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save audio play. Please ensure all required fields are filled.');
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">{track ? 'Edit Audio Play' : 'Add New Audio Play'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"><X className="w-6 h-6 text-[#A3A3A3]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
              Play Audio File
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                isDragging 
                  ? 'border-rose-500 bg-rose-500/10 scale-[0.99]' 
                  : 'border-[#2A2A2A] hover:border-rose-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                  <p className="text-[#F1F1F1] font-semibold">
                    {selectedFile ? selectedFile.name : formData.audio_file ? 'Audio file attached' : 'Click or drag audio act'}
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
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Act Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Director</label>
              <select required value={formData.director} onChange={(e) => setFormData({...formData, director: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-rose-500 outline-none">
                <option value="">Select Director</option>
                {directors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Audio Play Series</label>
              <select required value={formData.play} onChange={(e) => setFormData({...formData, play: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-rose-500 outline-none">
                <option value="">Select Play</option>
                {plays.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-rose-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold flex-1 shadow-lg shadow-rose-500/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (track ? 'Update Act' : 'Create Act')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
