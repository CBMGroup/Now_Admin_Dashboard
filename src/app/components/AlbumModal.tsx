import { X, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';

export type Album = {
  id: string;
  title: string;
  artist: string;        // artist name directly from API
  artist_id?: number;    // backend usually wants the artist id
  cover_url: string;
  cover?: string;
  release_date: string;
};

interface AlbumModalProps {
  album: Album | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  isSaving: boolean;
}

export function AlbumModal({ album, onClose, onSave, isSaving }: AlbumModalProps) {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  
  const [formData, setFormData] = useState({
    title: album?.title || '',
    artist: album?.artist_id?.toString() || '',
    release_date: album?.release_date ? album.release_date.split('T')[0] : '', // format nicely for date input
    cover_url: album?.cover || album?.cover_url || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoadingArtists(true);
      try {
        const data = await api.get('/artists/');
        setArtists(data);
        // Pre-select if we only have name but no ID
        if (album?.artist && !album?.artist_id) {
          const match = data.find((a: any) => a.name === album.artist);
          if (match) setFormData(prev => ({ ...prev, artist: match.id.toString() }));
        }
      } catch (err) {
        console.error('Failed to fetch artists:', err);
      } finally {
        setIsLoadingArtists(false);
      }
    };
    fetchArtists();
  }, [album]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('title', formData.title);
    if (formData.artist) payload.append('artist', formData.artist);
    if (formData.release_date) payload.append('release_date', formData.release_date);
    
    // Only send the URL if we don't have a new file
    if (formData.cover_url && !selectedFile && !formData.cover_url.startsWith('blob:')) {
        payload.append('cover_url', formData.cover_url);
    }

    if (selectedFile) {
      payload.append('cover', selectedFile); 
    }

    onSave(payload);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setPreviewError("Image too large. Max 5MB.");
        return;
      }
      setPreviewError(null);
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, cover_url: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {album ? 'Edit Album' : 'Add New Album'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#A3A3A3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Upload */}
          <div className="flex flex-col items-center">
             <div className="relative group cursor-pointer mb-2 w-40 h-40" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={formData.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Album'}
                  alt="Cover Preview"
                  className="w-full h-full rounded-xl border-4 border-[#2A2A2A] object-cover bg-[#0A0A0A] transition-transform group-hover:scale-105 shadow-xl"
                  onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=Err')}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                    <Upload className="w-8 h-8 text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
             </div>
             {previewError && (
                 <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                     <AlertTriangle size={12} /> {previewError}
                 </p>
             )}
             <p className="text-xs text-[#A3A3A3] mt-2 font-medium">Click to upload cover (Max 5MB)</p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Album Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
                placeholder="e.g. Night Sessions"
              />
            </div>

            {/* Artist Selection */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Artist
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] appearance-none disabled:opacity-50"
                  disabled={isLoadingArtists}
                >
                  <option value="">Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
                {isLoadingArtists && (
                  <div className="absolute right-3 top-3.5">
                    <Loader2 className="w-5 h-5 animate-spin text-[#8B5CF6]" />
                  </div>
                )}
              </div>
            </div>

            {/* Release Date */}
            <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                    Release Date
                </label>
                <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                />
            </div>

            {/* External URL backup */}
            <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                    Or Cover URL Link
                </label>
                <input
                    type="url"
                    value={selectedFile ? 'Using uploaded file' : formData.cover_url}
                    disabled={!!selectedFile}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all disabled:opacity-50"
                    placeholder="https://example.com/cover.jpg"
                />
            </div>
            
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-xl font-bold transition-all flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.title || !formData.artist}
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex-1 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {album ? 'Update Album' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
