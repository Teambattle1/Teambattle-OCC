import React, { useState } from 'react';
import { Play, ChevronRight } from 'lucide-react';

interface VideoIndexItem {
  title: string;
  index: number;
  videoId?: string;
}

interface VideoPlayerProps {
  title: string;
  videoId?: string;
  playlistId?: string;
  videoIndex?: VideoIndexItem[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, videoId, playlistId, videoIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(
    videoIndex?.[0]?.videoId
  );

  // Build the embed URL based on whether it's a video or playlist
  // If we have a specific videoId from the index, use that with the playlist
  const getEmbedUrl = (index: number = 0, specificVideoId?: string) => {
    if (specificVideoId && index < 0) {
      // Standalone video not in playlist (negative index indicates standalone)
      return `https://www.youtube.com/embed/${specificVideoId}?rel=0&modestbranding=1`;
    }
    if (specificVideoId && playlistId) {
      // Use specific video ID with playlist context
      return `https://www.youtube.com/embed/${specificVideoId}?list=${playlistId}&rel=0&modestbranding=1`;
    }
    if (playlistId) {
      // YouTube uses 1-based indexing for playlists
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&index=${index + 1}&rel=0&modestbranding=1`;
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  const handleVideoSelect = (index: number, specificVideoId?: string) => {
    setCurrentIndex(index);
    setCurrentVideoId(specificVideoId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-3 tablet:p-4 lg:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-2 tablet:gap-3 mb-3 tablet:mb-4 lg:mb-6">
          <Play className="w-6 h-6 tablet:w-7 tablet:h-7 lg:w-8 lg:h-8 text-battle-orange" />
          <h2 className="text-base tablet:text-lg lg:text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
        </div>

        {/* Layout: Side by side on tablet landscape */}
        <div className={`${videoIndex && videoIndex.length > 0 ? 'tablet:flex tablet:gap-4' : ''}`}>
          {/* Video Container */}
          <div className={`relative w-full ${videoIndex && videoIndex.length > 0 ? 'tablet:w-3/5' : ''} aspect-video rounded-lg tablet:rounded-xl overflow-hidden bg-battle-black border border-white/10`}>
            <iframe
              key={`${currentIndex}-${currentVideoId}`}
              className="absolute inset-0 w-full h-full"
              src={getEmbedUrl(currentIndex, currentVideoId)}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video Index - Side panel on tablet */}
          {videoIndex && videoIndex.length > 0 && (
            <div className="mt-4 tablet:mt-0 tablet:w-2/5 tablet:max-h-[400px] tablet:overflow-y-auto tablet:scrollbar-thin">
              <h3 className="text-xs tablet:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 tablet:mb-3 tablet:sticky tablet:top-0 tablet:bg-battle-grey/90 tablet:py-2 tablet:backdrop-blur-sm">
                Videoindeks ({videoIndex.length})
              </h3>
              <div className="grid grid-cols-2 tablet:grid-cols-1 gap-1.5 tablet:gap-2">
                {videoIndex.map((video) => (
                  <button
                    key={video.index}
                    onClick={() => handleVideoSelect(video.index, video.videoId)}
                    className={`flex items-center gap-2 px-2.5 tablet:px-3 py-2.5 tablet:py-3 rounded-lg text-left transition-all duration-200 touch-manipulation active:scale-98 ${
                      currentIndex === video.index
                        ? 'bg-battle-orange/20 border border-battle-orange/50 text-battle-orange'
                        : 'bg-battle-black/50 border border-white/5 text-gray-300 hover:bg-battle-grey/30 active:bg-battle-grey/40 hover:text-white hover:border-white/10'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 tablet:w-6 tablet:h-6 rounded-full flex items-center justify-center text-[10px] tablet:text-xs font-bold ${
                      currentIndex === video.index
                        ? 'bg-battle-orange text-white'
                        : 'bg-battle-grey/50 text-gray-400'
                    }`}>
                      {video.index + 1}
                    </span>
                    <span className="flex-1 text-xs tablet:text-sm font-medium truncate">{video.title}</span>
                    <ChevronRight className={`w-3 h-3 tablet:w-4 tablet:h-4 flex-shrink-0 ${
                      currentIndex === video.index ? 'text-battle-orange' : 'text-gray-600'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
