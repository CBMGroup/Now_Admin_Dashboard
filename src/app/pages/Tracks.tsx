import { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { 
  Play, 
  Edit, 
  Trash2, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MiniPlayer } from '../components/MiniPlayer';
import { TrackModal } from '../components/TrackModal';
import { usePlayer } from '../context/PlayerContext';

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

const categories = ['All', 'Music', 'Podcast', 'Education', 'Radio', 'Ugandan Music', 'Audiobooks'];

const categoryColors: Record<string, string> = {
  'Music': 'bg-[#8B5CF6] text-white',
  'Podcast': 'bg-[#22C55E] text-white',
  'Education': 'bg-[#EF4444] text-white',
  'Radio': 'bg-[#F59E0B] text-white',
  'Ugandan Music': 'bg-[#3B82F6] text-white',
  'Audiobooks': 'bg-[#EC4899] text-white',
};

const columnHelper = createColumnHelper<Track>();

export function Tracks() {
  const [data, setData] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const { setCurrentTrack } = usePlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  const fetchTracks = async () => {
    try {
      const tracks = await api.get('/tracks/');
      setData(tracks.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        artist: t.artist_details?.name || t.artist_name,
        album: t.album_details?.title || null,
        category: t.category,
        duration: t.duration ? `${Math.floor(t.duration / 60)}:${(t.duration % 60).toString().padStart(2, '0')}` : '0:00',
        plays: t.plays || 0,
        trend: 'up',
        trendValue: '+0%',
        cover: t.cover || t.cover_url || 'https://images.unsplash.com/photo-1618336215696-6673cf4549ae?w=100',
        audio_file: t.audio_file,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this track?')) {
      try {
        await api.delete(`/tracks/${id}/`);
        setData(data.filter((track) => track.id !== id));
      } catch (err) {
        console.error('Failed to delete track:', err);
        alert('Failed to delete track. Please try again.');
      }
    }
  };

  const columns = [
    columnHelper.display({
      id: 'play',
      header: '',
      cell: (info) => (
        <button
          onClick={() => setCurrentTrack(info.row.original)}
          className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center hover:bg-[#16A34A] transition-colors shadow-lg shadow-green-500/20"
        >
          <Play className="w-4 h-4 text-white fill-white" />
        </button>
      ),
      size: 60,
    }),
    columnHelper.accessor('cover', {
      header: '',
      cell: (info) => (
        <img
          src={info.getValue()}
          alt="Cover"
          className="w-12 h-12 rounded-lg object-cover bg-[#0A0A0A]"
        />
      ),
      size: 80,
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 hover:text-[#8B5CF6] transition-colors"
        >
          Title
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: (info) => (
        <span className="font-medium text-[#F1F1F1]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      cell: (info) => (
        <span className="text-[#A3A3A3] hover:text-[#8B5CF6] cursor-pointer transition-colors">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('album', {
      header: 'Album',
      cell: (info) => (
        <span className="text-[#A3A3A3]">
          {info.getValue() || <span className="italic opacity-50 text-xs">Single</span>}
        </span>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryColors[info.getValue()] || 'bg-gray-600/50'}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('duration', {
      header: 'Duration',
      cell: (info) => <span className="text-[#A3A3A3] font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('plays', {
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 hover:text-[#8B5CF6] transition-colors"
        >
          Plays
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: (info) => {
        const track = info.row.original;
        const plays = info.getValue() || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-[#F1F1F1] font-medium">
              {plays >= 1000 ? `${(plays / 1000).toFixed(1)}K` : plays}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-bold ${track.trend === 'up' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {track.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {track.trendValue}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTrack(info.row.original);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-[#A3A3A3]" />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      ),
      size: 100,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const filteredData = data.filter((track) => {
    if (selectedCategory !== 'All' && track.category !== selectedCategory) return false;
    if (selectedArtist !== 'All' && track.artist !== selectedArtist) return false;
    return true;
  });

  const uniqueArtists = ['All', ...new Set(data.map(t => t.artist))];

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-[#A3A3A3] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium">Loading music library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-bold">Error loading tracks</p>
        <p className="text-[#A3A3A3]">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors hover:border-red-500/50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Tracks Management</h1>
          <p className="text-[#A3A3A3] mt-1">Manage all music tracks in the platform</p>
        </div>
        <button
          onClick={() => {
            setEditingTrack(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Track
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#F1F1F1] hover:text-[#8B5CF6] transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
          {(selectedCategory !== 'All' || selectedArtist !== 'All') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedArtist('All');
              }}
              className="text-sm text-[#A3A3A3] hover:text-[#F1F1F1] flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#F1F1F1] mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F1F1F1] mb-2">Artist</label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              >
                {uniqueArtists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-left text-sm font-semibold text-[#F1F1F1]"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-[#A3A3A3]">
                    No tracks found in your library.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2A2A]">
          <p className="text-sm text-[#A3A3A3]">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}{' '}
            of {data.length} tracks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg border border-[#2A2A2A] hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#F1F1F1]" />
            </button>
            <span className="text-sm text-[#F1F1F1]">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg border border-[#2A2A2A] hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#F1F1F1]" />
            </button>
          </div>
        </div>
      </div>


      {/* Track Modal */}
      {isModalOpen && (
        <TrackModal
          track={editingTrack}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTrack(null);
          }}
          onSave={async (trackData) => {
            try {
              if (editingTrack) {
                await api.patch(`/tracks/${editingTrack.id}/`, trackData);
              } else {
                await api.post('/tracks/', trackData);
              }
              await fetchTracks();
              setIsModalOpen(false);
              setEditingTrack(null);
            } catch (err) {
              console.error('Failed to save track:', err);
              alert('Failed to save track. Please check your inputs.');
            }
          }}
        />
      )}
    </div>
  );
}
