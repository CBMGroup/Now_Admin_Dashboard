import { X, Search, Plus, Trash2, Loader2, Music2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import * as Switch from '@radix-ui/react-switch';

export type Playlist = {
  id: string;
  title: string;
  user_name: string;
  description: string;
  track_count: number;
  is_public: boolean;
  cover_url: string;
  tracks: string[]; // IDs
  tracks_details?: any[];
};

interface PlaylistModalProps {
  playlist: Playlist | null;
  onClose: () => void;
  onSave: (playlistData: any) => void;
}

export function PlaylistModal({ playlist, onClose, onSave }: PlaylistModalProps) {
  const [formData, setFormData] = useState({
    title: playlist?.title || '',
    description: playlist?.description || '',
    is_public: playlist?.is_public ?? true,
    tracks: playlist?.tracks || [],
  });

  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<any[]>(playlist?.tracks_details || []);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoadingTracks(true);
      try {
        const data = await api.get('/tracks/');
        setAllTracks(data);
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
      } finally {
        setIsLoadingTracks(false);
      }
    };
    fetchTracks();
  }, []);

  const filteredTracks = allTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.artist_details?.name || track.artist_name).toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(track => !formData.tracks.includes(track.id.toString()));

  const handleAddTrack = (track: any) => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, track.id.toString()]
    }));
    setSelectedTracks(prev => [...prev, track]);
  };

  const handleRemoveTrack = (trackId: string) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(id => id !== trackId)
    }));
    setSelectedTracks(prev => prev.filter(t => t.id.toString() !== trackId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] bg-[#1A1A1A]">
          <h2 className="text-2xl font-bold text-[#F1F1F1]">
            {playlist ? 'Edit Playlist' : 'Create New Playlist'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#A3A3A3]" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Metadata Form */}
          <form id="playlist-form" onSubmit={handleSubmit} className="p-6 space-y-6 lg:w-1/2 border-r border-[#2A2A2A] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Playlist Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                placeholder="e.g. Morning Coffee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A3A3A3] mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all h-24 resize-none"
                placeholder="What's this playlist about?"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#F1F1F1]">Public Playlist</span>
                <span className="text-xs text-[#A3A3A3]">Make this playlist visible to everyone</span>
              </div>
              <Switch.Root
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#A3A3A3] uppercase tracking-wider">
                Selected Tracks ({selectedTracks.length})
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg group">
                    <img 
                      src={track.cover || track.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Track'} 
                      className="w-8 h-8 rounded object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F1F1F1] truncate">{track.title}</p>
                      <p className="text-xs text-[#A3A3A3] truncate">{track.artist_details?.name || track.artist_name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(track.id.toString())}
                      className="p-1.5 text-[#EF4444] hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedTracks.length === 0 && (
                  <p className="text-center py-4 text-[#404040] italic text-sm">No tracks added yet</p>
                )}
              </div>
            </div>
          </form>

          {/* Track Selector */}
          <div className="lg:w-1/2 p-6 flex flex-col bg-[#0A0A0A]">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks to add..."
                className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-[#F1F1F1] placeholder:text-[#404040] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isLoadingTracks ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#A3A3A3]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
                  <p>Searching tracks...</p>
                </div>
              ) : filteredTracks.length > 0 ? (
                filteredTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl hover:border-[#8B5CF6]/50 transition-all group">
                    <img 
                      src={track.cover || track.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Track'} 
                      className="w-10 h-10 rounded-lg object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F1F1F1] font-medium truncate">{track.title}</p>
                      <p className="text-[#A3A3A3] text-sm truncate">{track.artist_details?.name || track.artist_name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTrack(track)}
                      className="p-2 bg-[#8B5CF6] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-purple-500/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[#404040] gap-2">
                  <Music2 className="w-12 h-12 opacity-20" />
                  <p>No more tracks found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 p-6 border-t border-[#2A2A2A] bg-[#1A1A1A]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-xl font-bold transition-all flex-1"
          >
            Cancel
          </button>
          <button
            form="playlist-form"
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20 flex-1"
          >
            {playlist ? 'Update Playlist' : 'Create Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
