import { Play, Pause, SkipBack, SkipForward, Volume2, X, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audio_file?: string;
};

interface MiniPlayerProps {
  track: Track;
  onClose: () => void;
}

export function MiniPlayer({ track, onClose }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    // New track selected
    if (audioRef.current) {
      setIsPlaying(true);
      setIsBuffering(true);
    }
  }, [track]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsBuffering(false);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-[280px] right-0 h-24 bg-[#1A1A1A]/80 backdrop-blur-xl border-t border-[#2A2A2A] px-8 flex items-center gap-8 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <audio
        ref={audioRef}
        src={track.audio_file}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-[300px] min-w-0">
        <div className="relative group">
          <img
            src={track.cover}
            alt={track.title}
            className="w-16 h-16 rounded-xl object-cover shadow-2xl transition-transform group-hover:scale-105"
          />
          {isBuffering && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#F1F1F1] truncate group-hover:text-[#8B5CF6] transition-colors">
            {track.title}
          </h3>
          <p className="text-sm text-[#A3A3A3] truncate font-medium">{track.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-3">
        <div className="flex items-center gap-6">
          <button className="p-2 text-[#A3A3A3] hover:text-[#F1F1F1] hover:bg-[#2A2A2A] rounded-full transition-all">
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] hover:scale-110 active:scale-95 rounded-full flex items-center justify-center transition-all shadow-xl shadow-purple-500/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            )}
          </button>

          <button className="p-2 text-[#A3A3A3] hover:text-[#F1F1F1] hover:bg-[#2A2A2A] rounded-full transition-all">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <span className="text-xs font-mono text-[#A3A3A3] w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div 
            onClick={handleSeek}
            className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden cursor-pointer relative group"
          >
            <div
              className="absolute inset-0 bg-[#3A3A3A] opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22C55E] rounded-full transition-all relative z-10"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#A3A3A3] w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Close */}
      <div className="w-[300px] flex items-center gap-4 justify-end">
        <div className="flex items-center gap-3 group">
          <Volume2 className="w-5 h-5 text-[#A3A3A3] group-hover:text-[#F1F1F1] transition-colors" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-24 h-1 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer accent-[#8B5CF6] hover:accent-[#7C3AED] transition-all"
          />
        </div>
        <div className="h-6 w-[1px] bg-[#2A2A2A] mx-2" />
        <button
          onClick={onClose}
          className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#2A2A2A] rounded-xl transition-all"
          title="Close player"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
