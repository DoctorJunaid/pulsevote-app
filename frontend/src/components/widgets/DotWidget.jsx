import React from 'react';

// Generates the pattern of dots seen in the design
const generateDots = () => {
  const cols = 18;
  const rows = 4;
  const dots = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let colorClass = "bg-[#2a2a2a]"; // default dark gray
      
      // Add some color variance to match the visual
      if (r > 1 && c > 5 && c < 15) {
        if (Math.random() > 0.5) colorClass = "bg-[#fca016]";
        else if (Math.random() > 0.7) colorClass = "bg-[#9df854]";
        else colorClass = "bg-white";
      } else if (r === 3 && c % 3 === 0) {
        colorClass = "bg-[#fca016]";
      } else if (r === 2 && c % 4 === 0) {
        colorClass = "bg-white";
      }

      dots.push(
        <div key={`${r}-${c}`} className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
      );
    }
  }
  return dots;
};

const DotWidget = () => {
  return (
    <div className="bg-[#1e1f24] rounded-3xl p-5 border border-[#2a2a2a] h-full shadow-lg flex flex-col justify-between">
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Product</div>
          <div className="text-gray-500 cursor-pointer hover:text-white pb-2">...</div>
        </div>

        <div className="flex gap-8 mb-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#9df854]"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-0.5 tracking-tighter">2,8%</div>
            <div className="text-[10px] text-gray-500 font-medium">Partners</div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#fca016]"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-0.5 tracking-tighter">3,2%</div>
            <div className="text-[10px] text-gray-500 font-medium">Owners</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(18,1fr)] gap-y-2 mt-auto pb-2">
        {generateDots()}
      </div>

    </div>
  );
};

export default DotWidget;
