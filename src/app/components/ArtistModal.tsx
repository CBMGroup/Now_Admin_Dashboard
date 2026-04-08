import { X, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';
import * as Switch from '@radix-ui/react-switch';

export type Artist = {
  id: string;
  name: string;
  avatar_url: string;
  avatar?: string;
  bio: string;
  is_verified: boolean;
};

interface ArtistModalProps {
  artist: Artist | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  isSaving: boolean;
}

export function ArtistModal({ artist, onClose, onSave, isSaving }: ArtistModalProps) {
  const [formData, setFormData] = useState({
    name: artist?.name || '',
    bio: artist?.bio || '',
    is_verified: artist?.is_verified || false,
    avatar_url: artist?.avatar || artist?.avatar_url || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('bio', formData.bio);
    payload.append('is_verified', formData.is_verified.toString());
    
    // Only send the URL if we don't have a new file and we are relying on an external URL
    if (formData.avatar_url && !selectedFile && !formData.avatar_url.startsWith('blob:')) {
        payload.append('avatar_url', formData.avatar_url);
    }

    if (selectedFile) {
      payload.append('avatar', selectedFile); 
    }

    onSave(payload);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        setPreviewError("Image too large. Max 15MB.");
        return;
      }
      setPreviewError(null);
      setSelectedFile(file);
      // Create a local preview
      setFormData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {artist ? 'Edit Artist' : 'Add New Artist'}
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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
             <div className="relative group cursor-pointer mb-2" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={formData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full border-4 border-[#2A2A2A] object-cover bg-[#0A0A0A] transition-transform group-hover:scale-105 shadow-xl"
                  onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Err')}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
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
             <p className="text-xs text-[#A3A3A3] mt-2 font-medium">Click to upload avatar (Max 15MB)</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Artist Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
                placeholder="e.g. The Wanderers"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Biography
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all min-h-[100px] resize-y"
                placeholder="Artist's background story..."
              />
            </div>

            {/* External URL backup */}
            <div>
                <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                    Or Avatar URL Link
                </label>
                <input
                    type="url"
                    value={selectedFile ? 'Using uploaded file' : formData.avatar_url}
                    disabled={!!selectedFile}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all disabled:opacity-50"
                    placeholder="https://example.com/avatar.jpg"
                />
            </div>

            {/* Verified Switch */}
            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
                 <div>
                    <p className="text-sm font-medium text-[#F1F1F1]">Verified Artist</p>
                    <p className="text-xs text-[#A3A3A3]">Display the verification badge</p>
                 </div>
                 <Switch.Root
                    checked={formData.is_verified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified: checked }))}
                    className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors cursor-pointer"
                >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
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
              disabled={isSaving || !formData.name}
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex-1 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {artist ? 'Update Artist' : 'Create Artist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
