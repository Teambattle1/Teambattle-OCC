import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = new Intl.DateTimeFormat('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(time);

  const dateString = new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(time);

  return (
    <div className="flex flex-col items-center font-mono z-50">
      <div className="text-lg md:text-xl font-bold text-battle-orange tracking-widest drop-shadow-[0_0_8px_rgba(255,102,0,0.6)]">
        {timeString}
      </div>
      <div className="text-[10px] text-battle-white/70 uppercase tracking-widest mt-0.5">
        {dateString}
      </div>
    </div>
  );
};

export default Clock;