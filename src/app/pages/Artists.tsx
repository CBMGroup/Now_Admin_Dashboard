import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search, Edit, Eye, UserPlus, CheckCircle2, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { api, resolveMediaUrl } from '../api/client';
import { ArtistModal, Artist as ArtistType } from '../components/ArtistModal';

// Extend the basic ArtistType for the table view
type Artist = ArtistType & {
  tracksCount: number;
  albumsCount: number;
  created_at?: string;
};

const columnHelper = createColumnHelper<Artist>();

export function Artists() {
  const [data, setData] = useState<Artist[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/artists/');
      // Map potential backend array to local array (adding dummy counts if none exist)
      setData(res.map((a: any) => ({
        ...a,
        tracksCount: a.tracks_count || 0,
        albumsCount: a.albums_count || 0
      })));
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArtist = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingArtist) {
        await api.patch(`/artists/${editingArtist.id}/`, formData);
      } else {
        await api.post('/artists/', formData);
      }
      await fetchArtists();
      setIsModalOpen(false);
      setEditingArtist(null);
    } catch (error) {
      console.error('Failed to save artist:', error);
      alert('Failed to save artist. Please check missing fields or file limits.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (confirm('Are you sure you want to delete this artist? All associated albums and tracks may be affected.')) {
      try {
        await api.delete(`/artists/${id}/`);
        await fetchArtists();
      } catch (error) {
        console.error('Failed to delete artist:', error);
        alert('Failed to delete artist.');
      }
    }
  };

  const columns = [
    columnHelper.accessor('avatar_url', {
      header: '',
      cell: (info) => {
        const url = resolveMediaUrl(info.row.original.avatar || info.getValue()) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';
        return (
          <img
            src={url as string}
            alt="Avatar"
            className="w-12 h-12 rounded-full border-2 border-[#2A2A2A] object-cover"
          />
        );
      },
      size: 70,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => {
        const artist = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#F1F1F1]">{info.getValue()}</span>
            {artist.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('bio', {
      header: 'Bio',
      cell: (info) => (
        <span className="text-[#A3A3A3] text-sm line-clamp-2 max-w-md">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'content',
      header: 'Content',
      cell: (info) => {
        const artist = info.row.original;
        return (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#A3A3A3]">
              <span className="text-[#F1F1F1] font-medium">{artist.tracksCount}</span> tracks
            </span>
            <span className="text-[#A3A3A3]">
              <span className="text-[#F1F1F1] font-medium">{artist.albumsCount}</span> albums
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('is_verified', {
      header: 'Verified',
      cell: (info) => {
        const artist = info.row.original;
        const [isUpdating, setIsUpdating] = useState(false);
        return (
          <div className="flex items-center">
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6] mr-2" /> : null}
            <Switch.Root
              checked={info.getValue()}
              onCheckedChange={async (checked) => {
                setIsUpdating(true);
                try {
                  const fd = new FormData();
                  fd.append('is_verified', checked.toString());
                  await api.patch(`/artists/${artist.id}/`, fd);
                  setData(data.map((a) => a.id === artist.id ? { ...a, is_verified: checked } : a));
                } catch(e) { console.error(e); }
                setIsUpdating(false);
              }}
              className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors disabled:opacity-50"
              disabled={isUpdating}
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Joined',
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className="text-[#A3A3A3]">
             {val ? new Date(val).toLocaleDateString() : 'Unknown'}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
           <button 
            onClick={() => {
              setEditingArtist(info.row.original);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
           >
            <Edit className="w-4 h-4 text-[#A3A3A3]" />
          </button>
          <button 
            onClick={() => handleDeleteArtist(info.row.original.id)}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
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

  const pendingVerifications = data.filter((a) => !a.is_verified).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Artists Management</h1>
          <p className="text-[#A3A3A3] mt-1">
            Manage artists and their verification status
            {pendingVerifications > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#8B5CF6] text-white rounded-full text-xs font-semibold">
                {pendingVerifications} pending verification
              </span>
            )}
          </p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <UserPlus className="w-5 h-5" />
          Add Artist
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search artists..."
            className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
          />
        </div>
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
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2A2A]">
          <p className="text-sm text-[#A3A3A3]">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )}{' '}
            of {data.length} artists
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
      
      {/* Modals */}
      {isModalOpen && (
        <ArtistModal
           artist={editingArtist}
           onClose={() => {
              setIsModalOpen(false);
              setEditingArtist(null);
           }}
           onSave={handleSaveArtist}
           isSaving={isSaving}
        />
      )}

    </div>
  );
}
