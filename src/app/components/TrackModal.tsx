import { X, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  category: string;
  duration: string;
  plays: number;
  trend: 'up' | 'down';
  trendValue: string;
  cover: string;
  audio_file?: string;
};

interface TrackModalProps {
  track: Track | null;
  onClose: () => void;
  onSave: (trackData: any) => Promise<void>;
}

const CATEGORIES = ['Music', 'Podcast', 'Education', 'Radio', 'Ugandan Music', 'Audiobooks'];

export function TrackModal({ track, onClose, onSave }: TrackModalProps) {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: track?.title || '',
    artist_name: track?.artist || '',
    artist: '', // Artist ID
    album: track?.album || '',
    category: track?.category || 'Music',
    duration: track?.duration || '0',
    cover_url: track?.cover || '',
    audio_file: track?.audio_file || '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoadingArtists(true);
      try {
        const data = await api.get('/artists/');
        setArtists(data);
        // Try to match artist by name if we have a track
        if (track?.artist) {
          const match = data.find((a: any) => a.name === track.artist);
          if (match) setFormData(prev => ({ ...prev, artist: match.id.toString() }));
        }
      } catch (err) {
        console.error('Failed to fetch artists:', err);
      } finally {
        setIsLoadingArtists(false);
      }
    };
    fetchArtists();
  }, [track]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have a file or we are creating a new track, we should likely use FormData
    // The backend expects `multipart/form-data` when handling FileFields
    const payload = new FormData();
    payload.append('title', formData.title);
    
    const artistName = artists.find(a => a.id.toString() === formData.artist)?.name || formData.artist_name;
    if (artistName) payload.append('artist_name', artistName);
    
    if (formData.artist) payload.append('artist', formData.artist);
    
    payload.append('category', formData.category);
    payload.append('duration', (parseInt(formData.duration) || 180).toString());
    // Only send the URL if we don't have a new file
    if (formData.cover_url && !selectedCoverFile && !formData.cover_url.startsWith('blob:')) {
        payload.append('cover_url', formData.cover_url);
    }

    if (selectedFile) {
      payload.append('audio_file', selectedFile);
    }
    
    if (selectedCoverFile) {
      payload.append('cover', selectedCoverFile);
    }
    
    // If no new file is added, and it's an edit, we can still send FormData. 
    // The backend knows to ignore file fields if they aren't provided.
    setIsSaving(true);
    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Cover Image too large. Max 5MB.");
        return;
      }
      setSelectedCoverFile(file);
      setFormData(prev => ({ ...prev, cover_url: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {track ? 'Edit Track' : 'Add New Track'}
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
          {/* Audio Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
              Audio File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 transition-all ${
                isDragging
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[0.99]'
                  : 'border-[#2A2A2A] hover:border-[#8B5CF6]/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-2">
                  <Upload className="w-10 h-10 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-[#F1F1F1] font-semibold text-lg">
                    {selectedFile ? selectedFile.name : formData.audio_file ? 'Audio file attached' : 'Click or drag audio file'}
                  </p>
                  <p className="text-sm text-[#A3A3A3] mt-2">
                    MP3, WAV or FLAC up to 25MB
                  </p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="audio/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F1F1F1] rounded-xl transition-all border border-[#3A3A3A] font-medium"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Track Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
                placeholder="e.g. Midnight City"
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Selection */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Cover Image
              </label>
              <div className="flex flex-col items-center">
                 <div className="relative group cursor-pointer mb-2 w-40 h-40" onClick={() => coverInputRef.current?.click()}>
                    <img
                      src={formData.cover_url || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.title || 'Track'}`}
                      alt="Cover Preview"
                      className="w-full h-full rounded-xl border-4 border-[#2A2A2A] object-cover bg-[#0A0A0A] transition-transform group-hover:scale-105 shadow-xl"
                      onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=Err')}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={coverInputRef} 
                      onChange={handleCoverChange} 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden" 
                    />
                 </div>
                 <p className="text-xs text-[#A3A3A3] mt-2 font-medium">Click to upload cover (Max 5MB)</p>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Or Cover URL Link
                </label>
                <input
                    type="url"
                    value={selectedCoverFile ? 'Using uploaded file' : formData.cover_url}
                    disabled={!!selectedCoverFile}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all disabled:opacity-50 text-sm"
                    placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>



          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-xl font-bold transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {track ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                track ? 'Update Track' : 'Create Track'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
