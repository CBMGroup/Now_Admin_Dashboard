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
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Free' | 'Premium' | 'Student' | 'Admin';
  status: boolean;
  joinedDate: string;
};

const roleColors: Record<string, string> = {
  Free: 'bg-[#A3A3A3] text-white',
  Premium: 'bg-[#8B5CF6] text-white',
  Student: 'bg-[#3B82F6] text-white',
  Admin: 'bg-[#F59E0B] text-white',
};

const columnHelper = createColumnHelper<User>();

export function Users() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setData(res.map((u: any) => ({
        id: u.id.toString(),
        name: u.username,
        email: u.email,
        avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'Free',
        status: u.is_active,
        joinedDate: u.date_joined,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, newStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}/`, { is_active: newStatus });
      setData(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const columns = [
    columnHelper.accessor('avatar', {
      header: '',
      cell: (info) => (
        <img
          src={info.getValue()}
          alt="Avatar"
          className="w-10 h-10 rounded-full bg-[#0A0A0A]"
        />
      ),
      size: 60,
    }),
    columnHelper.accessor('name', {
      header: 'Username',
      cell: (info) => (
        <span className="font-medium text-[#F1F1F1]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => (
        <span className="text-[#A3A3A3]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[info.getValue()] || 'bg-gray-500'}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Active',
      cell: (info) => {
        const user = info.row.original;
        return (
          <Switch.Root
            checked={info.getValue()}
            onCheckedChange={(checked) => handleStatusToggle(user.id, checked)}
            className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        );
      },
    }),
    columnHelper.accessor('joinedDate', {
      header: 'Joined Date',
      cell: (info) => (
        <span className="text-[#A3A3A3]">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-[#A3A3A3]" />
          </button>
          <button className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
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

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-[#A3A3A3] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium">Loading user directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-bold">Error loading users</p>
        <p className="text-[#A3A3A3]">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg transition-colors hover:border-red-500/50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Users Management</h1>
          <p className="text-[#A3A3A3] mt-1">Manage platform users and their permissions</p>
        </div>
        <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20">
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, email..."
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
                    No users found matching your search.
                  </td>
                </tr>
              )}
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
            of {data.length} users
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
    </div>
  );
}
