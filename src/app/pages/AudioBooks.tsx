import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';

export function AudioBooks() {
  return (
    <div className="space-y-12 pb-20">
      {/* 1. Manage Books (Collections) */}
      <SeriesList 
        type="audiobook"
        title="Audiobook Series"
        subtitle="Manage your book collections and authors"
        endpoint="/audiobook-series/"
      />

      <div className="border-t border-[#2A2A2A] pt-12">
        {/* 2. Manage Chapters (Audio Files) */}
        <MediaLibrary 
          category="Audiobooks" 
          title="Audiobook Chapters" 
          subtitle="Upload and manage individual chapters" 
          modalType="audiobook"
          customEndpoint="/audiobooks/"
        />
      </div>
    </div>
  );
}
