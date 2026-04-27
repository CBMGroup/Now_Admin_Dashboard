import { useState, useEffect } from 'react';
import { Grid, List, Plus, Edit, Trash2, Play, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { AlbumModal, Album as AlbumType } from '../components/AlbumModal';

// Extend the basic AlbumType for view capabilities (like track aggregates)
type Album = AlbumType & {
  tracksCount: number;
};

export function Albums() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/albums/');
      setAlbums(res.map((a: any) => ({
        ...a,
        artist: a.artist_name || a.artist, // Handle potentially nested/relational data
        tracksCount: a.track_count || 0
      })));
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAlbum = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingAlbum) {
        await api.patch(`/albums/${editingAlbum.id}/`, formData);
      } else {
        await api.post('/albums/', formData);
      }
      await fetchAlbums();
      setIsModalOpen(false);
      setEditingAlbum(null);
    } catch (error) {
      console.error('Failed to save album:', error);
      alert('Failed to save album. Make sure all fields are correctly formatted.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('Are you sure you want to delete this album? Tracks associated with it might be affected.')) {
      try {
        await api.delete(`/albums/${id}/`);
        await fetchAlbums();
      } catch (error) {
        console.error('Failed to delete album:', error);
        alert('Failed to delete album.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Albums Management</h1>
          <p className="text-[#A3A3A3] mt-1">Manage album releases and collections</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#8B5CF6] text-white' : 'text-[#A3A3A3] hover:text-[#F1F1F1]'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#8B5CF6] text-white' : 'text-[#A3A3A3] hover:text-[#F1F1F1]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="px-4 py-2 bg-[#00D1C1] hover:bg-[#00B8A9] text-black rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Album
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
        </div>
      )}

      {!isLoading && albums.length === 0 && (
        <div className="text-center py-20 text-[#A3A3A3]">
           No albums found. Click "Add Album" to create one.
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-[#00D1C1]/50 transition-all hover:shadow-lg hover:shadow-teal-500/10 group"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={album.cover || album.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Album'}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-14 h-14 rounded-full bg-[#22C55E] hover:bg-[#16A34A] flex items-center justify-center transition-colors shadow-lg shadow-green-500/30">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#F1F1F1] truncate">{album.title}</h3>
                <p className="text-sm text-[#A3A3A3] mt-1 truncate hover:text-[#8B5CF6] cursor-pointer transition-colors">
                  {album.artist}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A2A]">
                  <span className="text-xs text-[#A3A3A3]">
                    {album.tracksCount} tracks
                  </span>
                  <span className="text-xs text-[#A3A3A3]">
                    {album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <button 
                       onClick={() => {
                          setEditingAlbum(album);
                          setIsModalOpen(true);
                       }}
                       className="flex-1 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F1F1F1] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button 
                       onClick={() => handleDeleteAlbum(album.id)}
                       className="flex-1 px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Cover</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Title</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Artist</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Tracks</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Release Date</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr
                  key={album.id}
                  className="border-b border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors"
                >
                  <td className="px-4 py-4">
                    <img
                      src={album.cover || album.cover_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Album'}
                      alt={album.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-[#F1F1F1]">{album.title}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[#A3A3A3] hover:text-[#8B5CF6] cursor-pointer transition-colors">
                      {album.artist}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[#A3A3A3]">{album.tracksCount}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[#A3A3A3]">
                      {album.release_date ? new Date(album.release_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingAlbum(album);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-[#A3A3A3]" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <AlbumModal
           album={editingAlbum}
           onClose={() => {
              setIsModalOpen(false);
              setEditingAlbum(null);
           }}
           onSave={handleSaveAlbum}
           isSaving={isSaving}
        />
      )}

    </div>
  );
}
