import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';

export function Podcasts() {
  return (
    <div className="space-y-12 pb-20">
      <SeriesList 
        type="podcast"
        title="Podcast Series"
        subtitle="Manage your podcast shows and hosts"
        endpoint="/podcast-series/"
      />

      <div className="border-t border-[#2A2A2A] pt-12">
        <MediaLibrary 
          category="Podcast" 
          title="Podcast Episodes" 
          subtitle="Upload and manage show episodes" 
          modalType="podcast"
          customEndpoint="/podcasts/"
        />
      </div>
    </div>
  );
}
