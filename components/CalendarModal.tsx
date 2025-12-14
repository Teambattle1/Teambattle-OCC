import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  if (!isOpen) return null;

  // Helper to get ISO week number
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    // We want Monday = 0, Sunday = 6 for rendering logic
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create array for grid
  const daysArray = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const monthName = new Intl.DateTimeFormat('da-DK', { month: 'long' }).format(currentDate);
  // Capitalize first letter
  const formattedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group days into weeks to display week numbers
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  
  // Pad the beginning of the first week if needed for proper alignment in the loop
  // The rendering logic above pushed nulls, let's reuse that array
  
  daysArray.forEach((day, index) => {
    if (index % 7 === 0 && index !== 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    // Pad end
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-battle-dark border border-battle-orange/30 w-full max-w-md rounded-2xl shadow-neon-strong overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-battle-grey/50 p-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
            <span className="text-battle-orange">{formattedMonthName}</span>
            <span>{year}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 hover:text-battle-orange transition-colors"><ChevronLeft /></button>
            <button onClick={nextMonth} className="p-1 hover:text-battle-orange transition-colors"><ChevronRight /></button>
            <button onClick={onClose} className="ml-4 text-white/50 hover:text-white"><X /></button>
          </div>
        </div>

        <div className="p-4">
          {/* Grid Header */}
          <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] mb-2 text-center text-xs text-battle-white/50 font-bold uppercase tracking-wider">
            <div>Uge</div>
            <div>Man</div>
            <div>Tir</div>
            <div>Ons</div>
            <div>Tor</div>
            <div>Fre</div>
            <div className="text-battle-orange/70">Lør</div>
            <div className="text-battle-orange/70">Søn</div>
          </div>

          {/* Days */}
          <div className="flex flex-col gap-1">
            {weeks.map((week, wIndex) => {
              // Get week number from the first valid date in the week
              const validDay = week.find(d => d !== null);
              const weekNum = validDay ? getWeekNumber(validDay) : '';

              return (
                <div key={wIndex} className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-y-2 text-center items-center">
                  <div className="text-xs text-battle-white/30 font-mono">{weekNum}</div>
                  {week.map((day, dIndex) => {
                    if (!day) return <div key={dIndex}></div>;

                    const isToday = day.getDate() === today.getDate() && 
                                    day.getMonth() === today.getMonth() && 
                                    day.getFullYear() === today.getFullYear();
                    
                    // 5 is Saturday (index 5 in 0-6 array), 6 is Sunday
                    const isWeekend = dIndex === 5 || dIndex === 6;

                    return (
                      <div key={dIndex} className="flex justify-center">
                        <div 
                          className={`
                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                            ${isToday 
                              ? 'bg-battle-orange text-white shadow-[0_0_10px_rgba(255,102,0,0.8)] font-bold' 
                              : isWeekend 
                                ? 'text-battle-orange/80 hover:bg-white/5' 
                                : 'text-white hover:bg-white/10'
                            }
                          `}
                        >
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-battle-grey/30 p-2 text-center">
           <button 
             onClick={() => setCurrentDate(new Date())}
             className="text-xs text-battle-orange hover:text-white uppercase tracking-widest font-bold"
           >
             Gå til i dag
           </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;