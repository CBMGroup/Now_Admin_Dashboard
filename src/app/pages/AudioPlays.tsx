import { MediaLibrary } from '../components/MediaLibrary';
import { SeriesList } from '../components/SeriesList';

export function AudioPlays() {
  return (
    <div className="space-y-12 pb-20">
      <SeriesList 
        type="audioplay"
        title="Audio Plays"
        subtitle="Manage your plays and directors"
        endpoint="/audioplay-series/"
      />

      <div className="border-t border-[#2A2A2A] pt-12">
        <MediaLibrary 
          category="Audio Plays" 
          title="Play Acts" 
          subtitle="Manage acts and performances" 
          modalType="audioplay"
          customEndpoint="/audioplays/"
        />
      </div>
    </div>
  );
}
