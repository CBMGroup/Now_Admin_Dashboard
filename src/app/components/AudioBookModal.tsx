import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export function AudioBookModal({ track, onClose, onSave }: { track: any, onClose: () => void, onSave: (d: any) => Promise<void> }) {
  const [authors, setAuthors] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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
    if (formData.author) payload.append('artist', formData.author);
    if (formData.book) payload.append('book', formData.book);
    payload.append('category', 'Audiobooks');
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
        alert('Failed to save audiobook chapter. Please check if an audio file is attached.');
    } finally { 
        setIsSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">{track ? 'Edit Audiobook Chapter' : 'Add New Chapter'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"><X className="w-6 h-6 text-[#A3A3A3]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">
              Chapter Audio File
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                isDragging 
                  ? 'border-pink-500 bg-pink-500/10 scale-[0.99]' 
                  : 'border-[#2A2A2A] hover:border-pink-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-pink-500" />
                </div>
                <div>
                  <p className="text-[#F1F1F1] font-semibold">
                      {selectedFile ? selectedFile.name : formData.audio_file ? 'Audio file attached' : 'Click or drag narration file'}
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
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Chapter/Book Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Author</label>
              <select required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-pink-500 outline-none">
                <option value="">Select Author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Audiobook Series</label>
              <select required value={formData.book} onChange={(e) => setFormData({...formData, book: e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-pink-500 outline-none">
                <option value="">Select Book</option>
                {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-widest text-[10px]">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#2A2A2A] text-[#F1F1F1] rounded-xl font-bold flex-1">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold flex-1 shadow-lg shadow-pink-500/20">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (track ? 'Update Chapter' : 'Create Chapter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
