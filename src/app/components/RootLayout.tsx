import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MiniPlayer } from './MiniPlayer';
import { usePlayer } from '../context/PlayerContext';

export function RootLayout() {
  const { currentTrack, setCurrentTrack } = usePlayer();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <div className="ml-[280px]">
        <Navbar />
        <main className={`p-6 ${currentTrack ? 'pb-32' : ''}`}>
          <Outlet />
        </main>
      </div>
      {currentTrack && (
        <MiniPlayer
          track={currentTrack}
          onClose={() => setCurrentTrack(null)}
        />
      )}
    </div>
  );
}
