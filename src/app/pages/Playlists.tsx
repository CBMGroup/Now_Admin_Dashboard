import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock, Globe, Loader2, Music2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { PlaylistModal, Playlist } from '../components/PlaylistModal';

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/playlists/');
      setPlaylists(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch playlists');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleSavePlaylist = async (playlistData: any) => {
    try {
      if (editingPlaylist) {
        await api.patch(`/playlists/${editingPlaylist.id}/`, playlistData);
      } else {
        await api.post('/playlists/', playlistData);
      }
      await fetchPlaylists();
      setIsModalOpen(false);
      setEditingPlaylist(null);
    } catch (err) {
      console.error('Failed to save playlist:', err);
      alert('Failed to save playlist. Please check your network or inputs.');
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      try {
        await api.delete(`/playlists/${id}/`);
        setPlaylists(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete playlist:', err);
        alert('Failed to delete playlist.');
      }
    }
  };

  const handleTogglePublic = async (playlist: Playlist) => {
    try {
      const newStatus = !playlist.is_public;
      await api.patch(`/playlists/${playlist.id}/`, { is_public: newStatus });
      setPlaylists(prev => prev.map(p => p.id === playlist.id ? { ...p, is_public: newStatus } : p));
    } catch (err) {
      console.error('Failed to toggle playlist visibility:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-[#A3A3A3] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium">Loading playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-bold">Error loading playlists</p>
        <p className="text-[#A3A3A3]">{error}</p>
        <button onClick={() => fetchPlaylists()} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors hover:border-red-500/50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Playlists Management</h1>
          <p className="text-[#A3A3A3] mt-1">Manage curated playlists and user collections</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlaylist(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#404040]">
           <Music2 className="w-16 h-16 opacity-20 mb-4" />
           <p className="text-xl font-medium">No playlists found</p>
           <p className="text-sm mt-1">Start by creating a new curated playlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-[#8B5CF6]/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={playlist.cover_url || 'https://images.unsplash.com/photo-1618336215696-6673cf4549ae?w=300'}
                  alt={playlist.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {playlist.is_public ? (
                    <div className="px-2.5 py-1 bg-[#22C55E] rounded-full flex items-center gap-1.5 shadow-lg">
                      <Globe className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-semibold text-white">Public</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-[#404040] rounded-full flex items-center gap-1.5 shadow-lg">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-semibold text-white">Private</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#F1F1F1] truncate">{playlist.title}</h3>
                <p className="text-sm text-[#A3A3A3] mt-1">by <span className="text-[#8B5CF6] font-medium">{playlist.user_name}</span></p>
                <p className="text-sm text-[#A3A3A3] mt-3 line-clamp-2 h-10 italic">
                  {playlist.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2A2A2A]">
                  <span className="text-sm font-medium text-[#F1F1F1]">
                    {playlist.track_count} tracks
                  </span>
                  <button 
                    onClick={() => handleTogglePublic(playlist)}
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md transition-all ${
                        playlist.is_public ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#A3A3A3] bg-[#2A2A2A]'
                    }`}
                  >
                    {playlist.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button 
                    onClick={() => {
                        setEditingPlaylist(playlist);
                        setIsModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#F1F1F1] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="flex-1 px-4 py-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playlist Modal */}
      {isModalOpen && (
        <PlaylistModal
          playlist={editingPlaylist}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlaylist(null);
          }}
          onSave={handleSavePlaylist}
        />
      )}
    </div>
  );
}
