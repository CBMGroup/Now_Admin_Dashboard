import { useState, useEffect } from 'react';
import { api, resolveMediaUrl } from '../api/client';
import { Search, Edit, Trash2, UserPlus, CheckCircle2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { ArtistModal } from './ArtistModal';
import { Skeleton } from './ui/skeleton';

interface CreatorListProps {
  type: 'host' | 'author' | 'director' | 'poet';
  title: string;
  onBack: () => void;
}

export function CreatorList({ type, title, onBack }: CreatorListProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCreators();
  }, [type]);

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/artists/?creator_type=${type}`);
      setData(Array.isArray(res) ? res : (res.results || []));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingArtist) {
        await api.patch(`/artists/${editingArtist.id}/`, formData);
      } else {
        formData.append('creator_type', type);
        await api.post('/artists/', formData);
      }
      await fetchCreators();
      setIsModalOpen(false);
      setEditingArtist(null);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = data.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-[#2A2A2A] rounded-full text-[#A3A3A3] hover:text-[#F1F1F1] transition-colors"><ArrowLeft className="w-6 h-6" /></button>
            <div>
                <h2 className="text-2xl font-bold text-[#F1F1F1]">{title}</h2>
                <p className="text-[#A3A3A3] text-sm">Manage creators for this category</p>
            </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#00D1C1] text-black rounded-lg font-medium flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add {title.slice(0, -1)}
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
         <div className="p-4 border-b border-[#2A2A2A]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1]" />
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-[#0A0A0A]">
                    <tr className="text-left text-[#A3A3A3] text-xs uppercase tracking-widest font-bold">
                        <th className="p-4">Profile</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(a => (
                        <tr key={a.id} className="border-b border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors">
                            <td className="p-4">
                                <img src={resolveMediaUrl(a.avatar) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + a.name} className="w-10 h-10 rounded-full border border-[#2A2A2A]" />
                            </td>
                            <td className="p-4 font-medium text-[#F1F1F1]">{a.name}</td>
                            <td className="p-4">
                                {a.is_verified ? <CheckCircle2 className="w-5 h-5 text-[#22C55E]" /> : <span className="text-[#A3A3A3] text-xs italic">Pending</span>}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditingArtist(a); setIsModalOpen(true); }} className="p-2 hover:bg-[#2A2A2A] rounded-lg text-[#A3A3A3]"><Edit className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-[#2A2A2A] rounded-lg text-[#EF4444]"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <ArtistModal 
            artist={editingArtist} 
            onClose={() => { setIsModalOpen(false); setEditingArtist(null); }} 
            onSave={handleSave}
            isSaving={isSaving}
        />
      )}
    </div>
  );
}
