import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Slides will be stored in Supabase storage or public folder
// Path format: /teamrace-instructions/1.png, /teamrace-instructions/2.png, etc.
const STORAGE_BASE_URL = 'https://ilbjytyukicbssqftmma.supabase.co/storage/v1/object/public/guide-images/teamrace-instructions';

interface TeamRaceInstructionsProps {
  totalSlides?: number;
}

const TeamRaceInstructions: React.FC<TeamRaceInstructionsProps> = ({ totalSlides = 10 }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const goToSlide = useCallback((slide: number) => {
    if (slide < 1) setCurrentSlide(totalSlides);
    else if (slide > totalSlides) setCurrentSlide(1);
    else setCurrentSlide(slide);
    setZoom(100); // Reset zoom when changing slides
    setImageError(false);
  }, [totalSlides]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const slideContent = (
    <div
      className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fullscreen close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Zoom controls */}
      <div className={`flex items-center justify-center gap-2 py-2 ${isFullscreen ? 'bg-black/80' : 'bg-battle-grey/20'}`}>
        <button
          onClick={zoomOut}
          disabled={zoom <= 50}
          className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom ud (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          className="px-3 py-1.5 bg-battle-grey/50 border border-white/10 rounded-lg text-white text-sm hover:bg-battle-grey/70 transition-colors min-w-[60px]"
          title="Nulstil zoom (0)"
        >
          {zoom}%
        </button>
        <button
          onClick={zoomIn}
          disabled={zoom >= 300}
          className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom ind (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors ml-2"
          title="Nulstil (0)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main image container */}
      <div
        className={`flex-grow flex items-center justify-center overflow-auto ${isFullscreen ? 'p-4' : 'p-2'}`}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-center">Billede ikke fundet</p>
              <p className="text-sm text-gray-500 mt-2">Side {currentSlide}</p>
              <p className="text-xs text-gray-600 mt-4">Upload billeder til:</p>
              <code className="text-xs text-battle-orange mt-1 bg-black/30 px-2 py-1 rounded">
                {STORAGE_BASE_URL}/{currentSlide}.png
              </code>
            </div>
          ) : (
            <img
              src={`${STORAGE_BASE_URL}/${currentSlide}.png`}
              alt={`Samlevejledning Side ${currentSlide}`}
              className={`max-w-full object-contain ${isFullscreen ? 'max-h-[calc(100vh-180px)]' : 'max-h-[55vh] tablet:max-h-[60vh]'}`}
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      {/* Navigation controls */}
      <div className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-black/80' : 'bg-battle-grey/20'}`}>
        {/* Previous button */}
        <button
          onClick={prevSlide}
          className="flex items-center gap-1 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden tablet:inline text-sm uppercase">Forrige</span>
        </button>

        {/* Slide indicator */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => goToSlide(i + 1)}
                className={`w-2.5 h-2.5 rounded-full transition-all touch-manipulation ${
                  currentSlide === i + 1
                    ? 'bg-battle-orange w-6'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400 ml-2">
            {currentSlide} / {totalSlides}
          </span>
        </div>

        {/* Next button */}
        <button
          onClick={nextSlide}
          className="flex items-center gap-1 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors touch-manipulation"
        >
          <span className="hidden tablet:inline text-sm uppercase">Næste</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fullscreen toggle (non-fullscreen mode) */}
      {!isFullscreen && (
        <div className="flex justify-center py-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Fuld skærm (F)</span>
          </button>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return slideContent;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl overflow-hidden backdrop-blur-sm">
        {slideContent}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
        <p>Brug piletaster eller swipe for at navigere</p>
        <p>Brug +/- eller zoom-knapperne for at zoome</p>
      </div>
    </div>
  );
};

export default TeamRaceInstructions;
