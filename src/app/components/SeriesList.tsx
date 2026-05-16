import { useState, useEffect } from 'react';
import { Grid, List, Plus, Edit, Trash2, Play, Loader2 } from 'lucide-react';
import { api, resolveMediaUrl } from '../api/client';
import { SeriesModal } from './SeriesModal';
import { Skeleton } from './ui/skeleton';

interface SeriesListProps {
  type: 'podcast' | 'audiobook' | 'audioplay';
  title: string;
  subtitle: string;
  endpoint: string;
}

export function SeriesList({ type, title, subtitle, endpoint }: SeriesListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(endpoint);
      setItems(Array.isArray(res) ? res : (res.results || []));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.patch(`${endpoint}${editingItem.id}/`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      await fetchItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      await api.delete(`${endpoint}${id}/`);
      await fetchItems();
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F1F1F1]">{title}</h2>
          <p className="text-[#A3A3A3] text-sm">{subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add {type.replace('audio', 'Audio ')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden group">
            <div className="aspect-square relative">
              <img src={resolveMediaUrl(item.cover) || 'https://api.dicebear.com/7.x/initials/svg?seed=' + item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Edit className="w-5 h-5 text-white" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40"><Trash2 className="w-5 h-5 text-red-500" /></button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#F1F1F1] truncate">{item.title}</h3>
              <p className="text-xs text-[#A3A3A3] mt-1">{item.host_name || item.author_name || item.director_name}</p>
              <div className="mt-2 text-[10px] text-[#A3A3A3] uppercase tracking-widest">{item.track_count || 0} Tracks</div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <SeriesModal 
          type={type} 
          data={editingItem} 
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
