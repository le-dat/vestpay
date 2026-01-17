const Logo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-10 h-10">
        <div className="relative w-full h-full bg-linear-to-br from-primary via-primary to-primary/80 rounded-lg overflow-hidden shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
          <svg viewBox="0 0 24 24" fill="none" className="relative w-full h-full p-2">
            <path d="M4 4 L12 20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />

            <path d="M20 4 L12 20" stroke="white" strokeWidth="2.5" strokeLinecap="square" />

            <path d="M6 12 L18 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

            <path
              d="M17 10 L19 12 L17 14"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          <div className="absolute top-0 right-0 w-2 h-2 bg-white/40 rounded-bl-sm" />

          <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/40 rounded-tr-sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="flex items-baseline gap-[1px]">
            <span className="text-2xl font-black tracking-tighter text-foreground/95 relative">
              Vest
              <div className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary" />
            </span>
            <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Pay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
