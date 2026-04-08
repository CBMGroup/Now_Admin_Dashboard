import { useState } from 'react';
import { Plus, Edit, Trash2, Lock, Globe } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

type Playlist = {
  id: string;
  title: string;
  creator: string;
  description: string;
  tracksCount: number;
  isPublic: boolean;
  cover: string;
};

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Chill Electronic',
    creator: 'Admin',
    description: 'Perfect electronic tracks for relaxing and unwinding',
    tracksCount: 45,
    isPublic: true,
    cover: 'https://images.unsplash.com/photo-1618336215696-6673cf4549ae?w=200',
  },
  {
    id: '2',
    title: 'Party Anthems',
    creator: 'DJ Neon',
    description: 'High-energy EDM tracks to get the party started',
    tracksCount: 32,
    isPublic: true,
    cover: 'https://images.unsplash.com/photo-1773408285355-a1d4a141ea1a?w=200',
  },
  {
    id: '3',
    title: 'Rock Classics',
    creator: 'The Wanderers',
    description: 'Timeless rock anthems from the best artists',
    tracksCount: 28,
    isPublic: false,
    cover: 'https://images.unsplash.com/photo-1762829026066-dcfa7e0f34fa?w=200',
  },
  {
    id: '4',
    title: 'Cosmic Journey',
    creator: 'Cosmic Beats',
    description: 'Experimental electronic sounds for deep listening',
    tracksCount: 18,
    isPublic: true,
    cover: 'https://images.unsplash.com/photo-1590310182704-037fe3509ada?w=200',
  },
];

export function Playlists() {
  const [playlists, setPlaylists] = useState(mockPlaylists);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Playlists Management</h1>
          <p className="text-[#A3A3A3] mt-1">Manage curated playlists and collections</p>
        </div>
        <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20">
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden hover:border-[#8B5CF6]/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={playlist.cover}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                {playlist.isPublic ? (
                  <div className="px-2.5 py-1 bg-[#22C55E] rounded-full flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">Public</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 bg-[#A3A3A3] rounded-full flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">Private</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#F1F1F1]">{playlist.title}</h3>
              <p className="text-sm text-[#A3A3A3] mt-1">by {playlist.creator}</p>
              <p className="text-sm text-[#A3A3A3] mt-2 line-clamp-2">
                {playlist.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2A2A2A]">
                <span className="text-sm text-[#A3A3A3]">
                  {playlist.tracksCount} tracks
                </span>
                <div className="flex items-center gap-2">
                  <Switch.Root
                    checked={playlist.isPublic}
                    onCheckedChange={(checked) => {
                      setPlaylists(playlists.map((p) => 
                        p.id === playlist.id ? { ...p, isPublic: checked } : p
                      ));
                    }}
                    className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button className="flex-1 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F1F1F1] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button className="flex-1 px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
