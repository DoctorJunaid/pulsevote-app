import React from 'react';
import { cn } from '../../utils/cn';

// Hardcoded data to match visual
const timelineData = [
  { id: 1, date: '30.09', color: 'bg-[#9df854]', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-shazam-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-6-pack-logos-icons-2945143.png', value: '16', start: 10, width: 40, textColor: 'text-black' },
  { id: 2, date: '29.09', color: 'bg-[#fca016]', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-xbox-logo-icon-download-in-svg-png-gif-file-formats--brand-social-media-company-vol-7-pack-logos-icons-2945281.png', value: '29', start: 60, width: 35, textColor: 'text-black' },
  { id: 3, date: '28.09', color: 'bg-white', avatars: true, value: '15', start: 20, width: 40, textColor: 'text-black' },
  { id: 4, date: '27.09', color: 'bg-[#9df854]', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-dribbble-logo-icon-download-in-svg-png-gif-file-formats--social-media-vol-2-pack-logos-icons-2944837.png', value: '21', start: 30, width: 45, textColor: 'text-black' },
  { id: 5, date: '26.09', color: 'bg-white', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-discord-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-2-pack-logos-icons-2944836.png', value: '10', start: 5, width: 35, textColor: 'text-black' },
  { id: 6, date: '25.09', color: 'bg-[#fca016]', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-facebook-logo-icon-download-in-svg-png-gif-file-formats--social-media-vol-2-pack-logos-icons-2944840.png', value: '15', start: 35, width: 30, textColor: 'text-black' },
  { id: 7, date: '24.09', color: 'bg-[#9df854]', avatars: true, value: '19', start: 45, width: 45, textColor: 'text-black' },
  { id: 8, date: '', color: 'bg-white', iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-twitter-logo-icon-download-in-svg-png-gif-file-formats--social-media-vol-7-pack-logos-icons-2945279.png', value: '8', start: 30, width: 25, textColor: 'text-black' },
];

const TimelineWidget = () => {
  return (
    <div className="bg-[#1e1f24] rounded-3xl p-6 border border-[#2a2a2a] h-full shadow-lg flex flex-col relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-8 relative z-20">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Projects Timeline</div>
        <div className="text-gray-500 cursor-pointer hover:text-white pb-2">...</div>
      </div>

      <div className="flex-1 relative flex flex-col justify-between">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 z-0 flex justify-between px-16">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-full border-l border-dashed border-[#333]"></div>
          ))}
        </div>

        {/* Timeline Rows */}
        <div className="relative z-10 flex flex-col gap-4">
          {timelineData.map((row) => (
            <div key={row.id} className="flex items-center h-8 relative">
              <div className="w-12 text-[10px] font-bold text-gray-400">{row.date}</div>
              
              <div className="flex-1 relative h-full flex items-center ml-4">
                <div 
                  className={cn("h-7 rounded-full flex items-center px-1 shadow-md", row.color)}
                  style={{ 
                    position: 'absolute', 
                    left: `${row.start}%`, 
                    width: `${row.width}%`,
                    minWidth: '70px'
                  }}
                >
                  {row.iconUrl && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden ml-0.5">
                      <img src={row.iconUrl} alt="icon" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {row.avatars && (
                    <div className="flex -space-x-1.5 ml-1">
                       <div className="w-5 h-5 rounded-full bg-blue-500 border border-white"></div>
                       <div className="w-5 h-5 rounded-full bg-purple-500 border border-white"></div>
                       <div className="w-5 h-5 rounded-full bg-pink-500 border border-white"></div>
                    </div>
                  )}
                  <div className={cn("ml-auto text-[10px] font-bold pr-2", row.textColor)}>
                    {row.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Axis */}
      <div className="flex justify-between pl-16 pr-2 mt-4 z-20 border-t border-[#333] pt-4">
        <div className="text-[10px] text-gray-500 font-bold">0</div>
        <div className="text-[10px] text-gray-500 font-bold">5</div>
        <div className="text-[10px] text-gray-500 font-bold">10</div>
        <div className="text-[10px] text-gray-500 font-bold">15</div>
        <div className="text-[10px] text-gray-500 font-bold">20</div>
        <div className="text-[10px] text-gray-500 font-bold">25</div>
        <div className="text-[10px] text-gray-500 font-bold">30</div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-6 z-20">
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9df854] ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Customer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fca016] ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Product</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-[#2a2a2a]"></div>
            <span className="text-xs text-gray-400 font-medium">Web</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total: 284
        </div>
      </div>

    </div>
  );
};

export default TimelineWidget;
