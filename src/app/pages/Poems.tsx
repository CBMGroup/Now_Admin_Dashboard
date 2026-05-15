import { MediaLibrary } from '../components/MediaLibrary';

export function Poems() {
  return (
    <MediaLibrary 
      category="Poems" 
      title="Poems & Poetry" 
      subtitle="Manage all spoken word and poetry tracks" 
      modalType="poem"
      customEndpoint="/poems/"
    />
  );
}
