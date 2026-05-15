import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export function AudioBookModal({ track, onClose, onSave }: { track: any, onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [authors, setAuthors] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: track?.title || '',
    author: track?.artist_id?.toString() || '',
    book: track?.book_id?.toString() || '',
    category: 'Audiobooks',
    duration: track?.duration?.toString() || '3600',
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
      setIsLoadingAuthors(true);
      setIsLoadingBooks(true);
      try {
        const [authorsRes, booksRes] = await Promise.all([
          api.get('/artists/?creator_type=author'),
          api.get('/audiobook-series/')
        ]);
        setAuthors(Array.isArray(authorsRes) ? authorsRes : (authorsRes.results || []));
        setBooks(Array.isArray(booksRes) ? booksRes : (booksRes.results || []));
      } finally {
        setIsLoadingAuthors(false);
        setIsLoadingBooks(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.author) payload.append('artist', formData.author);
    if (formData.book) payload.append('book', formData.book);
    payload.append('category', 'Audiobooks');
    payload.append('duration', formData.duration);
    if (formData.cover_url && !selectedCoverFile && !formData.cover_url.startsWith('blob:')) payload.append('cover_url', formData.cover_url);
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
          <h2 className="text-2xl font-bold text-[#F1F1F1]">{track ? 'Edit Audiobook' : 'Add New Audiobook'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"><X className="w-6 h-6 text-[#A3A3A3]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Audiobook File</label>
            <div className="border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 hover:border-[#EC4899]/50 transition-all text-center">
                <Upload className="w-8 h-8 text-[#EC4899] mx-auto mb-2" />
                <p className="text-[#F1F1F1] font-semibold">{selectedFile ? selectedFile.name : 'Click to upload narration'}</p>
                <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="audio/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg text-sm border border-[#3A3A3A]">Browse</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Book Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-[#EC4899] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Author</label>
              <select required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-[#EC4899] outline-none">
                <option value="">Select Author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Audiobook Series (Optional)</label>
              <select value={formData.book} onChange={(e) => setFormData({...formData, book: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-[#EC4899] outline-none">
                <option value="">Select Book</option>
                {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Duration (seconds)</label>
                <input type="number" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1]" />
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-[#EC4899] text-white rounded-xl font-bold flex-1 shadow-lg shadow-pink-500/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (track ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
