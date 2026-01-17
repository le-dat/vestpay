const Logo = () => {
  return (
    <div className="flex items-center gap-3.5 group cursor-pointer transition-opacity hover:opacity-90">
      <div className="relative w-12 h-12 flex-shrink-0">
        <div className="w-full h-full bg-[#00d084] rounded-[14px] overflow-hidden shadow-lg shadow-[#00d084]/20 flex items-center justify-center">
          {/* Logo Icon Content */}
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <path
              d="M5 7L12 19L19 7"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 13H15.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className="text-[20px] font-black tracking-tighter text-[#111827]">
              Vest
            </span>
            <span className="text-[20px] font-black tracking-tighter text-[#00d084]">
              Pay
            </span>
          </div>
          <div className="px-1.5 py-0.5 rounded-[6px] bg-[#00d084]/10 text-[#00d084] text-[9px] font-bold uppercase tracking-[0.05em] h-fit mt-1">
            Beta
          </div>
        </div>
        <div className="w-10 h-[3.5px] bg-[#00d084] rounded-full mt-[-4px]" />
      </div>
    </div>
  );
};

export default Logo;
