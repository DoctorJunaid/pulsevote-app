import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', web: 30, radio: 45 },
  { name: 'Feb', web: 25, radio: 40 },
  { name: 'Mar', web: 45, radio: 20 },
  { name: 'Apr', web: 30, radio: 35 },
  { name: 'May', web: 55, radio: 40 },
  { name: 'Jun', web: 45, radio: 50 },
  { name: 'Jul', web: 60, radio: 45 },
  { name: 'Aug', web: 50, radio: 40 },
  { name: 'Sep', web: 65, radio: 35 },
];

const CustomerWidget = () => {
  return (
    <div className="bg-[#1e1f24] rounded-3xl p-5 border border-[#2a2a2a] h-full shadow-lg flex flex-col relative group">
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Customer</div>
        <div className="text-gray-500 cursor-pointer hover:text-white pb-2">...</div>
      </div>

      <div className="flex gap-8 mb-2 relative z-10">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#9df854]"></div>
          </div>
          <div className="text-3xl font-bold text-white mb-0.5 tracking-tighter">2,4%</div>
          <div className="text-[10px] text-gray-500 font-medium">Web Surfing</div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#fca016]"></div>
          </div>
          <div className="text-3xl font-bold text-white mb-0.5 tracking-tighter">1,1%</div>
          <div className="text-[10px] text-gray-500 font-medium">Radio Station</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[100px] px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="web" stroke="#9df854" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="radio" stroke="#fca016" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerWidget;
