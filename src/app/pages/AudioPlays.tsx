import { MediaLibrary } from '../components/MediaLibrary';

export function AudioPlays() {
  return (
    <MediaLibrary 
      category="Audio Plays" 
      title="Audio Plays" 
      subtitle="Manage all audio dramas and plays" 
      modalType="audioplay"
      customEndpoint="/audioplays/"
    />
  );
}
