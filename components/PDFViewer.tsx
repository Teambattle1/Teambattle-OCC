import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  totalPages?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title = 'PDF Document', totalPages = 1 }) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Construct PDF URL with page parameter
  const pdfUrlWithPage = `${pdfUrl}#page=${currentPage}`;

  const content = (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}`}>
      {/* Header with controls */}
      <div className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-black/90' : 'bg-battle-grey/30'} border-b border-white/10`}>
        {/* Title */}
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-battle-orange" />
          <span className="text-white font-medium text-sm tablet:text-base">{title}</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom <= 50}
            className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom ud"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1.5 bg-battle-grey/50 border border-white/10 rounded-lg text-white text-sm hover:bg-battle-grey/70 transition-colors min-w-[60px]"
          >
            {zoom}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= 200}
            className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom ind"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-2 bg-battle-grey/50 border border-white/10 rounded-lg text-white hover:bg-battle-grey/70 transition-colors"
          title={isFullscreen ? 'Afslut fuld skærm' : 'Fuld skærm'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close button in fullscreen */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* PDF container */}
      <div
        className={`flex-grow overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[50vh] tablet:h-[60vh]'}`}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div
          className="flex justify-center p-4"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            minHeight: zoom > 100 ? `${zoom}%` : '100%'
          }}
        >
          <iframe
            src={pdfUrlWithPage}
            className="w-full max-w-4xl bg-white rounded-lg shadow-2xl"
            style={{
              height: isFullscreen ? '80vh' : '55vh',
              border: 'none'
            }}
            title={title}
          />
        </div>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-4 py-3 ${isFullscreen ? 'bg-black/90' : 'bg-battle-grey/30'} border-t border-white/10`}>
          {/* Previous button */}
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden tablet:inline text-sm uppercase">Forrige</span>
          </button>

          {/* Page indicator with dots */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`w-3 h-3 rounded-full transition-all touch-manipulation ${
                    currentPage === i + 1
                      ? 'bg-battle-orange w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title={`Side ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-white font-medium ml-2">
              Side {currentPage} af {totalPages}
            </span>
          </div>

          {/* Next button */}
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            <span className="hidden tablet:inline text-sm uppercase">Næste</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Page count badge */}
      {totalPages > 1 && !isFullscreen && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-battle-orange/10 border border-battle-orange/20 rounded-full">
            <FileText className="w-4 h-4 text-battle-orange" />
            <span className="text-battle-orange text-sm font-medium">{totalPages} sider i dokumentet</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return content;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl overflow-hidden backdrop-blur-sm">
        {content}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Brug zoom-knapperne for at forstørre dokumentet</p>
      </div>
    </div>
  );
};

export default PDFViewer;
