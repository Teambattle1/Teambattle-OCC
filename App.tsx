import React, { useState } from 'react';
import { 
  HUB_LINKS, 
  ACTIVITY_LINKS, 
  ECONOMY_LINKS, 
  CODING_LINKS, 
  TASK_CONTROL_LINKS,
  TOOLS_LINKS,
  OFFICE_LINKS
} from './constants';
import HubButton from './components/HubButton';
import Clock from './components/Clock';
import CalendarModal from './components/CalendarModal';
import { 
  ShieldCheck, 
  House, 
  Calendar, 
  Wallet, 
  Code,
  ClipboardList,
  Wrench,
  Briefcase
} from 'lucide-react';
import { HubLink } from './types';

type ViewState = 'main' | 'activities' | 'economy' | 'coding' | 'task_control' | 'tools' | 'office';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const changeView = (view: ViewState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
    }, 300);
  };

  const handleLinkClick = (link: HubLink) => {
    if (link.title === 'ACTIVITIES') changeView('activities');
    else if (link.title === 'ECONOMY') changeView('economy');
    else if (link.title === 'CODING') changeView('coding');
    else if (link.title === 'TASKS') changeView('task_control');
    else if (link.title === 'TOOLS') changeView('tools');
    else if (link.title === 'OFFICE') changeView('office');
  };

  const handleBackClick = () => {
    // Nested navigation logic
    if (currentView === 'economy') {
      changeView('office');
    } else {
      changeView('main');
    }
  };

  let currentLinks: HubLink[] = HUB_LINKS;
  let viewTitle = 'TEAMBATTLE';
  let viewSubtitle = 'Operational Command Center';
  let ViewIcon = ShieldCheck;

  switch (currentView) {
    case 'activities':
      currentLinks = ACTIVITY_LINKS;
      viewTitle = 'ACTIVITIES';
      viewSubtitle = 'Activity Protocols';
      ViewIcon = ShieldCheck;
      break;
    case 'economy':
      currentLinks = ECONOMY_LINKS;
      viewTitle = 'ECONOMY';
      viewSubtitle = 'Financial Systems';
      ViewIcon = Wallet;
      break;
    case 'coding':
      currentLinks = CODING_LINKS;
      viewTitle = 'CODING';
      viewSubtitle = 'Development Tools';
      ViewIcon = Code;
      break;
    case 'task_control':
      currentLinks = TASK_CONTROL_LINKS;
      viewTitle = 'TASKS';
      viewSubtitle = 'Admin & Operations';
      ViewIcon = ClipboardList;
      break;
    case 'tools':
      currentLinks = TOOLS_LINKS;
      viewTitle = 'TOOLS';
      viewSubtitle = 'Utility Functions';
      ViewIcon = Wrench;
      break;
    case 'office':
      currentLinks = OFFICE_LINKS;
      viewTitle = 'OFFICE';
      viewSubtitle = 'Corporate Suite';
      ViewIcon = Briefcase;
      break;
    case 'main':
    default:
      currentLinks = HUB_LINKS;
      viewTitle = 'TEAMBATTLE';
      viewSubtitle = 'Operational Command Center';
      ViewIcon = ShieldCheck;
      break;
  }

  // Grid layout logic
  let gridClass = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-12 justify-items-center max-w-7xl mx-auto";
  
  if (currentView === 'activities') {
    gridClass = "grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-x-10 md:gap-y-12 justify-items-center max-w-4xl mx-auto";
  } else if (currentView === 'economy' || currentView === 'coding' || currentView === 'tools') {
    gridClass = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-x-10 md:gap-y-12 justify-items-center max-w-2xl mx-auto";
  } else if (currentView === 'task_control' || currentView === 'office') {
    gridClass = "grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-x-10 md:gap-y-12 justify-items-center max-w-4xl mx-auto";
  } else if (currentView === 'main') {
    // 5 items, centered nicely
    gridClass = "flex flex-wrap justify-center gap-8 md:gap-12 max-w-6xl mx-auto";
  }

  return (
    <div className="min-h-screen w-full bg-battle-black text-white selection:bg-battle-orange selection:text-white overflow-x-hidden flex flex-col relative">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Orange Glow Top Left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-battle-orange/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        {/* White Glow Bottom Right */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Top Left Back Button (Same height/styling as calendar) */}
      {currentView !== 'main' && (
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
          <button 
            onClick={handleBackClick}
            className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-300"
            title="Return"
          >
            <House className="w-6 h-6 md:w-7 md:h-7 group-hover:text-battle-orange transition-colors" />
          </button>
        </div>
      )}

      {/* Center Top Clock */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Clock />
      </div>

      {/* Top Right Calendar Button */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={() => setIsCalendarOpen(true)}
          className="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-300"
        >
          <Calendar className="w-6 h-6 md:w-7 md:h-7 group-hover:text-battle-orange transition-colors" />
        </button>
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      {/* Main Content Container */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-start pt-24 md:pt-32 px-4">
        
        {/* Header Section */}
        <header className="w-full max-w-6xl mx-auto mb-10 md:mb-16 relative flex flex-col items-center justify-center">
          
          {/* Centered Title Content - Text centered, Icon absolute left */}
          <div className="text-center flex flex-col items-center">
            
            <div className="relative flex items-center justify-center mb-2">
               {/* Icon Positioned Absolute Left of the Title */}
               <div className="absolute right-full mr-4 md:mr-6 text-battle-orange drop-shadow-[0_0_10px_rgba(255,102,0,0.5)] flex items-center">
                 <ViewIcon className="w-10 h-10 md:w-14 md:h-14" />
               </div>

               <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-battle-orange">
                {viewTitle}
              </h1>
            </div>
            
            <p className="text-battle-white/50 text-sm md:text-lg tracking-[0.2em] uppercase">
              {viewSubtitle}
            </p>
            <div className="h-1 w-24 bg-battle-orange mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(255,102,0,1)]"></div>
          </div>
        </header>

        {/* The Grid */}
        <div className={`w-full max-w-6xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className={gridClass}>
            {currentLinks.map((link, index) => (
              <HubButton 
                key={link.id} 
                link={link} 
                index={index}
                onClick={handleLinkClick}
              />
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-battle-grey text-xs uppercase tracking-widest mt-auto">
        <p>&copy; {new Date().getFullYear()} TeamBattle Systems. Authorized Personnel Only.</p>
      </footer>

    </div>
  );
};

export default App;