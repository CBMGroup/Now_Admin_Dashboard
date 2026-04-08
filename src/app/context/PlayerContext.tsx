import { createContext, useContext, useState } from 'react';

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audio_file?: string;
};

type PlayerContextType = {
  currentTrack: PlayerTrack | null;
  setCurrentTrack: (track: PlayerTrack | null) => void;
};

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);

  return (
    <PlayerContext.Provider value={{ currentTrack, setCurrentTrack }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
