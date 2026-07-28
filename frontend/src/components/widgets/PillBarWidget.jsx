import React from 'react';
import { cn } from '../../utils/cn';

const pillData = [
  { id: 1, topVal: 52, bottomVal: 81, topColor: 'white', bottomColor: 'orange', offsetTop: 30, offsetBottom: -20 },
  { id: 2, topVal: 96, bottomVal: 25, topColor: 'green', bottomColor: 'orange', offsetTop: 10, offsetBottom: 10 },
  { id: 3, topVal: 48, bottomVal: 51, topColor: 'green', bottomColor: 'white', offsetTop: 40, offsetBottom: -10 },
  { id: 4, topVal: 80, bottomVal: 49, topColor: 'green', bottomColor: 'orange', offsetTop: 20, offsetBottom: 0 },
  { id: 5, topVal: 34, bottomVal: 67, topColor: 'orange', bottomColor: 'green', offsetTop: 50, offsetBottom: -30 },
  { id: 6, topVal: 92, bottomVal: 28, topColor: 'green', bottomColor: 'white', offsetTop: 0, offsetBottom: 20 },
  { id: 7, topVal: 58, bottomVal: 20, topColor: 'green', bottomColor: 'orange', offsetTop: 30, offsetBottom: 10 },
  { id: 8, topVal: 84, bottomVal: 39, topColor: 'orange', bottomColor: 'green', offsetTop: 10, offsetBottom: -10 },
  { id: 9, topVal: 36, bottomVal: 72, topColor: 'white', bottomColor: 'orange', offsetTop: 40, offsetBottom: -20 },
];

const getColorCode = (color) => {
  if (color === 'green') return 'bg-[#9df854] text-black';
  if (color === 'orange') return 'bg-[#fca016] text-black';
  return 'bg-white text-black';
};

const PillBarWidget = () => {
  return (
    <div className="bg-[#1e1f24] rounded-3xl p-6 border border-[#2a2a2a] h-full shadow-lg flex flex-col">
      
      <div className="flex justify-between items-center mb-8">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Product</div>
        <div className="text-gray-500 cursor-pointer hover:text-white pb-2">...</div>
      </div>

      <div className="flex-1 flex items-center justify-between px-2 relative h-[180px]">
        {/* Background dotted line */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-[#333] -translate-y-1/2 z-0"></div>

        {pillData.map((item) => (
          <div key={item.id} className="relative z-10 flex flex-col items-center h-full justify-center w-8 group">
            {/* Top Pill */}
            <div 
              className={cn("w-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-transform shadow-md", getColorCode(item.topColor))}
              style={{ height: '50px', transform: `translateY(${item.offsetTop}px)` }}
            >
              {item.topVal}
            </div>
            
            {/* Center connector dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#444] my-2 absolute top-1/2 -translate-y-1/2 z-20 group-hover:bg-white transition-colors"></div>
            
            {/* Bottom Pill */}
            <div 
              className={cn("w-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-transform shadow-md", getColorCode(item.bottomColor))}
              style={{ height: '40px', transform: `translateY(${item.offsetBottom}px)` }}
            >
              {item.bottomVal}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Resources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9df854] ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Valid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fca016] ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Invalid</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total: 1,012
        </div>
      </div>

    </div>
  );
};

export default PillBarWidget;
