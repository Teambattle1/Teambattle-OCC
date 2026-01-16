import React, { useState, useEffect, useCallback } from 'react';
import { Play, ArrowLeft, Edit3, Save, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  length: string;
}

const TEAMROBIN_VIDEOS: VideoItem[] = [
  { id: 'J_XSDOSvzJs', title: '1. Opstilling, kort', length: '0:48' },
  { id: '5zkAMpvoQg8', title: '2. Opsæt 1', length: '2:08' },
  { id: 'oWr-nciyP-I', title: '3. Opsæt 2', length: '1:52' },
  { id: 'vUA4Rxyi3i0', title: '4. Afstande', length: '0:31' },
  { id: 'Uzo3a2Rigyo', title: '5. Spænd buen', length: '0:44' },
  { id: 'kzBUv7g-bs0', title: '6. Typer buer', length: '0:40' },
  { id: 'TDVa4GHEpFQ', title: '7. Skydebord og Piletyper', length: '1:22' },
  { id: 'CgDJ8pEUgRc', title: '8. Placering af pilen', length: '0:58' },
  { id: '-dZhuUaauVA', title: '9. Mesterøjet + sigte', length: '0:32' },
  { id: 'gTd6qxcVUYM', title: '10. Instruktion', length: '1:42' },
];

const STORAGE_KEY = 'teamrobin_video_titles';

interface TeamRobinVideoGridProps {
  onBack?: () => void;
}

const TeamRobinVideoGrid: React.FC<TeamRobinVideoGridProps> = ({ onBack }) => {
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Load custom titles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomTitles(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved titles');
      }
    }
  }, []);

  // Save custom titles to localStorage
  const saveTitles = useCallback((newTitles: Record<string, string>) => {
    setCustomTitles(newTitles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTitles));
  }, []);

  // Get title for a video (custom or default)
  const getTitle = (video: VideoItem) => {
    return customTitles[video.id] || video.title;
  };

  // Start editing a title
  const startEditing = (video: VideoItem) => {
    setEditingId(video.id);
    setEditValue(getTitle(video));
  };

  // Save edited title
  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      const original = TEAMROBIN_VIDEOS.find(v => v.id === editingId);
      if (original && editValue.trim() !== original.title) {
        saveTitles({ ...customTitles, [editingId]: editValue.trim() });
      } else if (original && editValue.trim() === original.title) {
        // If reverted to original, remove custom title
        const newTitles = { ...customTitles };
        delete newTitles[editingId];
        saveTitles(newTitles);
      }
    }
    setEditingId(null);
    setEditValue('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="h-screen bg-battle-black flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 tablet-landscape:pt-2 tablet-landscape:pb-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Play className="w-6 h-6 text-lightgreen" />
            <h1 className="text-lg tablet-landscape:text-xl font-bold text-white uppercase tracking-wider">
              TeamRobin Video Guides
            </h1>
          </div>
          <div className="text-xs text-gray-500">
            {TEAMROBIN_VIDEOS.length} videoer
          </div>
        </div>
      </div>

      {/* Video Grid - fills remaining space */}
      <div className="flex-1 px-4 pb-4 tablet-landscape:pb-2 overflow-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-5 desktop:grid-cols-5 gap-3 tablet-landscape:gap-3">
          {TEAMROBIN_VIDEOS.map((video) => (
            <div
              key={video.id}
              className="bg-battle-grey rounded-lg overflow-hidden border border-white/10 hover:border-lightgreen/50 transition-colors flex flex-col"
            >
              {/* Video Title - editable */}
              <div className="px-2 py-1.5 border-b border-white/10 flex-shrink-0 min-h-[40px] flex items-center justify-between gap-1">
                {editingId === video.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 bg-battle-black/50 text-white text-xs px-2 py-1 rounded border border-lightgreen/50 focus:outline-none focus:border-lightgreen"
                    />
                    <button
                      onClick={saveEdit}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-medium text-xs uppercase tracking-wider line-clamp-2 flex-1">
                      {getTitle(video)}
                    </h3>
                    <button
                      onClick={() => startEditing(video)}
                      className="p-1 text-gray-500 hover:text-lightgreen transition-colors flex-shrink-0"
                      title="Rediger titel"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Duration badge */}
              <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                {video.length}
              </div>

              {/* Embedded YouTube Video */}
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={getTitle(video)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamRobinVideoGrid;
