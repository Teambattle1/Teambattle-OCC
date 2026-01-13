import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';

const TOTAL_SLIDES = 12;

const FlybrixManual: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goToSlide = useCallback((slide: number) => {
    if (slide < 1) setCurrentSlide(TOTAL_SLIDES);
    else if (slide > TOTAL_SLIDES) setCurrentSlide(1);
    else setCurrentSlide(slide);
  }, []);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

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

      {/* Main image container */}
      <div className={`flex-grow flex items-center justify-center ${isFullscreen ? 'p-4' : 'p-2'}`}>
        <img
          src={`/flybrix-manual/${currentSlide}.png`}
          alt={`Flybrix Manual Side ${currentSlide}`}
          className={`max-w-full max-h-full object-contain ${isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[60vh] tablet:max-h-[65vh]'}`}
        />
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
            {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
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
            {currentSlide} / {TOTAL_SLIDES}
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
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Brug piletaster eller swipe for at navigere</p>
      </div>
    </div>
  );
};

export default FlybrixManual;
